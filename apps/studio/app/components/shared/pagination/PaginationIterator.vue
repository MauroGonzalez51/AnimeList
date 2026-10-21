<script setup lang="ts" generic="TData">
    import { usePaginationControls } from "@/components/shared/pagination/injection-state";

    interface Props {
        items?: MaybeRefOrGetter<TData[] | undefined>;
        index?: keyof TData;
    }

    interface Slots {
        item: (props: TData & { $item: TData; $index: number }) => VNode[];
    }

    const props = defineProps<Props>();
    defineSlots<Slots>();

    const state = usePaginationControls<TData>();

    const items = computed(() => state.items.value || toValue(props.items));
    const index = computed(() => state.index ?? props.index);
</script>

<template>
    <template v-for="(item, itemIndex) in items" :key="String(item[index])">
        <slot
            name="item"
            v-bind="{
                ...item,
                $item: item,
                $index: itemIndex,
            }"
        />
    </template>
</template>
