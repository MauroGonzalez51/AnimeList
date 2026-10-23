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

    const SCHEMA = z.object({
        kind: z.string().optional(),
    });

    const items = [{ kind: "tv" }, { kind: "movie" }, { kind: "tv" }];

    const model = useState<z.infer<typeof SCHEMA>>(() => ({ kind: "32523" }));
</script>

<template>
    <FiltersController
        v-slot="slotProps"
        v-model="model"
        :items
        :schema="SCHEMA"
    >
        <DebugBlock :content="slotProps" class="w-full" />
    </FiltersController>
</template>
