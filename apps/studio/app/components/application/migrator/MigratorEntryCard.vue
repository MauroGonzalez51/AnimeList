<script setup lang="ts">
    const migrator = useMigratorManager();
    const { entries } = storeToRefs(useStoreManager());

    const selected = computed(() =>
        entries.value.find((entry) => entry.id === migrator.targetId),
    );

    const query = useRouteQuery("q", "");
    const results = computed(() => {
        const term = query.value.trim().toLowerCase();
        if (!term) {
            return entries.value;
        }

        return entries.value.filter((entry) =>
            entry.name.toLowerCase().includes(term),
        );
    });
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
    </div>
</template>
