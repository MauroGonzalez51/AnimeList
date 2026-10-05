<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const page = useRouteQuery("page", "1", { transform: Number });
    const store = useStore();
</script>

<template>
    <div class="container mx-auto h-full">
        <PaginationClientSide
            :items="store.store.value?.entries"
            index="name"
            :page="page"
            :page-size="20"
            class="grid grid-cols-[repeat(auto-fill,300px)] justify-center gap-4"
            @change-page="(value) => (page = value)"
        >
            <template #item="{ $item }">
                <StoreEntryCard :entry="$item" />
            </template>
        </PaginationClientSide>
    </div>
</template>
