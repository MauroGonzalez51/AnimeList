<script setup lang="ts">
    import { SOURCE_FILTER } from "~/lib/migrator";

    definePageMeta({
        layout: "sidebar",
    });
</script>

<template>
    <section class="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 h-full">
        <DropZoneArea :filter="SOURCE_FILTER" class="h-full" />
    </section>
</template>
