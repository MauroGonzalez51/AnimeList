<script setup lang="ts">
    import { tauri } from "~/lib/tauri/commands";

    definePageMeta({
        layout: "sidebar",
    });

    const store = useStore();
    const content = await tauri.call("query_schema");
</script>

<template>
    <div>
        StorePath: {{ store.storePath }}
        <Button @click="store.dispatch.pick()">Select</Button>

        <pre v-text="content" />
    </div>
</template>
