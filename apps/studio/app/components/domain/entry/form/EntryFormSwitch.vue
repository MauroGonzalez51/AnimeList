<script setup lang="ts">
    import { blankToUndefined } from "~/lib/utils";

    interface Props {
        name: string;
        label: string;
    }

    defineProps<Props>();
</script>

<template>
    <VeeField v-slot="{ value, handleChange }" :name="name">
        <Field
            orientation="horizontal"
            class="min-h-14 items-center px-4 py-2.5"
        >
            <FieldLabel class="font-normal">{{ label }}</FieldLabel>
            <Switch
                :model-value="Boolean(value)"
                @update:model-value="
                    (next: boolean) => handleChange(blankToUndefined(next))
                "
            />
        </Field>
    </VeeField>
</template>
