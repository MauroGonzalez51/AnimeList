<script setup lang="ts">
    import { SOURCE_FILTER } from "~/lib/migrator";

    definePageMeta({
        layout: "sidebar",
    });

    const migrator = useMigratorManager();
</script>

<template>
    <section class="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 h-full">
        <div
            v-if="migrator.loaded"
            class="grid items-start gap-6 md:grid-cols-2"
        >
            <MigratorSourceCard />
            <MigratorEntryCard />
        </div>
        <DropZoneArea
            v-else
            :formats="SOURCE_FILTER"
            class="h-full"
            @select="migrator.dispach.load"
        />
    </section>
</template>
