<script setup lang="ts">
    import { z } from "zod";
    import { KINDS_SCHEMA } from "@/lib/store";

    definePageMeta({
        layout: "sidebar",
    });

    const page = useRouteQuery("page", "1", { transform: Number });
    const manager = useStoreManager();
    const { entries } = storeToRefs(manager);

    const config = useConfig();
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
            <FiltersController
                v-slot="{ keys, model, dispatch, debounced, filtered }"
                class="flex flex-col gap-4"
                :fields="{
                    kind: {
                        schema: z.preprocess((value) => {
                            if (value === undefined) {
                                return undefined;
                            }

                            return [value].flat();
                        }, z.array(KINDS_SCHEMA).optional()),
                        sync: true,
                        predicate: ({ item, value }) =>
                            value?.includes(item.kind),
                    },
                }"
                :items="entries"
            >
                <DebugBlock :content="{ debounced }" />
                <FiltersGroup :keys="keys">
                    <template #kind>
                        <Popover>
                            <PopoverTrigger as-child>
                                <Button
                                    variant="outline"
                                    class="justify-between"
                                >
                                    {{ $t("domain.entry.kind.placeholder") }}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" class="w-auto p-3">
                                <EntryKindCheckboxGrid
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
                    index="id"
                    :page-size="15"
                    loading-method="single"
                    class="grid w-full min-w-0 grid-cols-3 gap-4"
                >
                    <template #empty>
                        <StoreEmptySelected
                            v-if="config.state.value?.store_path"
                        />
                        <StoreNoSelected v-else />
                    </template>

                    <template #item="{ $item }">
                        <EntryTile :entry="$item" class="min-w-0" />
                    </template>
                </PaginationClientSide>
            </FiltersController>
        </div>
    </section>
</template>
