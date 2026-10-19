<script setup lang="ts">
    import type { FlatEntry } from "~/lib/schema";
    import type { EntryReference, EntryRelation } from "~/lib/store";
    import { isEqual } from "es-toolkit";
    import { ComboboxInput as RekaComboboxInput, useFilter } from "reka-ui";
    import { z } from "zod";
    import {
        KIND_LABELS,
        RELATION_HELP,
        RELATION_LABELS,
        RELATIONS,
    } from "~/lib/store";

    interface Props {
        candidates: FlatEntry[];
        reference?: EntryReference;
        submit: (reference: EntryReference) => void;
    }

    const props = defineProps<Props>();
    const modal = useModal();

    const SCHEMA = z.object({
        id: z.string().min(1),
        relation: z.array(z.enum(RELATIONS)),
    });
    const typedSchema = toTypedSchema(SCHEMA);

    const initialValues = computed(() => ({
        id: props.reference?.id,
        relation: [...(props.reference?.relation ?? [])],
    }));

    function canSave(values: unknown) {
        if (!props.reference) {
            return true;
        }

        return !isEqual(values, initialValues.value);
    }

    const targetSearch = ref("");
    const relationSearch = ref("");
    const { contains } = useFilter({ sensitivity: "base" });

    function candidateOf(id: string | undefined) {
        return props.candidates.find((candidate) => candidate.id === id);
    }

    function matchingCandidates() {
        return props.candidates.filter((candidate) =>
            contains(
                [
                    candidate.name,
                    candidate.chronology,
                    $t(KIND_LABELS[candidate.kind]),
                ].join(" "),
                targetSearch.value,
            ),
        );
    }

    function available(selected: EntryRelation[]) {
        return RELATIONS.filter(
            (relation) =>
                !selected.includes(relation) &&
                contains($t(RELATION_LABELS[relation]), relationSearch.value),
        );
    }

    function onSubmit(values: unknown) {
        const { id, relation } = SCHEMA.parse(values);

        if (relation.length === 0) {
            props.submit({ id });
        } else {
            props.submit({ id, relation });
        }

        modal.dispatch.setOpen(false);
    }
</script>

