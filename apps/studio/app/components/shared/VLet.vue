<script setup lang="ts" generic="T extends Record<string, unknown>">
    interface Props<T> {
        vars: T;
    }

    const props = defineProps<Props<T>>();

    defineSlots<{ default: (props: T) => VNode[] }>();
</script>

<template>
    <slot v-bind="props.vars" />
</template>
