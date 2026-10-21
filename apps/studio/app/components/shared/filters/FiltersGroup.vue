<script setup lang="ts" generic="TKey extends string">
    import type { HTMLAttributes } from "vue";
    import type { FilterFieldProps } from "./types";
    import { cn } from "~/lib/utils";
    import { FILTERS_CONTEXT } from "./types";

    interface Props {
        keys?: TKey[];
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    defineSlots<{ [K in TKey]: (props: FilterFieldProps) => any }>();

    const ctx = inject(FILTERS_CONTEXT);

    if (!ctx) {
        throw new Error("FiltersGroup must be used inside FiltersController");
    }

    const visible = computed(() => props.keys ?? (ctx.keys.value as TKey[]));

    const fieldProps = (key: TKey): FilterFieldProps => ({
        modelValue: ctx.state.value[key],
        "onUpdate:modelValue": (value) => ctx.set(key, value),
        reset: () => ctx.reset(key),
        isActive: ctx.state.value[key] !== undefined,
        schema: ctx.fields.value[key]!,
    });
</script>

<template>
    <div :class="cn('flex flex-wrap gap-2', props.class)">
        <template v-for="key in visible" :key>
            <slot :name="key" v-bind="fieldProps(key)" />
        </template>
    </div>
</template>
