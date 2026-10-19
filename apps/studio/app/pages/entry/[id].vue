<script setup lang="ts">
    import { isEqual } from "es-toolkit";
    import { z } from "zod";
    import { buildEntryTree } from "~/lib/schema";

    definePageMeta({
        layout: "sidebar",
        i18n: {
            paths: {
                en: "/entry/[id]",
            },
        },
    });

    const ENTRY_ID = useRouteParams("id", "", {
        transform(value) {
            return String(value ?? "");
        },
    });
    const setI18nParams = useSetI18nParams();
    watch(ENTRY_ID, (id) => setI18nParams({ en: { id } }), { immediate: true });

    const manager = useStoreManager();
    const { entriesMap } = storeToRefs(manager);

    const entry = computed(() => entriesMap.value.get(ENTRY_ID.value));
    const tree = computed(() =>
        buildEntryTree(entriesMap.value, ENTRY_ID.value),
    );

    const { cloned: localEntry, sync } = useCloned(entry, {
        deep: true,
        manual: true,
    });

    const { navigate } = useCallbackUrl();

    const NAME_SCHEMA = computed(() =>
        z.object({
            name: z.string().min(1, { error: $t("validation.required") }),
        }),
    );
</script>

<template>
    <section v-if="entry" class="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
            class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col space-y-4"
        >
            <VeeForm
                v-slot="{ values }"
                :validation-schema="toTypedSchema(NAME_SCHEMA)"
                class="flex w-full items-center justify-between gap-4"
                :initial-values="{ name: entry.name }"
                @submit="
                    (values) => {
                        const { name } = NAME_SCHEMA.parse(values);
                        if (entry) {
                            manager.dispatch
                                .patchEntry(entry.id, 'name', name)
                                .then(() => sync());
                        }
                    }
                "
            >
                <div class="flex items-center gap-1.5 flex-1">
                    <Button
                        type="button"
                        variant="ghost"
                        class="cursor-pointer"
                        size="icon-lg"
                        @click="navigate"
                    >
                        <LucideArrowLeft class="size-5" />
                    </Button>

                    <VeeField v-slot="{ componentField, errors }" name="name">
                        <Field class="gap-1">
                            <FieldLabel
                                class="text-[10px] pl-2 font-semibold tracking-[0.2em] text-muted-foreground uppercase"
                            >
                                {{ $t("views.entry.id.banner.entry") }}
                            </FieldLabel>
                            <EditableText>
                                <template #input="{ id, end }">
                                    <InputGroup>
                                        <InputGroupInput
                                            v-bind="componentField"
                                            :id="id"
                                            class="font-semibold"
                                            :aria-invalid="!!errors.length"
                                            @blur="end"
                                            @keydown.enter="end"
                                        />
                                    </InputGroup>
                                </template>
                                <template #display="{ start }">
                                    <h1
                                        role="button"
                                        tabindex="0"
                                        class="font-bold text-3xl wrap-break-word"
                                        @click="start"
                                        @keydown.enter="start"
                                    >
                                        {{ entry.name }}
                                    </h1>
                                </template>
                            </EditableText>
                            <FieldError v-if="errors.length" :errors="errors" />
                        </Field>
                    </VeeField>
                </div>
                <div class="flex items-center gap-2">
                    <EntryDiscriminator :entry="entry">
                        <template #readable="{ readable }">
                            <EntryFavoriteBadge
                                :entry="entry"
                                :favorite="readable.status?.favorite"
                            />
                        </template>

                        <template #watchable="{ watchable }">
                            <EntryFavoriteBadge
                                :entry="entry"
                                :favorite="watchable.status?.favorite"
                            />
                        </template>
                    </EntryDiscriminator>

                    <Button
                        v-if="!isEqual(values.name, localEntry?.name)"
                        variant="outline"
                        type="submit"
                        class="cursor-pointer"
                    >
                        <LucideSave />
                        {{ $t("actions.entry.save.label") }}
                    </Button>
                </div>
            </VeeForm>

            <DebugBlock :content="entry" />
            <DebugBlock :content="tree" />

            <div class="py-12" />
        </div>
    </section>
</template>
