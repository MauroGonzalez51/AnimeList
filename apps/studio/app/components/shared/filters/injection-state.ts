import type { DebounceFilterOptions } from "@vueuse/core";
import type { z } from "zod";
import type {
    FilterField,
    FilterFields,
    FilterValues,
} from "@/components/shared/filters/types";
import { isEqual } from "es-toolkit";

type Shape = Record<string, z.ZodType>;
type ActiveValues<TShape extends Shape> = Partial<FilterValues<TShape>>;
export type FieldKey<TShape extends Shape> = Extract<
    keyof FilterValues<TShape>,
    string
>;

interface DebounceOptions extends DebounceFilterOptions {
    ms?: number;
}

interface Args<TItem, TShape extends Shape> {
    items: MaybeRefOrGetter<TItem[] | undefined>;
    debounce?: DebounceOptions;
    fields: FilterFields<TItem, TShape>;
    keys: FieldKey<TShape>[];
    queries: { [K in FieldKey<TShape>]: Ref<ActiveValues<TShape>[K]> };
    model: Ref<ActiveValues<TShape>>;
}

function defaultShouldReset(value: unknown) {
    return Array.isArray(value) && value.length === 0;
}

function isActive<TItem, TSchema extends z.ZodType>(
    definition: FilterField<TItem, TSchema>,
    args: { item: TItem; value: z.output<TSchema> },
) {
    if (typeof definition.active === "function") {
        return definition.active(args);
    }

    return definition.active ?? true;
}

function _state<TItem, TShape extends Shape>(args: Args<TItem, TShape>) {
    const debounced = refDebounced(args.model, args.debounce?.ms ?? 1000, {
        ...args.debounce,
    });

    const filtered = computed(() => {
        const data = toValue(args.items) ?? [];
        const activeKeys = args.keys.filter(
            (key) => debounced.value[key] !== undefined,
        );

        if (!activeKeys.length) {
            return data;
        }

        const checks = activeKeys.flatMap((key) => {
            const definition = args.fields[key];
            const value = debounced.value[key];
            const predicate = definition.predicate;
            if (!value || !predicate) {
                return [];
            }

            return [{ definition, predicate, value }];
        });

        return data.filter((item) =>
            checks.every(({ definition, predicate, value }) => {
                if (!isActive(definition, { item, value })) {
                    return true;
                }

                return predicate({ item, value }) ?? true;
            }),
        );
    });

    const loading = computed(() => !isEqual(args.model.value, debounced.value));

    function set<K extends FieldKey<TShape>>(
        key: K,
        value: ActiveValues<TShape>[K] | undefined,
        options?: { shouldReset?: (value: ActiveValues<TShape>[K]) => boolean },
    ) {
        const shouldReset = options?.shouldReset ?? defaultShouldReset;

        if (value === undefined || shouldReset(value)) {
            reset(key);
            return;
        }

        args.model.value = { ...args.model.value, [key]: value };
    }

    function reset(key?: FieldKey<TShape>) {
        if (key) {
            const next = { ...args.model.value };
            delete next[key];
            args.model.value = next;
            return;
        }

        args.model.value = {};
    }

    return {
        fields: args.fields,
        keys: args.keys,
        queries: args.queries,
        model: args.model,
        debounced,
        filtered,
        loading,
        dispatch: {
            set,
            reset,
        },
    };
}

type _ReturnType<TItem, TShape extends Shape> = ReturnType<
    typeof _state<TItem, TShape>
>;

const [_provide, _use] = createInjectionState(_state);

function useFiltersController<TItem, TShape extends Shape>() {
    const state = _use();
    if (!state) {
        throw createError({
            fatal: true,
            statusText: "use of shared state before injection",
        });
    }

    return state as _ReturnType<TItem, TShape>;
}

useFiltersController.provide = <TItem, TShape extends Shape>(
    args: Args<TItem, TShape>,
) =>
    _provide(
        args as Args<unknown, Record<string, z.ZodType<unknown>>>,
    ) as _ReturnType<TItem, TShape>;

export { useFiltersController };
