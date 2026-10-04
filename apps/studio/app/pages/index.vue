<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const page = useRouteQuery("page", "1", { transform: Number });
    const store = useStore();
</script>

<template>
    <div class="">
        <PaginationClientSide
            :items="store.store.value?.entries"
            index="name"
            :page="page"
            :page-size="10"
            @change-page="(value) => (page = value)"
        >
            <template #item="{ $item }"> {{ $item }} </template>
        </PaginationClientSide>
    </div>
</template>
