<script setup lang="ts">
    import type { EntryDraft, FlatEntry } from "~/lib/schema";
    import { EntrySchema } from "@animelist/packages-schema";
    import { cloneDeep, isEqual, omit } from "es-toolkit";
    import {
        isReadableKind,
        isUniverseKind,
        KINDS,
        kindsInFamily,
    } from "~/lib/store";
    import { prune } from "~/lib/utils";

    interface Props {
        entry?: FlatEntry;
        hints?: Partial<EntryDraft>;
        submit: (draft: EntryDraft) => void;
    }

    const props = defineProps<Props>();

    const modal = useModal();

    const initialValues = computed(() => {
        if (!props.entry) {
            return { kind: "anime", ...props.hints };
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

    function onSubmit(values: unknown) {
        const { id, references, children, related, ...draft } =
            EntrySchema.parse(prune(values));

        props.submit(draft);
        modal.dispatch.setOpen(false);
    }
</script>

<template>
    <SheetContent class="gap-0 sm:max-w-lg" @open-auto-focus.prevent>
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
                class="flex flex-1 flex-col gap-10 overflow-y-auto px-4 pt-6 pb-10"
            >
                <EntryFormGroup
                    :title="$t('views.entry.id.form.sections.general')"
                >
                    <EntryFormText
                        name="name"
                        :label="$t('views.entry.id.form.fields.name')"
                    />
                    <EntryFormKind :kinds="kinds" />
                    <EntryFormText
                        name="chronology"
                        :label="$t('views.entry.id.form.fields.chronology')"
                    />
                    <EntryFormText
                        name="notes"
                        multiline
                        :label="$t('views.entry.id.form.fields.notes')"
                    />
                </EntryFormGroup>

                <EntryFormStatus
                    v-if="!isUniverseKind(values.kind)"
                    :kind="values.kind"
                />

                <EntryFormAdaptedUntil v-if="isReadableKind(values.kind)" />
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
