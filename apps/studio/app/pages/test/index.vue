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
        v-slot="{ keys }"
        v-model="state"
        :items="items"
        :fields="{
            kind: {
                schema: z.string().optional(),
                sync: true,
                predicate: ({ item, value }) => item.kind === value,
                initialValue: '',
            },
        }"
    >
        <FiltersGroup :keys="keys">
            <template #kind> Puta la wea </template>
        </FiltersGroup>

        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente,
        cupiditate inventore quae minima maiores veritatis, dolorem iusto rerum
        quis laborum nostrum esse architecto? Laborum itaque vel totam et rerum
        fugit?
    </FiltersController>
</template>
