<script setup lang="ts" generic="TData">
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import { Primitive } from "reka-ui";
    import { usePaginationControls } from "@/components/shared/pagination/injection-state";
    import { cn } from "@/lib/utils";

    interface Props {
        items: MaybeRefOrGetter<TData[] | undefined>;
        index: keyof TData;
        page: MaybeRefOrGetter<number>;
        pageSize: number;
        class?: HTMLAttributes["class"];
        containerAs?: PrimitiveProps["as"];
    }

    interface Emits {
        changePage: [page: number];
    }

    interface Slots {
        empty: () => VNode[];
        item: (props: TData & { $item: TData; $index: number }) => VNode[];
    }

    const props = withDefaults(defineProps<Props>(), {
        containerAs: "div",
    });
    const emit = defineEmits<Emits>();
    defineSlots<Slots>();

    const { items, page } = usePaginationControls.provide({
        items: props.items,
        index: props.index,
        page: props.page,
        pageSize: props.pageSize,
    });

    const visibleItems = computed(() => {
        if (!items.value?.length) {
            return [];
        }

        const startIndex = (page.value - 1) * props.pageSize;
        return items.value.slice(startIndex, startIndex + props.pageSize);
    });

    function changePage(newPage: number) {
        if (newPage === page.value) {
            return;
        }

        emit("changePage", newPage);
    }
</script>

<template>
    <section class="flex flex-col grow h-full space-y-2">
        <template v-if="!items || items.length === 0">
            <slot name="empty" />
        </template>

        <template v-else>
            <Primitive :as="containerAs" :class="cn('w-full', props.class)">
                <template
                    v-for="(item, itemIndex) in visibleItems"
                    :key="String(item[props.index])"
                >
                    <slot
                        name="item"
                        v-bind="{
                            ...item,
                            $item: item,
                            $index: itemIndex,
                        }"
                    />
                </template>
            </Primitive>
        </template>

        <PaginationControls @change-page="(page) => changePage(page)" />
    </section>
</template>
