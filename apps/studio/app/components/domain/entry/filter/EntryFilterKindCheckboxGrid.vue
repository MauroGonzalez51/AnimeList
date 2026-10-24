<script setup lang="ts">
    import type { EntryKind } from "@/lib/store";
    import { KIND_LABELS, KINDS_SCHEMA } from "@/lib/store";

    const model = defineModel<EntryKind[]>({
        default: () => [],
    });

    function toggle(kind: EntryKind, checked: boolean) {
        const others = model.value.filter((item) => item !== kind);

        if (checked) {
            model.value = [...others, kind];
            return;
        }

        model.value = others;
    }
</script>

<template>
    <div class="grid grid-cols-2 sm:grid-cols-3">
        <template v-for="option in KINDS_SCHEMA.options" :key="option.value">
            <Label
                class="flex items-center space-x-1 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer select-none"
            >
                <Checkbox
                    :default-value="model.includes(option.value)"
                    @update:model-value="
                        (checked) => toggle(option.value, checked === true)
                    "
                />
                <TranslatedMessage :keypath="KIND_LABELS[option.value]" />
            </Label>
        </template>
    </div>
</template>
