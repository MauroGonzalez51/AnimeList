<script setup lang="ts">
    import { KIND_LABELS, WATCHABLE_KINDS } from "~/lib/store";

    const NO_ADAPTATION = "none";

    function fromAdaptation(value: unknown) {
        if (value === NO_ADAPTATION) {
            return undefined;
        }

        return value;
    }
</script>

<template>
    <EntryFormGroup :title="$t('views.entry.id.form.sections.adapted_until')">
        <VeeField v-slot="{ value, handleChange }" name="adaptedUntil.kind">
            <Field
                orientation="horizontal"
                class="min-h-14 items-center px-4 py-2"
            >
                <FieldLabel class="flex-none font-normal">
                    {{ $t("views.entry.id.form.fields.adapted_kind") }}
                </FieldLabel>
                <Select
                    :model-value="value ?? NO_ADAPTATION"
                    @update:model-value="
                        (next) => handleChange(fromAdaptation(next))
                    "
                >
                    <SelectTrigger
                        class="ml-auto h-auto w-auto gap-1 border-0 bg-transparent p-0 text-muted-foreground shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectGroup>
                            <SelectItem :value="NO_ADAPTATION">
                                {{ $t("views.entry.id.form.fields.none") }}
                            </SelectItem>
                            <SelectItem
                                v-for="kind in WATCHABLE_KINDS"
                                :key="kind"
                                :value="kind"
                            >
                                {{ $t(KIND_LABELS[kind]) }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
        </VeeField>

        <EntryFormText
            name="adaptedUntil.volume"
            inputmode="numeric"
            :label="$t('views.entry.id.form.fields.volume')"
        />
        <EntryFormText
            name="adaptedUntil.chapter"
            inputmode="numeric"
            :label="$t('views.entry.id.form.fields.chapter')"
        />
        <EntryFormText
            name="adaptedUntil.episode"
            inputmode="numeric"
            :label="$t('views.entry.id.form.fields.episode')"
        />
        <EntryFormText
            name="adaptedUntil.arc"
            :label="$t('views.entry.id.form.fields.arc')"
        />
        <EntryFormText
            name="adaptedUntil.notes"
            multiline
            :label="$t('views.entry.id.form.fields.notes')"
        />
    </EntryFormGroup>
</template>
