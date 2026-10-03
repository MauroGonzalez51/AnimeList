<script setup lang="ts">
    const { finalizePendingLocaleChange } = useI18n();

    async function onBeforeEnter() {
        await finalizePendingLocaleChange();
        await refreshNuxtData();
    }
</script>

<template>
    <NuxtLayout>
        <NuxtPage :transition="{ onBeforeEnter }" />
        <NuxtRouteAnnouncer />
    </NuxtLayout>
</template>
