<script setup lang="ts">
    import type { FlatEntry, SourceType } from "~/lib/schema";
    import { useFilter } from "reka-ui";
    import { KIND_LABELS } from "~/lib/store";

    interface Props {
        store: ReturnType<typeof useMigratorStore>;
    }

    const props = defineProps<Props>();

    const emit = defineEmits<{
        create: [];
        attach: [source: SourceType];
        edit: [];
    }>();

    const target = defineModel<FlatEntry | undefined>("target");

    const { t } = useI18n();
    const search = ref("");
    const { contains } = useFilter({ sensitivity: "base" });

    function matchingEntries() {
        return (props.store.entries.value ?? []).filter((entry) =>
            contains(
                [entry.name, entry.chronology, t(KIND_LABELS[entry.kind])]
                    .filter(Boolean)
                    .join(" "),
                search.value,
            ),
        );
    }

    const yaml = computed(() => {
        if (!target.value) {
            return undefined;
        }

        return props.store.dispatch.toYaml(target.value.id);
    });

    function pick(id: unknown) {
        if (typeof id !== "string") {
            return;
        }

        if (target.value?.id === id) {
            target.value = undefined;
            return;
        }

        target.value = props.store.entriesMap.value.get(id);
    }
</script>

<template>
    <Card class="self-start">
        <CardHeader>
            <CardTitle>{{ t("migrate.store.title") }}</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
            <Combobox
                v-model:search-term="search"
                :model-value="target?.id"
                :ignore-filter="true"
                @update:model-value="pick"
            >
                <ComboboxAnchor class="w-full">
                    <ComboboxTrigger as-child>
                        <Button
                            type="button"
                            variant="outline"
                            class="w-full cursor-pointer justify-between gap-2 font-normal"
                        >
                            <span class="flex min-w-0 items-center gap-2">
                                <MigratorEntrySwatch
                                    v-if="target"
                                    :id="target.id"
                                    class="size-4"
                                />
                                <span class="min-w-0 truncate">
                                    <template v-if="target">
                                        {{ target.name }}
                                    </template>
                                    <template v-else>
                                        {{
                                            t(
                                                "migrate.store.search_placeholder",
                                            )
                                        }}
                                    </template>
                                </span>
                            </span>
                            <LucideChevronsUpDown class="size-4 opacity-50" />
                        </Button>
                    </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList class="w-(--reka-popper-anchor-width)">
                    <ComboboxInput
                        :display-value="() => ''"
                        :placeholder="t('migrate.store.search_placeholder')"
                    />
                    <ComboboxEmpty
                        class="px-3 py-4 text-center text-sm text-muted-foreground"
                    >
                        {{ t("migrate.store.none_found") }}
                    </ComboboxEmpty>
                    <ComboboxViewport class="max-h-72 overflow-y-auto p-1">
                        <ComboboxGroup>
                            <ComboboxItem
                                v-for="entry in matchingEntries()"
                                :key="entry.id"
                                :value="entry.id"
                                class="items-center justify-between gap-3"
                            >
                                <span class="flex min-w-0 items-center gap-2.5">
                                    <MigratorEntrySwatch :id="entry.id" />
                                    <span class="flex min-w-0 flex-col">
                                        <span class="truncate font-medium">
                                            {{ entry.name }}
                                        </span>
                                        <span
                                            v-if="entry.chronology"
                                            class="truncate text-xs text-muted-foreground"
                                        >
                                            {{ entry.chronology }}
                                        </span>
                                    </span>
                                </span>
                                <Badge
                                    variant="outline"
                                    class="shrink-0 font-normal"
                                >
                                    {{ t(KIND_LABELS[entry.kind]) }}
                                </Badge>
                            </ComboboxItem>
                        </ComboboxGroup>
                    </ComboboxViewport>
                </ComboboxList>
            </Combobox>

            <div class="flex flex-col gap-2">
                <Button
                    variant="outline"
                    class="cursor-pointer"
                    @click="emit('create')"
                >
                    {{ t("migrate.store.create") }}
                </Button>
                <template v-if="target">
                    <Button
                        variant="outline"
                        class="cursor-pointer"
                        @click="emit('attach', 'children')"
                    >
                        {{ t("migrate.store.attach_children") }}
                    </Button>
                    <Button
                        variant="outline"
                        class="cursor-pointer"
                        @click="emit('attach', 'related')"
                    >
                        {{ t("migrate.store.attach_related") }}
                    </Button>
                    <Button
                        variant="outline"
                        class="cursor-pointer"
                        @click="emit('edit')"
                    >
                        {{ t("migrate.store.edit") }}
                    </Button>
                </template>
            </div>

            <div v-if="target" class="flex flex-col gap-3">
                <EntryTile :entry="target" />

                <Sheet>
                    <SheetTrigger as-child>
                        <Button variant="secondary" class="cursor-pointer">
                            <LucideFileText data-icon="inline-start" />
                            {{ t("migrate.store.view_on_disk") }}
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        class="flex w-full flex-col gap-4 sm:max-w-xl"
                    >
                        <SheetHeader>
                            <SheetTitle>
                                {{ t("migrate.store.on_disk") }}
                            </SheetTitle>
                            <SheetDescription>
                                {{ t("migrate.store.on_disk_note") }}
                            </SheetDescription>
                        </SheetHeader>
                        <CodeBlock
                            size="sm"
                            class="min-h-0 flex-1 overflow-auto"
                        >
                            <CodeBlockContent wrap>{{ yaml }}</CodeBlockContent>
                        </CodeBlock>
                    </SheetContent>
                </Sheet>
            </div>
        </CardContent>
    </Card>
</template>
