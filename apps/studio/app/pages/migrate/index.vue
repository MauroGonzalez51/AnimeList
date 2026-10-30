<script setup lang="ts">
    import type { FlatEntry } from "~/lib/schema";
    import { entryText } from "~/lib/schema";

    definePageMeta({
        layout: "sidebar",
    });

    const migrator = useMigrator();
    const store = useMigratorStore();

    const sourceQuery = ref("");
    const storeQuery = ref("");

    const sourceResults = computed(() =>
        migrator.dispatch.searchSource(sourceQuery.value),
    );

    const storeResults = computed(() =>
        store.dispatch.search(storeQuery.value),
    );

    // the single source entry currently being processed: the first still-pending
    // entry that survives the source search
    const current = computed(() => sourceResults.value[0]);

    const currentDrifts = computed(() => {
        const entry = current.value;
        if (!entry) {
            return false;
        }

        return migrator.dispatch.drifts(entry.record);
    });

    const attachTarget = ref<FlatEntry | undefined>(undefined);

    // a manual starting hint only; never an automatic mapping of source fields
    const hints = computed(() => {
        const record = current.value?.record;
        if (!record) {
            return undefined;
        }

        const label = record.label ?? record.name ?? record.title;
        if (typeof label !== "string") {
            return undefined;
        }

        return { name: label };
    });

    function fieldValue(record: Record<string, unknown>, key: string) {
        const value = record[key];
        if (value === undefined || value === null) {
            return "";
        }

        return entryText(value as Parameters<typeof entryText>[0]);
    }

    function pickTarget(entry: FlatEntry) {
        attachTarget.value = entry;
    }

    function create() {
        store.dispatch.create(hints.value);
    }

    function attachChildren() {
        if (!attachTarget.value) {
            return;
        }

        store.dispatch.attach(attachTarget.value.id, "children", hints.value);
    }

    function attachRelated() {
        if (!attachTarget.value) {
            return;
        }

        store.dispatch.attach(attachTarget.value.id, "related", hints.value);
    }

    function edit() {
        if (!attachTarget.value) {
            return;
        }

        store.dispatch.edit(attachTarget.value);
    }

    function resolveCurrent() {
        if (!current.value) {
            return;
        }

        migrator.dispatch.resolve(current.value.key);
    }

    function skipCurrent() {
        if (!current.value) {
            return;
        }

        migrator.dispatch.skip(current.value.key);
    }
</script>

<template>
    <section class="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
        <DropZoneArea @click="migrator.dispatch.load" />

        <div v-if="migrator.hasSource.value" class="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {{
                            $t("migrate.source.search_placeholder")
                        }}
                    </CardTitle>
                    <CardDescription v-if="migrator.pending.value.length">
                        {{
                            $t("migrate.source.remaining", {
                                count: migrator.pending.value.length,
                            })
                        }}
                    </CardDescription>
                </CardHeader>
                <CardContent class="flex flex-col gap-4">
                    <Select
                        v-if="!migrator.isArray.value"
                        :model-value="migrator.selectedKey.value"
                        @update:model-value="
                            (value) =>
                                migrator.dispatch.selectKey(String(value))
                        "
                    >
                        <SelectTrigger class="w-full">
                            <SelectValue
                                :placeholder="
                                    $t(
                                        'migrate.collection.select_field_placeholder',
                                    )
                                "
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="key in migrator.keys.value"
                                :key="key"
                                :value="key"
                            >
                                {{ key }}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        v-model="sourceQuery"
                        :placeholder="$t('migrate.source.search_placeholder')"
                    />

                    <Empty v-if="!current">
                        <EmptyHeader>
                            <EmptyTitle>
                                {{ $t("migrate.source.none_pending") }}
                            </EmptyTitle>
                        </EmptyHeader>
                    </Empty>

                    <div v-else class="flex flex-col gap-3">
                        <Badge v-if="currentDrifts" variant="destructive">
                            {{ $t("migrate.source.drift_warning") }}
                        </Badge>

                        <dl
                            class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm"
                        >
                            <template
                                v-for="(_, key) in current.record"
                                :key="key"
                            >
                                <dt class="font-medium text-muted-foreground">
                                    {{ key }}
                                </dt>
                                <dd class="truncate">
                                    {{ fieldValue(current.record, key) }}
                                </dd>
                            </template>
                        </dl>

                        <div class="grid grid-cols-2 gap-2">
                            <Button variant="secondary" @click="skipCurrent">
                                {{ $t("migrate.actions.skip") }}
                            </Button>
                            <Button @click="resolveCurrent">
                                {{ $t("migrate.actions.resolve") }}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {{
                            $t("migrate.store.search_placeholder")
                        }}
                    </CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col gap-4">
                    <Input
                        v-model="storeQuery"
                        :placeholder="$t('migrate.store.search_placeholder')"
                    />

                    <ScrollArea class="h-48 rounded-md border">
                        <div class="flex flex-col">
                            <button
                                v-for="entry in storeResults"
                                :key="entry.id"
                                type="button"
                                class="cursor-pointer px-3 py-2 text-left text-sm hover:bg-muted"
                                :class="
                                    attachTarget?.id === entry.id && 'bg-muted'
                                "
                                @click="pickTarget(entry)"
                            >
                                {{ entry.name }}
                            </button>
                        </div>
                    </ScrollArea>

                    <div class="flex flex-col gap-2">
                        <Button variant="outline" @click="create">
                            {{ $t("migrate.store.create") }}
                        </Button>
                        <Button
                            variant="outline"
                            :disabled="!attachTarget"
                            @click="attachChildren"
                        >
                            {{ $t("migrate.store.attach_children") }}
                        </Button>
                        <Button
                            variant="outline"
                            :disabled="!attachTarget"
                            @click="attachRelated"
                        >
                            {{ $t("migrate.store.attach_related") }}
                        </Button>
                        <Button
                            variant="outline"
                            :disabled="!attachTarget"
                            @click="edit"
                        >
                            {{ $t("migrate.store.edit") }}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </section>
</template>
