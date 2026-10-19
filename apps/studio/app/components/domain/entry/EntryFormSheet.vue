<script setup lang="ts">
    import type { EntryDraft, FlatEntry } from "~/lib/schema";
    import { EntrySchema } from "@animelist/packages-schema";
    import { cloneDeep, isEqual, omit } from "es-toolkit";
    import { entryText } from "~/lib/schema";
    import {
        isReadableKind,
        isUniverseKind,
        KIND_LABELS,
        KINDS,
        kindsInFamily,
        WATCHABLE_KINDS,
    } from "~/lib/store";
    import { blankToUndefined, prune } from "~/lib/utils";

    interface Props {
        entry?: FlatEntry;
        submit: (draft: EntryDraft) => void;
    }

    interface TextFieldProps {
        name: string;
        label: string;
        type?: "number";
        multiline?: boolean;
    }

    interface SwitchFieldProps {
        name: string;
        label: string;
    }

    const props = defineProps<Props>();

    const NO_ADAPTATION = "none";

    const modal = useModal();

    const initialValues = computed(() => {
        if (!props.entry) {
            return { kind: "anime" };
        }

        return cloneDeep(
            omit(props.entry, [
                "id",
                "references",
                "style",
                "_parentId",
                "_source",
                "_isGeneratedId",
            ]),
        );
    });

    const kinds = computed(() => {
        if (props.entry) {
            return kindsInFamily(props.entry.kind);
        }

        return KINDS;
    });

    function canSave(values: unknown) {
        if (!props.entry) {
            return true;
        }

        return !isEqual(prune(values), prune(initialValues.value));
    }

    function displayText(value: unknown) {
        if (value === undefined) {
            return "";
        }

        return entryText(value as Parameters<typeof entryText>[0]);
    }

    function fromAdaptation(value: unknown) {
        if (value === NO_ADAPTATION) {
            return undefined;
        }

        return value;
    }

    function onSubmit(values: unknown) {
        const { id, references, children, related, ...draft } =
            EntrySchema.parse(prune(values));

        props.submit(draft);
        modal.dispatch.setOpen(false);
    }

    const { define: DefineText, reuse: ReuseText } =
        createReusableTemplate<TextFieldProps>();
    const { define: DefineSwitch, reuse: ReuseSwitch } =
        createReusableTemplate<SwitchFieldProps>();
</script>

