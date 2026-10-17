<script setup lang="ts">
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

    const { navigate } = useCallbackUrl();
</script>

<template>
    <section v-if="entry" class="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
            class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col space-y-2"
        >
            <div class="flex w-full items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        class="cursor-pointer"
                        size="icon-lg"
                        @click="navigate"
                    >
                        <LucideArrowLeft class="size-5" />
                    </Button>
                    <div class="space-y-1">
                        <p
                            class="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
                        >
                            {{ $t("views.entry.id.banner.entry") }}
                        </p>
                        <h1 class="font-bold text-3xl wrap-break-word">
                            {{ entry?.name }}
                        </h1>
                    </div>
                </div>
                <div>
                    <EntryDiscriminator :entry="entry">
                        <template #readable="{ readable }">
                            <EntryFavoriteBadge
                                :entry="entry"
                                :favorite="readable.status?.favorite"
                            />
                        </template>

                        <template #watchable="{ watchable }">
                            <EntryFavoriteBadge
                                variant="default"
                                :entry="entry"
                                :favorite="watchable.status?.favorite"
                            />
                        </template>
                    </EntryDiscriminator>
                </div>
            </div>
        </div>
    </section>
</template>
