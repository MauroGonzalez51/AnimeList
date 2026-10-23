<script
    setup
    lang="ts"
    generic="TData, Fields extends Record<string, FieldDefinition<TData>>"
>
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import type {
        FieldDefinition,
        FieldsData,
    } from "@/components/shared/filters/types";
    import { Primitive } from "reka-ui";
    import { cn } from "@/lib/utils";

    type Data = FieldsData<TData, Fields>;
    type DataKey = Extract<keyof Data, string>;
    type State = Partial<Data>;

    interface Props extends Omit<PrimitiveProps, "asChild"> {
        items: MaybeRefOrGetter<TData[] | undefined>;
        fields: MaybeRefOrGetter<Fields>;
        class?: HTMLAttributes["class"];
    }

    const props = withDefaults(defineProps<Props>(), {
        as: "div",
    });

    const fields = computed(() => toValue(props.fields));
    const keys = computed(() => Object.keys(fields.value) as DataKey[]);

    const queries = computed(
        () =>
            Object.fromEntries(
                keys.value
                    .filter((key) => fields.value[key]?.sync)
                    .map((key) => [key, useRouteQuery(key.toString())]),
            ) as { [K in DataKey]: Ref<State[K]> },
    );

    const model = defineModel<State>({
        default: () => ({}),
        get(value) {
            const parsed: State = {};

            for (const key of keys.value) {
                const raw = queries.value[key]?.value;
                const result = fields.value[key]?.schema.safeParse(
                    raw ?? undefined,
                );

                if (result?.success && result.data !== undefined) {
                    parsed[key] = result.data as Data[typeof key];
                    continue;
                }

                if (value?.[key] !== undefined) {
                    parsed[key] = value[key];
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

    const filtered = computed(() => {
        const data = toValue(props.items) ?? [];
        const activeKeys = keys.value.filter(
            (key) => model.value[key] !== undefined,
        );

        if (activeKeys.length === 0) {
            return data;
        }

        return data.filter((item) =>
            activeKeys.every((key) => {
                const def = fields.value[key];
                const value = model.value[key];

                if (!def?.predicate || value === undefined) {
                    return true;
                }

                return def.predicate({ item, value });
            }),
        );
    });

    function set<K extends DataKey>(key: K, value: State[K] | undefined) {
        if (value === undefined) {
            reset(key);
            return;
        }

        model.value[key] = value;
    }

    function reset(key?: DataKey) {
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
        <slot v-bind="{ fields, model, filtered, set, reset }" />
    </Primitive>
</template>
