<script
    setup
    lang="ts"
    generic="
        TData,
        Shape extends Record<string, z.ZodType>,
        TSchema extends z.ZodObject<Shape>
    "
>
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import type { z } from "zod";
    import { Primitive } from "reka-ui";
    import { cn } from "~/lib/utils";

    type Data = {
        [K in keyof Shape]: z.output<Shape[K]>;
    };
    type DataKey = Extract<keyof Data, string>;
    type State = Partial<Data>;

    interface Props extends Omit<PrimitiveProps, "asChild"> {
        items: MaybeRefOrGetter<TData[] | undefined>;
        schema: MaybeRefOrGetter<TSchema>;
        class?: HTMLAttributes["class"];
    }

    const props = withDefaults(defineProps<Props>(), {
        as: "div",
    });

    const schema = computed(() => toValue(props.schema));

    const keys = computed<DataKey[]>(
        () => Object.keys(schema.value.shape) as DataKey[],
    );
    const fields = computed(() => schema.value.shape as Shape);

    const queries = computed(() => {
        return Object.fromEntries(
            keys.value.map((key) => [key, useRouteQuery(key.toString())]),
        ) as Record<DataKey, ReturnType<typeof useRouteQuery>>;
    });

    const model = defineModel<State>({
        default: () => ({}),
        get(value) {
            const parsed: State = {};

            for (const key of keys.value) {
                const raw = queries.value[key]?.value;
                const result = fields.value[key]?.safeParse(raw ?? undefined);

                if (result?.success) {
                    parsed[key] = result.data as z.infer<Shape[typeof key]>;
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
                    return;
                }

                query.value = value[key] ?? undefined;
            }
        },
    });

    onMounted(() => {
        // eslint-disable-next-line no-self-assign
        model.value = model.value;
    });
</script>

<template>
    <Primitive :as="as" :class="cn('flex flex-wrap gap-2 w-full', props.class)">
        <slot v-bind="{ fields, model }" />
    </Primitive>
</template>
