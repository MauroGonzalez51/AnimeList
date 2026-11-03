<script setup lang="ts">
    import type { SourceType } from "~/lib/schema";

    const migrator = useMigratorManager();
    const manager = useStoreManager();
    const { entries } = storeToRefs(manager);
    const { create } = useEntryForm();

    const selected = computed(() =>
        (entries.value ?? []).find((entry) => entry.id === migrator.targetId),
    );

    const query = useRouteQuery("q", "");
    const results = computed(() => {
        const list = entries.value ?? [];
        const term = query.value.trim().toLowerCase();
        if (!term) {
            return list;
        }

        return list.filter((entry) => entry.name.toLowerCase().includes(term));
    });

    function createRoot() {
        create({ onCreated: migrator.dispach.clear });
    }

    function createWith(source: SourceType) {
        const entry = selected.value;
        if (!entry) {
            return;
        }

        const id = manager.dispatch.ensureStableId(entry.id);
        create({
            parent: { id, source },
            onCreated: migrator.dispach.clear,
        });
    }

    const createItems = computed<Components.Dropdown.Item[][]>(() => [
        [
            {
                label: "migrate.entry.create_root",
                action: createRoot,
            },
            {
                label: "migrate.entry.create_children",
                action: () => createWith("children"),
            },
            {
                label: "migrate.entry.create_related",
                action: () => createWith("related"),
            },
        ],
    ]);
</script>

<template>
    <div class="flex w-full flex-col gap-4">
        <Card class="w-full">
            <CardHeader>
                <CardTitle>{{ $t("migrate.entry.title") }}</CardTitle>
                <CardDescription class="tabular-nums">
                    {{ $t("migrate.entry.results", { count: results.length }) }}
                </CardDescription>
            </CardHeader>

            <CardContent class="flex flex-col gap-4">
                <InputGroup>
                    <InputGroupInput
                        v-model="query"
                        :placeholder="$t('migrate.entry.search_placeholder')"
                    />
                    <InputGroupAddon align="inline-start">
                        <LucideSearch />
                    </InputGroupAddon>
                </InputGroup>

                <VirtualList
                    v-if="results.length"
                    :key="query"
                    :items="results"
                    :item-height="56"
                    :item-key="(entry) => entry.id"
                    class="h-72 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50 [&::-webkit-scrollbar-track]:bg-transparent"
                >
                    <template #item="{ item }">
                        <MigratorEntryRow
                            :entry="item"
                            :selected="item.id === selected?.id"
                            @click="migrator.dispach.pick(item.id)"
                        />
                    </template>
                </VirtualList>
                <p v-else class="text-sm text-muted-foreground">
                    {{ $t("migrate.entry.empty") }}
                </p>
            </CardContent>
        </Card>

        <EntryTile v-if="selected" :entry="selected" />

        <div v-if="selected" class="flex gap-2">
            <DropdownMenuRoot
                :items="createItems"
                :content-props="{ align: 'start' }"
            >
                <template #trigger>
                    <Button
                        class="cursor-pointer active:scale-[0.97] motion-reduce:active:scale-100"
                    >
                        <LucidePlus :aria-hidden="true" />
                        {{ $t("migrate.entry.create") }}
                    </Button>
                </template>
            </DropdownMenuRoot>
            <Button
                variant="outline"
                class="cursor-pointer active:scale-[0.97] motion-reduce:active:scale-100"
                @click="migrator.dispach.clear"
            >
                {{ $t("migrate.entry.deselect") }}
            </Button>
        </div>
    </div>
</template>
