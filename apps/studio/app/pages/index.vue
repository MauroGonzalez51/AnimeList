<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const config = useConfig();
    const manager = useStoreManager();
</script>

<template>
    <div>
        <Button @click="() => manager.dispatch.clear()"> Clear </Button>
        <Button @click="() => manager.dispatch.pick()">Pick</Button>
        {{ config }}
        {{ manager.entries }}
    </div>
</template>
