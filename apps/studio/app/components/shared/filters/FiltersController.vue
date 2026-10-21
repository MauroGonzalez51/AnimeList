<script
    setup
    lang="ts"
    generic="TData extends Record<string, any>, TSchema extends z.ZodObject"
>
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import type { z } from "zod";
    import type { FiltersContext } from "./types";
    import { Primitive } from "reka-ui";
    import { cn } from "~/lib/utils";
    import { FILTERS_CONTEXT } from "./types";

    type State = Partial<z.infer<TSchema>>;

    interface Props extends Omit<PrimitiveProps, "asChild"> {
        items: MaybeRefOrGetter<TData[] | undefined>;
        schema: MaybeRefOrGetter<TSchema>;
        predicates?: {
            [K in keyof State]?: (
                item: TData,
                value: NonNullable<State[K]>,
            ) => boolean;
        };
        class?: HTMLAttributes["class"];
    }

    const props = withDefaults(defineProps<Props>(), {
        as: "div",
    });

    defineSlots<{
        default: (props: {
            items: TData[];
            keys: (keyof State & string)[];
            state: State;
            activeCount: number;
            reset: () => void;
        }) => VNode[];
    }>();

    const model = defineModel<State>({ default: () => ({}) });

    const fields = computed(
        () => toValue(props.schema).shape as Record<string, z.ZodType>,
    );
    const keys = computed(
        () => Object.keys(fields.value) as (keyof State & string)[],
    );

    const queries = Object.fromEntries(
        keys.value.map((key) => [key, useRouteQuery<unknown>(key)]),
    );

    const state = computed(() => {
        const parsed: Record<string, unknown> = {};

        for (const key of keys.value) {
            const raw = queries[key]?.value;
            const result = fields.value[key]?.safeParse(raw ?? undefined);

            if (result?.success && result.data !== undefined) {
                parsed[key] = result.data;
            }
        }

        return parsed as State;
    });

    function serialize(value: unknown) {
        if (value === undefined || value === null) {
            return null;
        }

        return Array.isArray(value) ? value.map(String) : String(value);
    }

    function same(a: unknown, b: unknown) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    watch(
        state,
        (value) => {
            if (!same(value, model.value)) {
                model.value = value;
            }
        },
        { immediate: true },
    );

    watch(
        model,
        (value) => {
            for (const key of keys.value) {
                const next = serialize(value[key]);

                if (!same(next, queries[key]?.value)) {
                    queries[key]!.value = next;
                }
            }
        },
        { deep: true },
    );

    const activeCount = computed(() => Object.keys(state.value).length);

    const filtered = computed(() => {
        const entries = Object.entries(state.value) as [
            keyof State & string,
            NonNullable<State[keyof State]>,
        ][];

        return (toValue(props.items) ?? []).filter((item) =>
            entries.every(([key, value]) => {
                const predicate = props.predicates?.[key];

                if (predicate) {
                    return predicate(item, value);
                }

                return Array.isArray(value)
                    ? value.includes(item[key])
                    : item[key] === value;
            }),
        );
    });

    function set(key: string, value: unknown) {
        model.value = { ...model.value, [key]: value };
    }

    function reset(key?: string) {
        if (key) {
            const { [key as keyof State]: _, ...rest } = model.value;
            model.value = rest as State;
            return;
        }

        model.value = {};
    }

    provide<FiltersContext>(FILTERS_CONTEXT, {
        keys: keys as ComputedRef<string[]>,
        state: state as ComputedRef<Record<string, unknown>>,
        fields,
        set,
        reset,
    });
</script>

<template>
    <Primitive :as="as" :class="cn('flex flex-wrap gap-2 w-full', props.class)">
        <slot
            :items="filtered"
            :keys="keys"
            :state="state"
            :active-count="activeCount"
            :reset="() => reset()"
        />
    </Primitive>
</template>
