<script setup lang="ts">
    import { isEqual } from "es-toolkit";
    import { z } from "zod";
    import { buildEntryTree, entryText } from "~/lib/schema";
    import { KIND_LABELS } from "~/lib/store";

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
    const entryForm = useEntryForm();
    const { progress } = useEntryDisplay(entry);
    const gradient = useEntryGradient(() => entry.value?.id ?? ENTRY_ID.value);

    const { define: DefineStatus, reuse: ReuseStatus } =
        createReusableTemplate<{
            done: boolean | undefined;
            rating: number | undefined;
            review: Parameters<typeof entryText>[0] | undefined;
        }>();

    const NAME_SCHEMA = computed(() =>
        z.object({
            name: z.string().min(1, { error: $t("validation.required") }),
        }),
    );
</script>

<template>
    <section v-if="entry" class="flex min-h-0 min-w-0 flex-1 flex-col">
        <DefineStatus v-slot="{ done, rating, review }">
            <Card v-if="progress || rating || review">
                <CardHeader>
                    <CardTitle class="text-sm">
                        {{ $t("views.entry.id.sections.status") }}
                    </CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col gap-4 text-sm">
                    <div
                        v-if="progress"
                        class="flex items-center gap-2 font-medium"
                    >
                        <LucideCheck v-if="done" class="size-4" />
                        <LucidePlay v-else class="size-4" />
                        {{ progress }}
                    </div>

                    <div v-if="rating" class="flex items-center gap-2">
                        <LucideStar
                            class="size-4 fill-amber-400 text-amber-400"
                            :aria-hidden="true"
                        />
                        <span class="font-medium">{{ rating.toFixed(1) }}</span>
                        <span class="text-muted-foreground">
                            {{ $t("views.entry.id.sections.rating") }}
                        </span>
                    </div>

                    <div v-if="review" class="flex flex-col gap-1">
                        <span class="text-xs font-medium text-muted-foreground">
                            {{ $t("views.entry.id.sections.review") }}
                        </span>
                        <p class="leading-relaxed">{{ entryText(review) }}</p>
                    </div>
                </CardContent>
            </Card>
        </DefineStatus>

        <div
            class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4"
        >
            <VeeForm
                :key="entry.name"
                v-slot="{ values }"
                :validation-schema="toTypedSchema(NAME_SCHEMA)"
                :style="gradient"
                class="relative flex min-h-56 w-full flex-col justify-between gap-8 overflow-hidden rounded-2xl p-5 text-white shadow-md"
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
                <div
                    class="absolute inset-0 bg-linear-to-b from-black/0 via-black/10 to-black/50"
                />

                <div class="relative flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            class="cursor-pointer rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:text-white"
                            @click="navigate"
                        >
                            <LucideArrowLeft :aria-hidden="true" />
                        </Button>

                        <Badge
                            variant="secondary"
                            class="border-white/20 bg-white/15 text-white backdrop-blur-md"
                        >
                            <EntryDiscriminator :entry="entry">
                                <template #universe>
                                    <LucideGlobe data-icon="inline-start" />
                                </template>

                                <template #readable>
                                    <LucideBookOpen data-icon="inline-start" />
                                </template>

                                <template #watchable>
                                    <LucideClapperboard
                                        data-icon="inline-start"
                                    />
                                </template>
                            </EntryDiscriminator>
                            <TranslatedMessage
                                :keypath="KIND_LABELS[entry.kind]"
                            />
                        </Badge>
                    </div>

                    <div class="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            class="cursor-pointer rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:text-white"
                            @click="entry && entryForm.edit(entry, sync)"
                        >
                            <LucideSquarePen :aria-hidden="true" />
                        </Button>

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
                            variant="secondary"
                            size="sm"
                            type="submit"
                            class="cursor-pointer rounded-full bg-background text-foreground hover:bg-background/90"
                        >
                            <LucideSave data-icon="inline-start" />
                            {{ $t("actions.entry.save.label") }}
                        </Button>
                    </div>
                </div>

                <VeeField v-slot="{ componentField, errors }" name="name">
                    <Field class="relative gap-1">
                        <FieldLabel
                            class="text-[10px] font-semibold tracking-[0.2em] text-white/70 uppercase"
                        >
                            {{ $t("views.entry.id.banner.entry") }}
                        </FieldLabel>
                        <InlineEdit>
                            <template #input="{ id, end }">
                                <InputGroup
                                    class="bg-background text-foreground"
                                >
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
                                    class="wrap-break-word text-4xl leading-[1.05] font-semibold tracking-[-0.02em] drop-shadow-sm"
                                    @click="start"
                                    @keydown.enter="start"
                                >
                                    {{ entry.name }}
                                </h1>
                            </template>
                        </InlineEdit>
                        <p
                            v-if="entry.chronology"
                            class="text-sm text-white/80"
                        >
                            {{ entry.chronology }}
                        </p>
                        <FieldError v-if="errors.length" :errors="errors" />
                    </Field>
                </VeeField>
            </VeeForm>

            <DebugBlock :content="tree" />

            <EntryNodeCard
                :title="$t('views.entry.id.sections.children')"
                :nodes="tree?.children ?? []"
                :parent-id="entry.id"
                source="children"
            />

            <div class="grid gap-4 md:grid-cols-2">
                <EntryDiscriminator :entry="entry">
                    <template #readable="{ readable: { status } }">
                        <ReuseStatus
                            :done="status?.completed || status?.watched"
                            :rating="status?.rating"
                            :review="status?.review"
                        />
                    </template>

                    <template #watchable="{ watchable: { status } }">
                        <ReuseStatus
                            :done="status?.watched"
                            :rating="status?.rating"
                            :review="status?.review"
                        />
                    </template>
                </EntryDiscriminator>

                <EntryDiscriminator :entry="entry">
                    <template #readable="{ readable: { adaptedUntil } }">
                        <Card v-if="adaptedUntil">
                            <CardHeader>
                                <CardTitle class="text-sm">
                                    {{
                                        $t(
                                            "views.entry.id.sections.adapted_until",
                                        )
                                    }}
                                </CardTitle>
                            </CardHeader>
                            <CardContent
                                class="flex flex-col gap-1 text-sm font-medium"
                            >
                                <span v-if="adaptedUntil.kind">
                                    <TranslatedMessage
                                        :keypath="
                                            KIND_LABELS[adaptedUntil.kind]
                                        "
                                    />
                                </span>
                                <span v-if="adaptedUntil.volume">
                                    {{
                                        $t(
                                            "domain.entry.adapted_until.volume",
                                            { volume: adaptedUntil.volume },
                                        )
                                    }}
                                </span>
                                <span v-if="adaptedUntil.arc">
                                    {{
                                        $t("domain.entry.adapted_until.arc", {
                                            arc: adaptedUntil.arc,
                                        })
                                    }}
                                </span>
                                <span v-if="adaptedUntil.chapter">
                                    {{
                                        $t("domain.entry.status.chapter", {
                                            chapter: adaptedUntil.chapter,
                                        })
                                    }}
                                </span>
                                <span v-if="adaptedUntil.episode">
                                    {{
                                        $t("domain.entry.status.episode", {
                                            episode: adaptedUntil.episode,
                                        })
                                    }}
                                </span>
                                <p
                                    v-if="adaptedUntil.notes"
                                    class="font-normal text-muted-foreground"
                                >
                                    {{ entryText(adaptedUntil.notes) }}
                                </p>
                            </CardContent>
                        </Card>
                    </template>
                </EntryDiscriminator>

                <Card v-if="entry.notes">
                    <CardHeader>
                        <CardTitle class="text-sm">
                            {{ $t("views.entry.id.sections.notes") }}
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="text-sm leading-relaxed">
                        {{ entryText(entry.notes) }}
                    </CardContent>
                </Card>

                <EntryReferencesCard :entry="entry" />

                <EntryNodeCard
                    :title="$t('views.entry.id.sections.related')"
                    :nodes="tree?.related ?? []"
                    :parent-id="entry.id"
                    source="related"
                />
            </div>

            <div class="py-12" />
        </div>
    </section>
</template>
