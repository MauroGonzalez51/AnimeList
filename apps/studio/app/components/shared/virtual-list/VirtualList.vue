<script setup lang="ts" generic="T">
    import type { HTMLAttributes } from "vue";
    import { useVirtualList } from "@vueuse/core";
    import { cn } from "~/lib/utils";

    interface Props {
        items: MaybeRef<T[]>;
        itemHeight: number;
        itemKey: (item: T) => string | number;
        overscan?: number;
        class?: HTMLAttributes["class"];
    }

    interface Slots {
        item: (props: { item: T; index: number }) => unknown;
    }

    const props = withDefaults(defineProps<Props>(), { overscan: 5 });
    defineSlots<Slots>();

    const { list, containerProps, wrapperProps } = useVirtualList(props.items, {
        itemHeight: props.itemHeight,
        overscan: props.overscan,
    });
</script>

<template>
    <div v-bind="containerProps" :class="cn('min-h-0', props.class)">
        <div v-bind="wrapperProps">
            <div
                v-for="{ data, index } in list"
                :key="itemKey(data)"
                :style="{ height: `${itemHeight}px` }"
            >
                <slot name="item" :item="data" :index="index" />
            </div>
        </div>
    </div>
</template>
