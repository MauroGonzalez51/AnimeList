<script setup lang="ts">
    import { usePaginationControls } from "@/components/shared/pagination/injection-state";
    import { cn } from "~/lib/utils";

    interface Emits {
        changePage: [page: number];
    }

    defineEmits<Emits>();

    const {
        totalPages,
        page,
        pageSize,
        hasPrevious,
        hasNext,
        paginationItems,
    } = usePaginationControls();
</script>

<template>
    <Pagination
        v-if="totalPages > 1"
        :items-per-page="pageSize"
        class="mt-auto py-6"
    >
        <PaginationContent
            class="px-12 py-2 rounded-lg bg-sidebar border-sidebar"
        >
            <PaginationPrevious
                :disabled="!hasPrevious"
                :class="cn(hasPrevious && 'cursor-pointer')"
                @click="$emit('changePage', page - 1)"
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
                        @click="$emit('changePage', item.page)"
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
                @click="$emit('changePage', page + 1)"
            >
                <LucideChevronsRight />
            </PaginationNext>
        </PaginationContent>
    </Pagination>
</template>
