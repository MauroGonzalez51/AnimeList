<script setup lang="ts">
    import { SOURCE_FILTER } from "~/lib/migrator";

    definePageMeta({
        layout: "sidebar",
    });

    const migrator = useMigratorManager();
    const { content } = storeToRefs(migrator);
</script>

<template>
    <section class="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 h-full">
        <DropZoneArea
            v-if="!content"
            :formats="SOURCE_FILTER"
            class="h-full"
            @select="migrator.dispatch.load"
        />

        <div v-else>
            <DebugBlock :content="content" />
        </div>
    </section>
</template>
