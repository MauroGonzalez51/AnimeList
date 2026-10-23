<script setup lang="ts" generic="TKey extends string">
    import type { HTMLAttributes } from "vue";
    import type {
        FilterFieldProps,
        FiltersContext,
    } from "@/components/shared/filters/types";
    import { FILTERS_CONTEXT } from "@/components/shared/filters/types";
    import { cn } from "~/lib/utils";

    interface Props {
        keys?: TKey[];
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    defineSlots<{
        [K in TKey]: (props: FilterFieldProps) => VNode[];
    }>();

    const ctx = inject(FILTERS_CONTEXT) as
        FiltersContext<Record<TKey, unknown>, TKey> | undefined;

    if (!ctx) {
        throw createError({ fatal: true });
    }

    const visible = computed(() => props.keys ?? ctx.keys.value);

    function fieldProps(key: TKey): FilterFieldProps {
        if (!ctx) {
            throw createError({ fatal: true });
        }

        return {
            modelValue: ctx.state.value[key],
            "onUpdate:modelValue": (value) => ctx.set(key, value),
            reset: () => ctx.reset(key),
            isActive: ctx.state.value[key] !== undefined,
            schema: ctx.fields.value[key]!,
        };
    }
</script>

<template>
    <div :class="cn('flex flex-wrap gap-2', props.class)">
        <template v-for="key in visible" :key>
            <slot :name="key" v-bind="fieldProps(key)" />
        </template>
    </div>
</template>
