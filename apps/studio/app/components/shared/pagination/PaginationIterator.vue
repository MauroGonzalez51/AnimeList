<script setup lang="ts" generic="TData">
    import { usePaginationControls } from "@/components/shared/pagination/injection-state";

    interface Props {
        items?: MaybeRefOrGetter<TData[] | undefined>;
        index?: keyof TData;
    }

    interface Slots {
        item: (props: TData & { $item: TData; $index: number }) => VNode[];
    }

    defineProps<Props>();
    defineSlots<Slots>();

    const { items, index } = usePaginationControls<TData>();

    function _key(item: TData) {
        return String(item[index]);
    }
</script>

<template>
    <template v-for="(item, itemIndex) in items" :key="_key(item)">
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
