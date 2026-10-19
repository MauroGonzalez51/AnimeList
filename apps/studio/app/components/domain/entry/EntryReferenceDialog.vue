<script setup lang="ts">
    import type { FlatEntry } from "~/lib/schema";
    import type { EntryRelation } from "~/lib/store";
    import { ComboboxInput, useFilter } from "reka-ui";
    import { z } from "zod";
    import { RELATION_HELP, RELATION_LABELS, RELATIONS } from "~/lib/store";

    interface Props {
        candidates: FlatEntry[];
        submit: (reference: { id: string; relation?: EntryRelation[] }) => void;
    }

    const props = defineProps<Props>();
    const modal = useModal();

    const SCHEMA = computed(() =>
        z.object({
            id: z.string().min(1, { error: $t("validation.required") }),
            relation: z.array(z.enum(RELATIONS)),
        }),
    );

    const open = ref(false);
    const searchTerm = ref("");
    const { contains } = useFilter({ sensitivity: "base" });

    function available(selected: EntryRelation[]) {
        return RELATIONS.filter(
            (relation) =>
                !selected.includes(relation) &&
                contains($t(RELATION_LABELS[relation]), searchTerm.value),
        );
    }

    function onSubmit(values: unknown) {
        const { id, relation } = SCHEMA.value.parse(values);
        if (relation.length === 0) {
            props.submit({ id });
        } else {
            props.submit({ id, relation });
        }

        modal.dispatch.setOpen(false);
    }
</script>

<template>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>
                {{ $t("views.entry.id.dialogs.reference.title") }}
            </DialogTitle>
        </DialogHeader>

        <VeeForm
            :validation-schema="toTypedSchema(SCHEMA)"
            :initial-values="{ relation: [] }"
            @submit="onSubmit"
        >
            <FieldGroup>
                <VeeField v-slot="{ componentField, errors }" name="id">
                    <Field :data-invalid="!!errors.length">
                        <FieldLabel>
                            {{ $t("views.entry.id.dialogs.reference.target") }}
                        </FieldLabel>
                        <Select v-bind="componentField">
                            <SelectTrigger
                                class="w-full"
                                :aria-invalid="!!errors.length"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem
                                        v-for="candidate in props.candidates"
                                        :key="candidate.id"
                                        :value="candidate.id"
                                    >
                                        {{ candidate.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <FieldError v-if="errors.length" :errors="errors" />
                    </Field>
                </VeeField>

                <VeeField v-slot="{ value, handleChange }" name="relation">
                    <Field>
                        <FieldLabel>
                            {{ $t("views.entry.id.dialogs.reference.relation") }}
                        </FieldLabel>
                        <TagsInput
                            :model-value="value"
                            class="gap-0 px-0"
                            @update:model-value="handleChange"
                        >
                            <div
                                v-if="value.length > 0"
                                class="flex flex-wrap items-center gap-2 px-2 pb-1"
                            >
                                <TagsInputItem
                                    v-for="item in value"
                                    :key="item"
                                    :value="item"
                                >
                                    <TagsInputItemText>
                                        {{ $t(RELATION_LABELS[item as EntryRelation]) }}
                                    </TagsInputItemText>
                                    <TagsInputItemDelete />
                                </TagsInputItem>
                            </div>

                            <Combobox
                                v-model:open="open"
                                v-model:search-term="searchTerm"
                                :model-value="value"
                                :ignore-filter="true"
                                class="w-full"
                            >
                                <ComboboxAnchor as-child class="w-full">
                                    <ComboboxInput
                                        as-child
                                        :placeholder="
                                            $t(
                                                'views.entry.id.dialogs.reference.relation_placeholder',
                                            )
                                        "
                                    >
                                        <TagsInputInput
                                            class="w-full px-3"
                                            @keydown.enter.prevent
                                            @focus="open = true"
                                        />
                                    </ComboboxInput>
                                </ComboboxAnchor>

                                <ComboboxList
                                    class="w-(--reka-popper-anchor-width)"
                                >
                                    <ComboboxEmpty>
                                        {{
                                            $t(
                                                "views.entry.id.dialogs.reference.relation_empty",
                                            )
                                        }}
                                    </ComboboxEmpty>
                                    <ComboboxGroup>
                                        <ComboboxItem
                                            v-for="relation in available(value)"
                                            :key="relation"
                                            :value="relation"
                                            class="flex-col items-start gap-0"
                                            @select.prevent="
                                                () => {
                                                    searchTerm = '';
                                                    handleChange([
                                                        ...value,
                                                        relation,
                                                    ]);
                                                }
                                            "
                                        >
                                            <span class="font-medium">
                                                {{ $t(RELATION_LABELS[relation]) }}
                                            </span>
                                            <span
                                                class="text-xs text-muted-foreground"
                                            >
                                                {{ $t(RELATION_HELP[relation]) }}
                                            </span>
                                        </ComboboxItem>
                                    </ComboboxGroup>
                                </ComboboxList>
                            </Combobox>
                        </TagsInput>
                    </Field>
                </VeeField>
            </FieldGroup>

            <DialogFooter class="mt-6">
                <DialogClose as-child>
                    <Button type="button" variant="outline">
                        {{ $t("views.entry.id.actions.cancel") }}
                    </Button>
                </DialogClose>
                <Button type="submit">
                    {{ $t("views.entry.id.dialogs.reference.submit") }}
                </Button>
            </DialogFooter>
        </VeeForm>
    </DialogContent>
</template>
