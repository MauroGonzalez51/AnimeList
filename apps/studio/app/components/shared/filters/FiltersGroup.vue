<script setup lang="ts" generic="TKey extends string">
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import { Primitive } from "reka-ui";
    import { cn } from "~/lib/utils";

    interface Props extends Omit<PrimitiveProps, "asChild"> {
        keys: TKey[];
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();
    defineSlots<{ [K in TKey]: (props: { key: K }) => VNode[] }>();
</script>

<template>
    <Primitive :as="as" :class="cn('flex flex-wrap gap-2', props.class)">
        <template v-for="key in keys" :key="key">
            <slot :name="key" v-bind="{ key }">
                {{ key }}
            </slot>
        </template>
    </Primitive>
</template>