<template>
    <SheetContent class="sm:max-w-md">
        <DefineText v-slot="{ name, label, type, multiline }">
            <VeeField v-slot="{ value, handleChange, errors }" :name="name">
                <Field :data-invalid="!!errors.length">
                    <FieldLabel>{{ label }}</FieldLabel>
                    <Textarea
                        v-if="multiline"
                        :model-value="displayText(value)"
                        :aria-invalid="!!errors.length"
                        @update:model-value="
                            (next) => handleChange(blankToUndefined(next))
                        "
                    />
                    <Input
                        v-else
                        :type="type"
                        :model-value="value"
                        :aria-invalid="!!errors.length"
                        @update:model-value="
                            (next) => handleChange(blankToUndefined(next))
                        "
                    />
                    <FieldError v-if="errors.length" :errors="errors" />
                </Field>
            </VeeField>
        </DefineText>

        <DefineSwitch v-slot="{ name, label }">
            <VeeField v-slot="{ value, handleChange }" :name="name">
                <Field orientation="horizontal">
                    <FieldLabel>{{ label }}</FieldLabel>
                    <Switch
                        :model-value="Boolean(value)"
                        @update:model-value="
                            (next: boolean) =>
                                handleChange(blankToUndefined(next))
                        "
                    />
                </Field>
            </VeeField>
        </DefineSwitch>

        <SheetHeader>
            <SheetTitle>
                <template v-if="entry">
                    {{ $t("views.entry.id.form.edit_title") }}
                </template>
                <template v-else>
                    {{ $t("views.entry.id.form.create_title") }}
                </template>
            </SheetTitle>
        </SheetHeader>

        <VeeForm
            v-slot="{ values }"
            :validation-schema="toTypedSchema(EntrySchema)"
            :initial-values="initialValues"
            class="flex min-h-0 flex-1 flex-col"
            @submit="onSubmit"
        >
            <div class="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-4">
                <FieldSet>
                    <FieldLegend>
                        {{ $t("views.entry.id.form.sections.general") }}
                    </FieldLegend>
                    <FieldGroup>
                        <ReuseText
                            name="name"
                            :label="$t('views.entry.id.form.fields.name')"
                        />

                        <VeeField
                            v-slot="{ componentField, errors }"
                            name="kind"
                        >
                            <Field :data-invalid="!!errors.length">
                                <FieldLabel>
                                    {{ $t("views.entry.id.form.fields.kind") }}
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
                                                v-for="kind in kinds"
                                                :key="kind"
                                                :value="kind"
                                            >
                                                {{ $t(KIND_LABELS[kind]) }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError
                                    v-if="errors.length"
                                    :errors="errors"
                                />
                            </Field>
                        </VeeField>

                        <ReuseText
                            name="chronology"
                            :label="$t('views.entry.id.form.fields.chronology')"
                        />
                        <ReuseText
                            name="notes"
                            multiline
                            :label="$t('views.entry.id.form.fields.notes')"
                        />
                    </FieldGroup>
                </FieldSet>

                <FieldSet v-if="!isUniverseKind(values.kind)">
                    <FieldLegend>
                        {{ $t("views.entry.id.form.sections.status") }}
                    </FieldLegend>
                    <FieldGroup>
                        <ReuseSwitch
                            name="status.watched"
                            :label="$t('views.entry.id.form.fields.watched')"
                        />
                        <ReuseSwitch
                            v-if="isReadableKind(values.kind)"
                            name="status.completed"
                            :label="$t('views.entry.id.form.fields.completed')"
                        />
                        <ReuseSwitch
                            name="status.favorite"
                            :label="$t('views.entry.id.form.fields.favorite')"
                        />
                        <ReuseText
                            name="status.rating"
                            type="number"
                            :label="$t('views.entry.id.form.fields.rating')"
                        />
                        <ReuseText
                            v-if="isReadableKind(values.kind)"
                            name="status.chapter"
                            type="number"
                            :label="$t('views.entry.id.form.fields.chapter')"
                        />
                        <ReuseText
                            v-else
                            name="status.episode"
                            type="number"
                            :label="$t('views.entry.id.form.fields.episode')"
                        />
                        <ReuseText
                            name="status.review"
                            multiline
                            :label="$t('views.entry.id.form.fields.review')"
                        />
                    </FieldGroup>
                </FieldSet>

                <FieldSet v-if="isReadableKind(values.kind)">
                    <FieldLegend>
                        {{ $t("views.entry.id.form.sections.adapted_until") }}
                    </FieldLegend>
                    <FieldGroup>
                        <VeeField
                            v-slot="{ value, handleChange }"
                            name="adaptedUntil.kind"
                        >
                            <Field>
                                <FieldLabel>
                                    {{
                                        $t(
                                            "views.entry.id.form.fields.adapted_kind",
                                        )
                                    }}
                                </FieldLabel>
                                <Select
                                    :model-value="value ?? NO_ADAPTATION"
                                    @update:model-value="
                                        (next) =>
                                            handleChange(fromAdaptation(next))
                                    "
                                >
                                    <SelectTrigger class="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem :value="NO_ADAPTATION">
                                                {{
                                                    $t(
                                                        "views.entry.id.form.fields.none",
                                                    )
                                                }}
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

                        <ReuseText
                            name="adaptedUntil.volume"
                            type="number"
                            :label="$t('views.entry.id.form.fields.volume')"
                        />
                        <ReuseText
                            name="adaptedUntil.chapter"
                            type="number"
                            :label="$t('views.entry.id.form.fields.chapter')"
                        />
                        <ReuseText
                            name="adaptedUntil.episode"
                            type="number"
                            :label="$t('views.entry.id.form.fields.episode')"
                        />
                        <ReuseText
                            name="adaptedUntil.arc"
                            :label="$t('views.entry.id.form.fields.arc')"
                        />
                        <ReuseText
                            name="adaptedUntil.notes"
                            multiline
                            :label="$t('views.entry.id.form.fields.notes')"
                        />
                    </FieldGroup>
                </FieldSet>
            </div>

            <SheetFooter>
                <SheetClose as-child>
                    <Button type="button" variant="outline">
                        {{ $t("views.entry.id.actions.cancel") }}
                    </Button>
                </SheetClose>
                <Button type="submit" :disabled="!canSave(values)">
                    <template v-if="entry">
                        {{ $t("actions.entry.save.label") }}
                    </template>
                    <template v-else>
                        {{ $t("views.entry.id.form.create_submit") }}
                    </template>
                </Button>
            </SheetFooter>
        </VeeForm>
    </SheetContent>
</template>
