<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const store = useStore();
</script>

<template>
    <div>
        <pre v-text="store.store.value" />
    </div>
</template>
