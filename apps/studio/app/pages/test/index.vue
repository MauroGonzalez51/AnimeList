<script setup lang="ts">
    import { z } from "zod";

    definePageMeta({
        middleware: ["dev"],
        layout: "sidebar",
        i18n: {
            paths: {
                en: "/test",
            },
        },
    });

    const items = [{ kind: "tv" }, { kind: "movie" }, { kind: "tv" }];
    const state = useState<{ kind?: string }>(() => ({ kind: "tv" }));
</script>

<template>
    <FiltersController
        v-slot="slotProps"
        v-model="state"
        :items="items"
        :fields="{
            kind: {
                schema: z.string().optional(),
                sync: true,
                predicate: ({ item, value }) => item.kind === value,
            },
        }"
    >
        <DebugBlock :content="slotProps" class="w-full" />
    </FiltersController>
</template>
