<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const store = useStore();
</script>

<template>
    <div>
        StorePath: {{ store.storePath }}
        <Button @click="store.dispatch.pick()">Select</Button>
    </div>
</template>
