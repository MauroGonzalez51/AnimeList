<script setup lang="ts">
    import type { SourceRecord } from "~/lib/migrator";
    import { openUrl } from "@tauri-apps/plugin-opener";
    import { MIGRATOR_STATUS_KEY } from "~/lib/migrator";

    interface Props {
        record: SourceRecord;
        drifts?: boolean;
    }

    const props = defineProps<Props>();

    const TITLE_KEYS = ["label", "name", "title"] as const;

    const titleKey = computed(() =>
        TITLE_KEYS.find((key) => typeof props.record[key] === "string"),
    );

    const title = computed(() => {
        const key = titleKey.value;
        if (!key) {
            return undefined;
        }

        return props.record[key] as string;
    });

    const fields = computed(() => {
        const entries = Object.entries(props.record).filter(([key]) => {
            if (key === MIGRATOR_STATUS_KEY) {
                return false;
            }

            return key !== titleKey.value;
        });

        return entries;
    });

    function searchImages() {
        const query = title.value;
        if (!query) {
            return;
        }

        const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
        openUrl(url);
    }
</script>

<template>
    <article class="flex flex-col gap-4">
        <header class="flex flex-col gap-2">
            <Badge v-if="drifts" variant="destructive" class="w-fit">
                {{ $t("migrate.source.drift_warning") }}
            </Badge>

            <div v-if="title" class="flex items-start justify-between gap-2">
                <h2
                    class="text-3xl leading-[1.05] font-semibold tracking-[-0.02em] wrap-break-word"
                >
                    {{ title }}
                </h2>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    class="shrink-0 cursor-pointer"
                    :title="$t('migrate.source.search_images')"
                    @click="searchImages"
                >
                    <LucideImage :aria-hidden="true" />
                </Button>
            </div>
            <p v-else class="text-sm text-muted-foreground">
                {{ $t("migrate.source.untitled") }}
            </p>
        </header>

        <dl class="flex flex-col gap-3">
            <MigratorSourceField
                v-for="[key, value] in fields"
                :key="key"
                :label="key"
                :value="value"
            />
        </dl>
    </article>
</template>
