<script
    setup
    lang="ts"
    generic="TData extends Record<string, unknown>, TSchema extends z.ZodObject"
>
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import type { z } from "zod";
    import type {
        FilterKey,
        FiltersContext,
    } from "@/components/shared/filters/types";
    import { isEqual } from "es-toolkit/compat";
    import { Primitive } from "reka-ui";
    import { FILTERS_CONTEXT } from "@/components/shared/filters/types";
    import { cn } from "~/lib/utils";

    type Data = z.infer<TSchema>;
    type SchemaKey = FilterKey<Data>;
    type State = Partial<Data>;

    interface Props extends Omit<PrimitiveProps, "asChild"> {
        items: MaybeRefOrGetter<TData[] | undefined>;
        schema: MaybeRefOrGetter<TSchema>;
        predicates?: {
            [K in SchemaKey]?: (
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
            keys: SchemaKey[];
            state: State;
            activeCount: number;
            reset: () => void;
        }) => VNode[];
    }>();

    const model = defineModel<State>({ default: () => ({}) });

    const fields = computed<Record<SchemaKey, z.ZodType>>(() => {
        const shape = toValue(props.schema).shape;
        return Object.fromEntries(
            Object.keys(shape).map((key) => [key, shape[key]]),
        ) as Record<SchemaKey, z.ZodType>;
    });
    const keys = computed<SchemaKey[]>(
        () => Object.keys(fields.value) as SchemaKey[],
    );

    const queries = Object.fromEntries(
        keys.value.map((key) => [key, useRouteQuery<unknown>(key)]),
    ) as Record<SchemaKey, ReturnType<typeof useRouteQuery<unknown>>>;

    const state = computed(() => {
        const parsed: Record<SchemaKey, unknown> = {};

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

        if (Array.isArray(value)) {
            return value.map(String);
        }

        return String(value);
    }

    watch(
        state,
        (value) => {
            if (!isEqual(value, model.value)) {
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

                if (!isEqual(next, queries[key]?.value)) {
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

                if (Array.isArray(value)) {
                    return value.some((entry) => isEqual(entry, item[key]));
                }

                return item[key] === value;
            }),
        );
    });

    function set<K extends SchemaKey>(key: K, value: Data[K] | undefined) {
        if (value === undefined) {
            reset(key);
            return;
        }

        model.value = { ...model.value, [key]: value };
    }

    function reset(key?: SchemaKey) {
        if (key) {
            const next = { ...model.value };
            delete next[key];
            model.value = next;
            return;
        }

        model.value = {};
    }

    provide<FiltersContext<Data, SchemaKey>>(FILTERS_CONTEXT, {
        keys,
        state,
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
