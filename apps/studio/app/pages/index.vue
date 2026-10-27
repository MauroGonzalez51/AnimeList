<script setup lang="ts">
    import type { Layout } from "@/components/domain/entry/layout";
    import { z } from "zod";
    import {
        getStatusChips,
        matchesStatus,
        StatusFilterSchema,
    } from "@/components/domain/entry/filter/status";
    import { LayoutSchema } from "@/components/domain/entry/layout";
    import { KINDS_SCHEMA } from "@/lib/store";
    import { flatToArray } from "~/lib/schema";

    definePageMeta({
        layout: "sidebar",
    });

    const page = useRouteQuery("page", "1", { transform: Number });
    const manager = useStoreManager();
    const { entries } = storeToRefs(manager);

    const config = useConfig();
</script>

<template>
    <FiltersController
        v-slot="{ keys, model, dispatch, debounced, filtered, loading }"
        class="flex flex-col gap-4"
        :fields="{
            name: {
                schema: z.string().optional(),
                sync: true,
                predicate: ({ item, value }) => {
                    if (value) {
                        return item.name.toLowerCase().includes(value);
                    }
                },
            },
            kind: {
                schema: flatToArray(z.array(KINDS_SCHEMA).optional()),
                sync: true,
                predicate: ({ item, value }) => value?.includes(item.kind),
            },
            status: {
                schema: StatusFilterSchema,
                sync: true,
                initialValue: {},
                predicate: ({ item, value }) => matchesStatus(item, value),
            },
            allEntries: {
                schema: z.stringbool(),
                sync: true,
                initialValue: false,
                predicate: ({ item, value }) => value || !item._parentId,
            },
            layout: {
                schema: LayoutSchema,
                sync: true,
                initialValue: 'grid',
            },
        }"
        :items="entries"
    >
        <section class="flex min-h-0 min-w-0 flex-1 flex-col">
            <div
                class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col space-y-4"
            >
                <div class="max-w-xl space-y-2">
                    <p
                        class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase"
                    >
                        {{ $t("views.home.banner.your_library") }}
                    </p>
                    <p
                        v-if="(filtered?.length ?? 0) > 0"
                        class="text-sm leading-relaxed text-muted-foreground"
                    >
                        {{
                            $t("views.home.banner.n_entries", {
                                count: filtered?.length ?? 0,
                            })
                        }}
                    </p>
                </div>
                <DebugBlock :content="{ model, debounced }" />
                <FiltersGroup
                    class="items-end md:grid md:grid-cols-[minmax(0,1fr)_16rem_auto_auto_auto]"
                    :keys="keys"
                >
                    <template #name>
                        <Field class="w-full min-w-0">
                            <FieldLabel>
                                {{ $t("domain.entry.label.name") }}
                            </FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    :default-value="model.name"
                                    @update:model-value="
                                        (value: unknown) => {
                                            if (!value) {
                                                dispatch.reset('name');
                                                return;
                                            }

                                            dispatch.set('name', String(value));
                                        }
                                    "
                                />

                                <InputGroupAddon align="inline-start">
                                    <LucideBook />
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </template>
                    <template #kind>
                        <Popover>
                            <PopoverTrigger as-child>
                                <EntryFilterKindTrigger :kind="model.kind" />
                            </PopoverTrigger>
                            <PopoverContent align="start" class="w-auto p-3">
                                <EntryFilterKindCheckboxGrid
                                    :model-value="model.kind"
                                    @update:model-value="
                                        (value) => dispatch.set('kind', value)
                                    "
                                />
                            </PopoverContent>
                        </Popover>
                    </template>
                    <template #status>
                        <Popover>
                            <PopoverTrigger as-child>
                                <EntryFilterStatusTrigger
                                    :count="
                                        getStatusChips(model.status ?? {})
                                            .length
                                    "
                                />
                            </PopoverTrigger>
                            <PopoverContent align="start" class="w-80 p-3">
                                <EntryFilterStatusContent
                                    :model-value="model.status ?? {}"
                                    @update:model-value="
                                        (value) => dispatch.set('status', value)
                                    "
                                />
                            </PopoverContent>
                        </Popover>
                    </template>
                    <template #allEntries>
                        <EntryFilterShowAll
                            :model-value="model.allEntries"
                            @update:model-value="
                                (value) => dispatch.set('allEntries', value)
                            "
                        />
                    </template>
                    <template #layout>
                        <EntryLayoutToggle
                            :default-value="model.layout"
                            @update:model-value="
                                (layout) => {
                                    $logger.warn(layout);
                                    dispatch.set('layout', layout as Layout);
                                }
                            "
                        />
                    </template>
                </FiltersGroup>

                <EntryFilterStatusChips
                    :model-value="model.status ?? {}"
                    @update:model-value="
                        (value) => dispatch.set('status', value)
                    "
                />

                <PaginationClientSide
                    v-model:page="page"
                    :items="filtered"
                    :loading="loading"
                    index="id"
                    :page-size="15"
                    loading-method="multiple"
                    class="grid w-full min-w-0 grid-cols-3 gap-4"
                >
                    <template #empty>
                        <StoreEmptySelected
                            v-if="config.state.value?.store_path"
                        />
                        <StoreNoSelected v-else />
                    </template>

                    <template
                        v-if="model.layout === 'bento'"
                        #items="{ items: pageItems }"
                    >
                        <EntryBento :entries="pageItems" />
                    </template>

                    <template v-if="model.layout === 'grid'" #item="{ $item }">
                        <EntryTile :entry="$item" />
                    </template>

                    <template #loading>
                        <SkeletonsEntryTile class="min-w-0" />
                    </template>
                </PaginationClientSide>
            </div>
        </section>
    </FiltersController>
</template>
