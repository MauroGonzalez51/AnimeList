<script setup lang="ts">
    import type { AcceptableValue } from "reka-ui";
    import type { EntryKind } from "@/lib/store";
    import { KIND_LABELS, KINDS_SCHEMA } from "@/lib/store";

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
                v-slot="{ keys, dispatch, model, debounced, filtered }"
                class="flex flex-col gap-4"
                :fields="{
                    kind: {
                        schema: KINDS_SCHEMA,
                        sync: true,
                        predicate: ({ item, value }) => item.kind === value,
                    },
                }"
                :items="entries"
            >
                <DebugBlock :content="{ debounced }" />
                <FiltersGroup :keys="keys">
                    <template #kind>
                        <Select
                            :default-value="model.kind"
                            @update:model-value="
                                (value: AcceptableValue) => {
                                    dispatch.set('kind', value as EntryKind);
                                }
                            "
                        >
                            <SelectTrigger>
                                <SelectValue
                                    :placeholder="
                                        $t('domain.entry.kind.placeholder')
                                    "
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="option in KINDS_SCHEMA.options"
                                    :key="option.value"
                                    :value="option.value"
                                >
                                    <TranslatedMessage
                                        :keypath="KIND_LABELS[option.value]"
                                    />
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </template>
                </FiltersGroup>

                <PaginationClientSide
                    v-model:page="page"
                    :items="filtered"
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
