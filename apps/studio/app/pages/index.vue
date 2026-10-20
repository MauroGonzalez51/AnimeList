<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const page = useRouteQuery("page", "1", { transform: Number });
    const manager = useStoreManager();
    const { entries } = storeToRefs(manager);

    const config = useConfig();
    const entryForm = useEntryForm();
    const hasStore = computed(() => Boolean(config.state.value?.store_path));
</script>

<template>
    <section class="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
            class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col space-y-2"
        >
            <div class="max-w-xl space-y-2">
                <p
                    class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase"
                >
                    {{ $t("views.home.banner.your_library") }}
                </p>
                <p
                    v-if="(entries?.length ?? 0) > 0"
                    class="text-sm leading-relaxed text-muted-foreground"
                >
                    {{
                        $t("views.home.banner.n_entries", {
                            count: entries?.length ?? 0,
                        })
                    }}
                </p>
            </div>
            <PaginationClientSide
                v-model:page="page"
                :items="entries"
                index="id"
                :page-size="15"
                loading-method="single"
                :condition="
                    (item) => {
                        if (item._parentId) {
                            return false;
                        }
                    }
                "
                class="grid w-full min-w-0 grid-cols-3 gap-4"
            >
                <template #empty>
                    <Empty v-if="hasStore" class="h-full">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <LucideLibrary />
                            </EmptyMedia>
                            <EmptyTitle>
                                {{ $t("views.home.empty.no_entries.title") }}
                            </EmptyTitle>
                            <EmptyDescription>
                                {{
                                    $t(
                                        "views.home.empty.no_entries.description",
                                    )
                                }}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button
                                class="cursor-pointer"
                                @click="entryForm.create()"
                            >
                                {{ $t("views.home.empty.no_entries.action") }}
                            </Button>
                        </EmptyContent>
                    </Empty>

                    <Empty v-else class="h-full">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <LucideFolderOpen />
                            </EmptyMedia>
                            <EmptyTitle>
                                {{ $t("views.home.empty.no_store.title") }}
                            </EmptyTitle>
                            <EmptyDescription>
                                {{
                                    $t("views.home.empty.no_store.description")
                                }}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button
                                class="cursor-pointer"
                                @click="manager.dispatch.pick()"
                            >
                                {{ $t("views.home.empty.no_store.action") }}
                            </Button>
                        </EmptyContent>
                    </Empty>
                </template>

                <template #item="{ $item }">
                    <EntryTile :entry="$item" class="min-w-0" />
                </template>
            </PaginationClientSide>
        </div>
    </section>
</template>
