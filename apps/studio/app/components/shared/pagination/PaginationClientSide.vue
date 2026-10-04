<script setup lang="ts" generic="TData">
    import { cn } from "@/lib/utils";

    interface Props {
        items: MaybeRefOrGetter<TData[] | undefined>;
        index: keyof TData;
        page: MaybeRefOrGetter<number>;
        pageSize: number;
    }

    interface Emits {
        changePage: [page: number];
    }

    interface Slots {
        empty: () => VNode[];
        container: (props: {
            items: TData[] | undefined;
            changePage: (page: number) => void;
            page: number;
            totalPages: number;
            animations: ReturnType<typeof usePaginationAnimations>;
        }) => VNode[];
        item: (props: TData & { $item: TData; $index: number }) => VNode[];
    }

    type PaginationItem = { type: "item"; page: number } | { type: "ellipsis" };

    defineOptions({ inheritAttrs: false });
    const props = defineProps<Props>();
    const emit = defineEmits<Emits>();
    defineSlots<Slots>();

    const config = useAppConfig();

    const items = computed(() => toValue(props.items));
    const page = computed(() => toValue(props.page));
    const totalPages = computed(() => {
        if (!items.value?.length) {
            return 0;
        }

        return Math.ceil(items.value.length / props.pageSize);
    });

    const hasNext = computed(() => page.value < totalPages.value);
    const hasPrevious = computed(() => page.value > 1);

    const visibleItems = computed(() => {
        if (!items.value?.length) {
            return [];
        }

        const startIndex = (page.value - 1) * props.pageSize;
        return items.value.slice(startIndex, startIndex + props.pageSize);
    });
    const paginationItems = computed<PaginationItem[]>(() => {
        const result: PaginationItem[] = [];

        if (totalPages.value <= config.constants.pagination.MAX_ITEMS) {
            for (let i = 1; i <= totalPages.value; i++) {
                result.push({ type: "item", page: i });
            }

            return result;
        }

        result.push({ type: "item", page: 1 });

        let start = Math.max(2, page.value - 2);
        let end = Math.min(totalPages.value - 1, page.value + 2);

        if (start <= 2) {
            end = 5;
        }

        if (end >= totalPages.value - 1) {
            start = totalPages.value - 4;
        }

        if (start > 2) {
            result.push({ type: "ellipsis" });
        }

        for (let i = start; i <= end; i++) {
            result.push({ type: "item", page: i });
        }

        if (end < totalPages.value - 1) {
            result.push({ type: "ellipsis" });
        }

        result.push({ type: "item", page: totalPages.value });

        return result;
    });

    const animations = usePaginationAnimations();

    function changePage(newPage: number) {
        if (newPage === page.value) {
            return;
        }

        emit("changePage", newPage);
    }
</script>

<template>
    <section class="flex flex-col grow h-full space-y-2">
        <Transition
            mode="out-in"
            :css="false"
            @enter="animations.onStateEnter"
            @leave="animations.onStateLeave"
        >
            <template v-if="!items || items.length === 0">
                <slot name="empty" />
            </template>

            <template v-else>
                <slot
                    name="container"
                    v-bind="{
                        items,
                        changePage,
                        page,
                        totalPages,
                        animations,
                    }"
                >
                    <TransitionGroup
                        key="list"
                        tag="div"
                        v-bind="$attrs"
                        class="w-full"
                        :css="false"
                        @enter="animations.onItemEnter"
                        @leave="animations.onItemLeave"
                    >
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
                    </TransitionGroup>
                </slot>
            </template>
        </Transition>

        <Pagination
            v-if="totalPages > 1"
            :items-per-page="pageSize"
            class="mt-auto"
        >
            <PaginationContent
                class="px-12 py-2 rounded-lg bg-sidebar border-sidebar"
            >
                <PaginationPrevious
                    :disabled="!hasPrevious"
                    :class="cn(hasPrevious && 'cursor-pointer')"
                    @click="changePage(page - 1)"
                >
                    <LucideChevronsLeft />
                </PaginationPrevious>

                <template
                    v-for="(item, itemIndex) in paginationItems"
                    :key="`${item.type}-${itemIndex}`"
                >
                    <template v-if="item.type === 'item'">
                        <PaginationItem
                            :value="item.page"
                            :is-active="item.page === page"
                            class="cursor-pointer"
                            @click="changePage(item.page)"
                        >
                            {{ item.page }}
                        </PaginationItem>
                    </template>
                    <template v-else>
                        <PaginationEllipsis />
                    </template>
                </template>

                <PaginationNext
                    :disabled="!hasNext"
                    :class="cn(hasNext && 'cursor-pointer')"
                    @click="changePage(page + 1)"
                >
                    <LucideChevronsRight />
                </PaginationNext>
            </PaginationContent>
        </Pagination>
    </section>
</template>
