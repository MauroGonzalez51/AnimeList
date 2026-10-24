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
    import { useFiltersController } from "@/components/shared/filters/injection-state";
    import { cn } from "@/lib/utils";

    type Values = FilterValues<TShape>;
    type FieldKey = Extract<keyof Values, string>;
    type ActiveValues = Partial<Values>;

    interface Props extends Omit<PrimitiveProps, "asChild"> {
        items: MaybeRefOrGetter<TItem[] | undefined>;
        fields: FilterFields<TItem, TShape>;
        class?: HTMLAttributes["class"];
        debounce?: { ms?: number } & DebounceFilterOptions;
    }

    interface Emits {
        change: [value: ActiveValues];
    }

    const props = withDefaults(defineProps<Props>(), {
        as: "div",
    });

    const emit = defineEmits<Emits>();

    const keys = Object.keys(props.fields) as FieldKey[];

    const queries = Object.fromEntries(
        keys
            .filter((key) => props.fields[key]?.sync)
            .map((key) => [key, useRouteQuery(key.toString())]),
    ) as { [K in FieldKey]: Ref<ActiveValues[K]> };

    const model = defineModel<NoInfer<ActiveValues>>({
        default: () => ({}),
        get(value) {
            const parsed: ActiveValues = {};

            for (const key of keys) {
                const raw = queries[key]?.value;
                const result = props.fields[key]?.schema.safeParse(
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

                const initialValue = props.fields[key]?.initialValue;
                if (initialValue !== undefined) {
                    parsed[key] = initialValue;
                }
            }

            return parsed;
        },
        set(value) {
            for (const key of keys) {
                const query = queries[key];
                if (!query) {
                    continue;
                }

                query.value = value[key] ?? undefined;
            }

            return value;
        },
    });

    const { debounced, filtered, dispatch, loading } =
        useFiltersController.provide({
            items: () => toValue(props.items),
            debounce: props.debounce,
            fields: props.fields,
            keys,
            queries,
            model,
        });

    watch(debounced, () => emit("change", debounced.value));
</script>

<template>
    <Primitive :as="as" :class="cn('w-full', props.class)">
        <slot
            v-bind="{
                keys,
                fields: props.fields,
                model,
                debounced,
                filtered,
                dispatch,
                loading,
            }"
        />
    </Primitive>
</template>
