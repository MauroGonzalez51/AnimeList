<script setup lang="ts">
    import { entryText } from "~/lib/schema";
    import { blankToUndefined } from "~/lib/utils";

    interface Props {
        name: string;
        label: string;
        inputmode?: "numeric" | "decimal";
        multiline?: boolean;
    }

    defineProps<Props>();

    function displayText(value: unknown) {
        if (value === undefined) {
            return "";
        }

        return entryText(value as Parameters<typeof entryText>[0]);
    }
</script>

<template>
    <VeeField v-slot="{ value, handleChange, errors }" :name="name">
        <div>
            <InputLabelFloating :label="label">
                <template #input="slot">
                    <Textarea
                        v-if="multiline"
                        v-bind="slot"
                        :model-value="displayText(value)"
                        :aria-invalid="!!errors.length"
                        @update:model-value="
                            (next) => handleChange(blankToUndefined(next))
                        "
                    />
                    <InputNumeric
                        v-else-if="inputmode"
                        v-bind="slot"
                        :inputmode="inputmode"
                        :model-value="value"
                        :aria-invalid="!!errors.length"
                        @update:model-value="handleChange"
                    />
                    <Input
                        v-else
                        v-bind="slot"
                        :model-value="value"
                        :aria-invalid="!!errors.length"
                        @update:model-value="
                            (next) => handleChange(blankToUndefined(next))
                        "
                    />
                </template>
            </InputLabelFloating>
            <FieldError
                v-if="errors.length"
                class="px-4 pb-2.5"
                :errors="errors"
            />
        </div>
    </VeeField>
</template>
