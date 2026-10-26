<script setup lang="ts">
    const model = defineModel<boolean>({ default: false });
</script>

<template>
    <Label
        class="flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium select-none"
    >
        <Switch v-model="model" />
        {{ $t("domain.entry.label.all_entries") }}
    </Label>
</template>
