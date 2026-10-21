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
</script>

<template>
    <FiltersController v-slot="{ items: filtered, keys, activeCount, reset }" :items :schema="SCHEMA">
        <FiltersGroup :keys>
            <template #kind="field">
                <select v-bind="field" @change="field['onUpdate:modelValue'](($event.target as HTMLSelectElement).value || undefined)">
                    <option value="">
                        all
                    </option>
                    <option value="tv">
                        tv
                    </option>
                    <option value="movie">
                        movie
                    </option>
                </select>
            </template>
        </FiltersGroup>

        <button @click="reset">
            reset ({{ activeCount }})
        </button>

        <pre>{{ filtered }}</pre>
    </FiltersController>
</template>
