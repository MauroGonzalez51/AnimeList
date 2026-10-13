<script setup lang="ts">
    definePageMeta({
        layout: "sidebar",
    });

    const manager = useStoreManager();
</script>

<template>
    <section class="mx-auto max-w-6xl space-y-8">
        <div class="max-w-xl space-y-2">
            <p
                class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase"
            >
                {{ $t("views.home.banner.your_library") }}
            </p>
            <p
                v-if="manager.entries.value && manager.entries.value.length > 0"
                class="text-sm leading-relaxed text-muted-foreground"
            >
                {{
                    $t("views.home.banner.n_entries", {
                        count: manager.entries.value.length,
                    })
                }}
            </p>
        </div>
        <PaginationClientSide
            :items="manager.entries"
            index="id"
            :page-size="20"
            class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
            <template #item="{ $item }">
                <pre v-text="$item.id" />
            </template>
        </PaginationClientSide>
    </section>
</template>
