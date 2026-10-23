<script
    setup
    lang="ts"
    generic="TItem, TShape extends Record<string, z.ZodType>"
>
    import type { DebounceFilterOptions } from "@vueuse/core";
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import type { z } from "zod";
    import type {
        FilterFields,
        FilterValues,
    } from "@/components/shared/filters/types";
    import { Primitive } from "reka-ui";
    import { cn } from "@/lib/utils";

    type Values = FilterValues<TShape>;
    type FieldKey = Extract<keyof Values, string>;
    type ActiveValues = Partial<Values>;

    interface Props extends Omit<PrimitiveProps, "asChild"> {
        items: MaybeRefOrGetter<TItem[] | undefined>;
        fields: MaybeRefOrGetter<FilterFields<TItem, TShape>>;
        class?: HTMLAttributes["class"];
        debounce?: { ms?: number } & DebounceFilterOptions;
    }

    const props = withDefaults(defineProps<Props>(), {
        as: "div",
    });

    const fields = computed(() => toValue(props.fields));
    const keys = computed<FieldKey[]>(
        () => Object.keys(fields.value) as FieldKey[],
    );

    const queries = computed(
        () =>
            Object.fromEntries(
                keys.value
                    .filter((key) => fields.value[key]?.sync)
                    .map((key) => [key, useRouteQuery(key.toString())]),
            ) as { [K in FieldKey]: Ref<ActiveValues[K]> },
    );

    const model = defineModel<NoInfer<ActiveValues>>({
        default: () => ({}),
        get(value) {
            const parsed: ActiveValues = {};

            for (const key of keys.value) {
                const raw = queries.value[key]?.value;
                const result = fields.value[key]?.schema.safeParse(
                    raw ?? undefined,
                );

                if (result?.success && result.data !== undefined) {
                    parsed[key] = result.data;
                    continue;
                }

                if (value?.[key] !== undefined) {
                    parsed[key] = value[key];
                    continue;
                }

                const initialValue = fields.value[key]?.initialValue;
                if (initialValue !== undefined) {
                    parsed[key] = initialValue;
                }
            }

            return parsed;
        },
        set(value) {
            for (const key of keys.value) {
                const query = queries.value[key];
                if (!query) {
                    continue;
                }

                query.value = value[key] ?? undefined;
            }

            return value;
        },
    });

    const debounced = refDebounced(model, props.debounce?.ms ?? 1000, {
        ...props.debounce,
    });

    const filtered = computed(() => {
        const data = toValue(props.items) ?? [];
        const activeKeys = keys.value.filter(
            (key) => debounced.value[key] !== undefined,
        );

        if (activeKeys.length === 0) {
            return data;
        }

        return data.filter((item) =>
            activeKeys.every((key) => {
                const def = fields.value[key];
                const value = debounced.value[key];

                if (!def?.predicate || value === undefined) {
                    return true;
                }

                return def.predicate({ item, value });
            }),
        );
    });

    function set<K extends FieldKey>(
        key: K,
        value: ActiveValues[K] | undefined,
    ) {
        if (value === undefined) {
            reset(key);
            return;
        }

        model.value[key] = value;
    }

    function reset(key?: FieldKey) {
        if (key) {
            const next = { ...model.value };
            delete next[key];
            model.value = next;
            return;
        }

        model.value = {};
    }
</script>

<template>
    <Primitive :as="as" :class="cn('flex flex-wrap gap-2 w-full', props.class)">
        <slot
            v-bind="{ keys, fields, model, debounced, filtered, set, reset }"
        />
    </Primitive>
</template>
