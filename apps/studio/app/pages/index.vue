<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const config = useConfig();
    const manager = useStoreManager();
</script>

<template>
    <div>
        {{ config }}
        {{ manager.entries }}
    </div>
</template>
