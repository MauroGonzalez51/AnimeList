<script setup lang="ts">
    import type { EntryProgress } from "~/lib/store";
    import { ComboboxInput as RekaComboboxInput, useFilter } from "reka-ui";
    import {
        isReadableKind,
        PROGRESS_LABELS,
        READABLE_PROGRESS,
        WATCHABLE_PROGRESS,
    } from "~/lib/store";

    interface Props {
        kind: string;
    }

    const props = defineProps<Props>();

    const search = ref("");
    const { contains } = useFilter({ sensitivity: "base" });

    function selectedOf(value: unknown) {
        if (value === undefined) {
            return [];
        }

        if (Array.isArray(value)) {
            return value as string[];
        }

        return [value as string];
    }

    function optionsOf(kind: string) {
        if (isReadableKind(kind)) {
            return READABLE_PROGRESS;
        }

        return WATCHABLE_PROGRESS;
    }

    function availableFor(value: unknown) {
        const selected = selectedOf(value);

        return optionsOf(props.kind).filter(
            (option) =>
                !selected.includes(option) &&
                contains($t(PROGRESS_LABELS[option]), search.value),
        );
    }

    function normalize(selected: string[]) {
        if (selected.length === 0) {
            return undefined;
        }

        return selected;
    }
</script>

<template>
    <VeeField v-slot="{ value, handleChange }" name="status.progress">
        <Field class="gap-1 px-4 py-3">
            <FieldLabel class="text-xs font-normal text-muted-foreground">
                {{ $t("views.entry.id.form.fields.progress") }}
            </FieldLabel>
            <TagsInput
                :model-value="selectedOf(value)"
                class="gap-0 border-0 bg-transparent p-0 shadow-none focus-within:ring-0 dark:bg-transparent"
                @update:model-value="
                    (next) => handleChange(normalize(next as string[]))
                "
            >
                <div
                    v-if="selectedOf(value).length > 0"
                    class="flex flex-wrap items-center gap-2 pb-2"
                >
                    <TagsInputItem
                        v-for="item in selectedOf(value)"
                        :key="item"
                        :value="item"
                    >
                        <TagsInputItemText>
                            {{ $t(PROGRESS_LABELS[item as EntryProgress]) }}
                        </TagsInputItemText>
                        <TagsInputItemDelete />
                    </TagsInputItem>
                </div>

                <Combobox
                    open-on-focus
                    :model-value="selectedOf(value)"
                    :ignore-filter="true"
                    class="w-full"
                >
                    <ComboboxAnchor as-child class="w-full">
                        <RekaComboboxInput
                            v-model="search"
                            as-child
                            :placeholder="
                                $t(
                                    'views.entry.id.form.fields.progress_placeholder',
                                )
                            "
                        >
                            <TagsInputInput
                                class="h-7 w-full px-0"
                                @keydown.enter.prevent
                            />
                        </RekaComboboxInput>
                    </ComboboxAnchor>

                    <ComboboxList class="w-(--reka-popper-anchor-width)">
                        <ComboboxEmpty class="px-3 py-2 text-sm">
                            {{
                                $t("views.entry.id.form.fields.progress_empty")
                            }}
                        </ComboboxEmpty>
                        <ComboboxGroup>
                            <ComboboxItem
                                v-for="option in availableFor(value)"
                                :key="option"
                                :value="option"
                                @select.prevent="
                                    () => {
                                        search = '';
                                        handleChange([
                                            ...selectedOf(value),
                                            option,
                                        ]);
                                    }
                                "
                            >
                                {{ $t(PROGRESS_LABELS[option]) }}
                            </ComboboxItem>
                        </ComboboxGroup>
                    </ComboboxList>
                </Combobox>
            </TagsInput>
        </Field>
    </VeeField>
</template>
