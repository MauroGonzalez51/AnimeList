<script setup lang="ts">
    import type { EntryKind } from "~/lib/store";
    import { KIND_LABELS } from "~/lib/store";

    interface Props {
        kinds: readonly EntryKind[];
    }

    defineProps<Props>();
</script>

<template>
    <VeeField v-slot="{ componentField, errors }" name="kind">
        <div>
            <Field
                orientation="horizontal"
                class="min-h-14 items-center px-4 py-2"
                :data-invalid="!!errors.length"
            >
                <FieldLabel class="flex-none font-normal">
                    {{ $t("views.entry.id.form.fields.kind") }}
                </FieldLabel>
                <Select v-bind="componentField">
                    <SelectTrigger
                        class="ml-auto h-auto w-auto gap-1 border-0 bg-transparent p-0 text-muted-foreground shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
                        :aria-invalid="!!errors.length"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectGroup>
                            <SelectItem
                                v-for="kind in kinds"
                                :key="kind"
                                :value="kind"
                            >
                                {{ $t(KIND_LABELS[kind]) }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
            <FieldError
                v-if="errors.length"
                class="px-4 pb-2.5"
                :errors="errors"
            />
        </div>
    </VeeField>
</template>
