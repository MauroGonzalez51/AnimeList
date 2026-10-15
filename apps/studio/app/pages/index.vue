<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const manager = useStoreManager();
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
                    v-if="(manager.entries.value?.length ?? 0) > 0"
                    class="text-sm leading-relaxed text-muted-foreground"
                >
                    {{
                        $t("views.home.banner.n_entries", {
                            count: manager.entries.value?.length ?? 0,
                        })
                    }}
                </p>
            </div>
            <PaginationClientSide
                :items="manager.entries"
                index="id"
                :page-size="20"
                loading-method="single"
                :condition="
                    (item) => {
                        if (item._parentId) {
                            return false;
                        }
                    }
                "
                class="grid w-full min-w-0 grid-cols-4 grid-rows-5 gap-4"
            >
                <template #item="{ $item }">
                    <EntryCard :entry="$item" class="min-w-0" />
                </template>
            </PaginationClientSide>
        </div>
    </section>
</template>
