<script setup lang="ts">
    interface Props {
        migrator: ReturnType<typeof useMigrator>;
    }

    const props = defineProps<Props>();

    const query = defineModel<string>("query", { default: "" });

    const current = computed(
        () => props.migrator.dispatch.searchSource(query.value)[0],
    );

    const drifts = computed(() => {
        const entry = current.value;
        if (!entry) {
            return false;
        }

        return props.migrator.dispatch.drifts(entry.record);
    });

    function selectKey(value: unknown) {
        props.migrator.dispatch.selectKey(String(value));
    }

    function skip() {
        if (!current.value) {
            return;
        }

        props.migrator.dispatch.skip(current.value.key);
    }

    function resolve() {
        if (!current.value) {
            return;
        }

        props.migrator.dispatch.resolve(current.value.key);
    }
</script>

<template>
    <Card class="self-start">
        <CardHeader>
            <CardTitle>{{ $t("migrate.source.title") }}</CardTitle>
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
                @update:model-value="selectKey"
            >
                <SelectTrigger class="w-full cursor-pointer">
                    <SelectValue
                        :placeholder="
                            $t('migrate.collection.select_field_placeholder')
                        "
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="key in migrator.keys.value"
                        :key="key"
                        :value="key"
                        class="cursor-pointer"
                    >
                        {{ key }}
                    </SelectItem>
                </SelectContent>
            </Select>

            <Input
                v-model="query"
                :placeholder="$t('migrate.source.search_placeholder')"
            />

            <Empty v-if="!current">
                <EmptyHeader>
                    <EmptyTitle>
                        {{ $t("migrate.source.none_pending") }}
                    </EmptyTitle>
                </EmptyHeader>
            </Empty>

            <div v-else class="flex flex-col gap-4">
                <MigratorSourceEntry
                    :record="current.record"
                    :drifts="drifts"
                />

                <div class="grid grid-cols-2 gap-2">
                    <Button
                        variant="secondary"
                        class="cursor-pointer"
                        @click="skip"
                    >
                        {{ $t("migrate.actions.skip") }}
                    </Button>
                    <Button class="cursor-pointer" @click="resolve">
                        {{ $t("migrate.actions.resolve") }}
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
