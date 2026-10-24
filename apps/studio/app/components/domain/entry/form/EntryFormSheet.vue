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
        inputmode?: "numeric" | "decimal";
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
                "_parentId",
                "_source",
                "_isGeneratedId",
            ]),
        );
    });

    const typedSchema = toTypedSchema(EntrySchema);

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
    <SheetContent class="gap-0 sm:max-w-md" @open-auto-focus.prevent>
        <DefineText v-slot="{ name, label, inputmode, multiline }">
            <VeeField v-slot="{ value, handleChange, errors }" :name="name">
                <div>
                    <Field
                        v-if="multiline"
                        class="gap-1 px-4 py-3"
                        :data-invalid="!!errors.length"
                    >
                        <FieldLabel
                            class="text-xs font-normal text-muted-foreground"
                        >
                            {{ label }}
                        </FieldLabel>
                        <Textarea
                            class="min-h-16 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                            :model-value="displayText(value)"
                            :aria-invalid="!!errors.length"
                            @update:model-value="
                                (next) => handleChange(blankToUndefined(next))
                            "
                        />
                    </Field>
                    <Field
                        v-else
                        orientation="horizontal"
                        class="items-center gap-4 px-4 py-2.5"
                        :data-invalid="!!errors.length"
                    >
                        <FieldLabel class="flex-none font-normal">
                            {{ label }}
                        </FieldLabel>
                        <NumericInput
                            v-if="inputmode"
                            class="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-right shadow-none focus-visible:ring-0 dark:bg-transparent"
                            :inputmode="inputmode"
                            :model-value="value"
                            :aria-invalid="!!errors.length"
                            @update:model-value="handleChange"
                        />
                        <Input
                            v-else
                            class="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-right shadow-none focus-visible:ring-0 dark:bg-transparent"
                            :model-value="value"
                            :aria-invalid="!!errors.length"
                            @update:model-value="
                                (next) => handleChange(blankToUndefined(next))
                            "
                        />
                    </Field>
                    <FieldError
                        v-if="errors.length"
                        class="px-4 pb-2.5"
                        :errors="errors"
                    />
                </div>
            </VeeField>
        </DefineText>

        <DefineSwitch v-slot="{ name, label }">
            <VeeField v-slot="{ value, handleChange }" :name="name">
                <Field
                    orientation="horizontal"
                    class="items-center px-4 py-2.5"
                >
                    <FieldLabel class="font-normal">{{ label }}</FieldLabel>
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

        <VeeForm
            v-slot="{ values }"
            :validation-schema="typedSchema"
            :initial-values="initialValues"
            class="flex min-h-0 flex-1 flex-col"
            @submit="onSubmit"
        >
            <SheetHeader
                class="flex-row items-center gap-3 border-b py-4 pr-14 pl-6"
            >
                <SheetTitle class="text-xl font-semibold tracking-[-0.02em]">
                    <template v-if="entry">
                        {{ $t("views.entry.id.form.edit_title") }}
                    </template>
                    <template v-else>
                        {{ $t("views.entry.id.form.create_title") }}
                    </template>
                </SheetTitle>
            </SheetHeader>

            <div
                class="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pt-6 pb-10"
            >
                <EntryFormGroup
                    :title="$t('views.entry.id.form.sections.general')"
                >
                    <ReuseText
                        name="name"
                        :label="$t('views.entry.id.form.fields.name')"
                    />

                    <VeeField v-slot="{ componentField, errors }" name="kind">
                        <div>
                            <Field
                                orientation="horizontal"
                                class="items-center px-4 py-2"
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

                    <ReuseText
                        name="chronology"
                        :label="$t('views.entry.id.form.fields.chronology')"
                    />
                    <ReuseText
                        name="notes"
                        multiline
                        :label="$t('views.entry.id.form.fields.notes')"
                    />
                </EntryFormGroup>

                <EntryFormGroup
                    v-if="!isUniverseKind(values.kind)"
                    :title="$t('views.entry.id.form.sections.status')"
                    class=""
                >
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
                        inputmode="decimal"
                        :label="$t('views.entry.id.form.fields.rating')"
                    />
                    <ReuseText
                        v-if="isReadableKind(values.kind)"
                        name="status.chapter"
                        inputmode="numeric"
                        :label="$t('views.entry.id.form.fields.chapter')"
                    />
                    <ReuseText
                        v-else
                        name="status.episode"
                        inputmode="numeric"
                        :label="$t('views.entry.id.form.fields.episode')"
                    />
                    <ReuseText
                        name="status.review"
                        multiline
                        :label="$t('views.entry.id.form.fields.review')"
                    />
                </EntryFormGroup>

                <EntryFormGroup
                    v-if="isReadableKind(values.kind)"
                    :title="$t('views.entry.id.form.sections.adapted_until')"
                >
                    <VeeField
                        v-slot="{ value, handleChange }"
                        name="adaptedUntil.kind"
                    >
                        <Field
                            orientation="horizontal"
                            class="items-center px-4 py-2"
                        >
                            <FieldLabel class="flex-none font-normal">
                                {{
                                    $t(
                                        "views.entry.id.form.fields.adapted_kind",
                                    )
                                }}
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
                        inputmode="numeric"
                        :label="$t('views.entry.id.form.fields.volume')"
                    />
                    <ReuseText
                        name="adaptedUntil.chapter"
                        inputmode="numeric"
                        :label="$t('views.entry.id.form.fields.chapter')"
                    />
                    <ReuseText
                        name="adaptedUntil.episode"
                        inputmode="numeric"
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
                </EntryFormGroup>
            </div>

            <SheetFooter class="grid grid-cols-2 gap-2 border-t p-4">
                <SheetClose as-child>
                    <Button
                        type="button"
                        variant="secondary"
                        class="h-11 cursor-pointer rounded-xl transition-transform active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
                    >
                        {{ $t("views.entry.id.actions.cancel") }}
                    </Button>
                </SheetClose>
                <Button
                    type="submit"
                    class="h-11 cursor-pointer rounded-xl transition-transform active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
                    :disabled="!canSave(values)"
                >
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