<template>
    <DialogContent
        :show-close-button="false"
        class="gap-0 overflow-hidden rounded-2xl p-0"
        @open-auto-focus.prevent
    >
        <VeeForm
            v-slot="{ values }"
            :validation-schema="typedSchema"
            :initial-values="initialValues"
            class="min-w-0"
            @submit="onSubmit"
        >
            <DialogHeader class="px-6 pt-6 pb-4 text-center sm:text-center">
                <DialogTitle class="text-xl font-semibold tracking-[-0.02em]">
                    <template v-if="reference">
                        {{ $t("views.entry.id.dialogs.reference.edit_title") }}
                    </template>
                    <template v-else>
                        {{ $t("views.entry.id.dialogs.reference.title") }}
                    </template>
                </DialogTitle>
            </DialogHeader>

            <div class="px-4 pb-4">
                <EntryFormGroup>
                    <VeeField
                        v-slot="{ value, handleChange, errors }"
                        name="id"
                    >
                        <div>
                            <Field
                                orientation="horizontal"
                                class="min-w-0 items-center gap-4 px-4 py-2.5"
                                :data-invalid="!!errors.length"
                            >
                                <FieldLabel class="flex-none font-normal">
                                    {{
                                        $t(
                                            "views.entry.id.dialogs.reference.target",
                                        )
                                    }}
                                </FieldLabel>
                                <Combobox
                                    v-model:search-term="targetSearch"
                                    :model-value="value"
                                    :ignore-filter="true"
                                    @update:model-value="handleChange"
                                >
                                    <ComboboxAnchor class="w-auto min-w-0 flex-1">
                                        <ComboboxTrigger as-child>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                class="h-auto w-full min-w-0 cursor-pointer justify-end gap-1 overflow-hidden p-0 font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
                                                :aria-invalid="!!errors.length"
                                            >
                                                <span class="min-w-0 truncate">
                                                    <template
                                                        v-if="
                                                            candidateOf(value)
                                                        "
                                                    >
                                                        {{
                                                            candidateOf(value)
                                                                ?.name
                                                        }}
                                                    </template>
                                                    <template v-else>
                                                        {{
                                                            $t(
                                                                "views.entry.id.dialogs.reference.target_placeholder",
                                                            )
                                                        }}
                                                    </template>
                                                </span>
                                                <LucideChevronsUpDown
                                                    class="size-4 opacity-50"
                                                />
                                            </Button>
                                        </ComboboxTrigger>
                                    </ComboboxAnchor>

                                    <ComboboxList
                                        :body-lock="false"
                                        class="w-[50vw]"
                                    >
                                        <ComboboxInput
                                            :display-value="() => ''"
                                            :placeholder="
                                                $t(
                                                    'views.entry.id.dialogs.reference.target_search',
                                                )
                                            "
                                        />
                                        <ComboboxEmpty
                                            class="px-3 py-4 text-center text-sm text-muted-foreground"
                                        >
                                            {{
                                                $t(
                                                    "views.entry.id.dialogs.reference.target_empty",
                                                )
                                            }}
                                        </ComboboxEmpty>
                                        <ComboboxViewport
                                            class="max-h-72 overflow-y-auto p-1"
                                        >
                                            <ComboboxGroup>
                                                <ComboboxItem
                                                    v-for="candidate in matchingCandidates()"
                                                    :key="candidate.id"
                                                    :value="candidate.id"
                                                    class="items-start justify-between gap-3"
                                                >
                                                    <span
                                                        class="flex min-w-0 flex-col"
                                                    >
                                                        <span
                                                            class="truncate font-medium"
                                                        >
                                                            {{ candidate.name }}
                                                        </span>
                                                        <span
                                                            v-if="
                                                                candidate.chronology
                                                            "
                                                            class="truncate text-xs text-muted-foreground"
                                                        >
                                                            {{
                                                                candidate.chronology
                                                            }}
                                                        </span>
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        class="shrink-0 font-normal"
                                                    >
                                                        {{
                                                            $t(
                                                                KIND_LABELS[
                                                                    candidate
                                                                        .kind
                                                                ],
                                                            )
                                                        }}
                                                    </Badge>
                                                </ComboboxItem>
                                            </ComboboxGroup>
                                        </ComboboxViewport>
                                    </ComboboxList>
                                </Combobox>
                            </Field>
                            <FieldError
                                v-if="errors.length"
                                class="px-4 pb-2.5"
                                :errors="errors"
                            />
                        </div>
                    </VeeField>

                    <VeeField v-slot="{ value, handleChange }" name="relation">
                        <Field class="gap-1 px-4 py-3">
                            <FieldLabel
                                class="text-xs font-normal text-muted-foreground"
                            >
                                {{
                                    $t(
                                        "views.entry.id.dialogs.reference.relation",
                                    )
                                }}
                            </FieldLabel>
                            <TagsInput
                                :model-value="value"
                                class="gap-0 border-0 bg-transparent p-0 shadow-none focus-within:ring-0 dark:bg-transparent"
                                @update:model-value="handleChange"
                            >
                                <div
                                    v-if="value.length > 0"
                                    class="flex flex-wrap items-center gap-2 pb-2"
                                >
                                    <TagsInputItem
                                        v-for="item in value"
                                        :key="item"
                                        :value="item"
                                    >
                                        <TagsInputItemText>
                                            {{
                                                $t(
                                                    RELATION_LABELS[
                                                        item as EntryRelation
                                                    ],
                                                )
                                            }}
                                        </TagsInputItemText>
                                        <TagsInputItemDelete />
                                    </TagsInputItem>
                                </div>

                                <Combobox
                                    v-model:search-term="relationSearch"
                                    open-on-focus
                                    :model-value="value"
                                    :ignore-filter="true"
                                    class="w-full"
                                >
                                    <ComboboxAnchor as-child class="w-full">
                                        <RekaComboboxInput
                                            as-child
                                            :placeholder="
                                                $t(
                                                    'views.entry.id.dialogs.reference.relation_placeholder',
                                                )
                                            "
                                        >
                                            <TagsInputInput
                                                class="h-7 w-full px-0"
                                                @keydown.enter.prevent
                                            />
                                        </RekaComboboxInput>
                                    </ComboboxAnchor>

                                    <ComboboxList
                                        class="w-(--reka-popper-anchor-width)"
                                    >
                                        <ComboboxEmpty
                                            class="px-3 py-2 text-sm"
                                        >
                                            {{
                                                $t(
                                                    "views.entry.id.dialogs.reference.relation_empty",
                                                )
                                            }}
                                        </ComboboxEmpty>
                                        <ComboboxGroup>
                                            <ComboboxItem
                                                v-for="relation in available(
                                                    value,
                                                )"
                                                :key="relation"
                                                :value="relation"
                                                class="flex-col items-start gap-0"
                                                @select.prevent="
                                                    () => {
                                                        relationSearch = '';
                                                        handleChange([
                                                            ...value,
                                                            relation,
                                                        ]);
                                                    }
                                                "
                                            >
                                                <span class="font-medium">
                                                    {{
                                                        $t(
                                                            RELATION_LABELS[
                                                                relation
                                                            ],
                                                        )
                                                    }}
                                                </span>
                                                <span
                                                    class="text-xs text-muted-foreground"
                                                >
                                                    {{
                                                        $t(
                                                            RELATION_HELP[
                                                                relation
                                                            ],
                                                        )
                                                    }}
                                                </span>
                                            </ComboboxItem>
                                        </ComboboxGroup>
                                    </ComboboxList>
                                </Combobox>
                            </TagsInput>
                        </Field>
                    </VeeField>
                </EntryFormGroup>
            </div>

            <div class="grid grid-cols-2 gap-2 border-t border-border/60 p-4">
                <DialogClose as-child>
                    <Button
                        type="button"
                        variant="secondary"
                        class="h-11 cursor-pointer rounded-xl transition-transform active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
                    >
                        {{ $t("views.entry.id.actions.cancel") }}
                    </Button>
                </DialogClose>
                <Button
                    type="submit"
                    class="h-11 cursor-pointer rounded-xl transition-transform active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
                    :disabled="!canSave(values)"
                >
                    <template v-if="reference">
                        {{ $t("actions.entry.save.label") }}
                    </template>
                    <template v-else>
                        {{ $t("views.entry.id.dialogs.reference.submit") }}
                    </template>
                </Button>
            </div>
        </VeeForm>
    </DialogContent>
</template>
