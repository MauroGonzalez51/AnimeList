<script setup lang="ts">
    import { SOURCE_FILTER } from "~/lib/migrator";

    definePageMeta({
        layout: "sidebar",
    });

    const migrator = useMigratorManager();
</script>

<template>
    <section class="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 h-full">
        <MigratorSourceCard v-if="migrator.loaded" />
        <DropZoneArea
            v-else
            :formats="SOURCE_FILTER"
            class="h-full"
            @select="migrator.dispach.load"
        />
    </section>
</template>
