<script setup lang="ts">
    import type { StatusFilter } from "@/components/domain/entry/filter/status";
    import {
        clearStatusField,
        getStatusChips,
    } from "@/components/domain/entry/filter/status";

    const model = defineModel<StatusFilter>({ required: true });

    const chips = computed(() => getStatusChips(model.value));
</script>

<template>
    <div v-if="chips.length" class="flex flex-wrap gap-2">
        <Badge
            v-for="chip in chips"
            :key="chip.key"
            variant="outline"
            class="cursor-pointer"
            @click="model = clearStatusField(model, chip.key)"
        >
            <i18n-t :keypath="chip.keypath" tag="span">
                <template #label>
                    <TranslatedMessage :keypath="chip.label" />
                </template>
                <template #min>
                    {{ chip.min }}
                </template>
                <template #max>
                    {{ chip.max }}
                </template>
            </i18n-t>
            <LucideX class="size-3" />
        </Badge>
    </div>
</template>
