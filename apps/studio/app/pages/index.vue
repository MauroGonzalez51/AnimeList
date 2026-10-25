<script setup lang="ts">
    import { z } from "zod";
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
                <FiltersGroup class="items-end" :keys="keys">
                    <template #name>
                        <Field class="flex-1 max-w-96">
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
                                <EntryFilterKindTrigger
                                    :kind="model.kind"
                                    class="flex-1 max-w-64"
                                />
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
                </FiltersGroup>

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

                    <template #items="{ items: pageItems }">
                        <EntryBento :entries="pageItems" />
                    </template>

                    <template #loading>
                        <SkeletonsEntryTile class="min-w-0" />
                    </template>
                </PaginationClientSide>
            </div>
        </section>
    </FiltersController>
</template>
