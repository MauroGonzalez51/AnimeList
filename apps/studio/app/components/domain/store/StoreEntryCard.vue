<script setup lang="ts">
    import type { KindEntry } from "@animelist/packages-schema";
    import type { EntryKindLabel, StatusPropertyLabel } from "@/utils/store";
    import { isObject } from "@vueuse/core";
    import { getGradient } from "@/utils/gradient";
    import { isReadable } from "@/utils/store";

    interface Props {
        entry: KindEntry;
    }

    const props = defineProps<Props>();
    const status = computed(() => {
        if (props.entry.kind === "$root") {
            return;
        }

        return props.entry.status;
    });

    const progress = computed(() => {
        if (props.entry.kind === "$root") {
            return;
        }

        if (!props.entry.status) {
            return;
        }

        if (isReadableEntry(props.entry)) {
            if (props.entry.status.chapter) {
                return $t("domain.store.card.progress.chapter", {
                    value: props.entry.status.chapter,
                });
            }

            if (props.entry.status.completed) {
                return $t("domain.store.card.progress.completed");
            }
        }

        if (isWatchableEntry(props.entry)) {
            if (props.entry.status.episode) {
                return $t("domain.store.card.progress.episode", {
                    value: props.entry.status.episode,
                });
            }
        }

        return undefined;
    });

    const completed = computed(
        () =>
            status.value?.watched ||
            (isReadableEntry(props.entry) && props.entry.status?.completed),
    );

    const comments = computed(() => {
        if (!props.entry.comments) {
            return;
        }

        if (extractComments(props.entry.comments)) {
            return extractComments(props.entry.comments);
        }

        if (isReadableEntry(props.entry) && props.entry.status?.comments) {
            return extractComments(props.entry.status.comments);
        }

        return undefined;
    });

    function extractComments(comments: unknown) {
        if (Array.isArray(comments)) {
            return comments.join("");
        }

        if (isObject(comments)) {
            return Object.entries(comments)
                .map(([k, v]) => `${k}: ${v}`)
                .join("|");
        }

        if (typeof comments === "string") {
            return comments;
        }
    }
</script>

<template>
    <Card
        class="group overflow-hidden border-border/70 bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
        <div
            class="relative h-36 overflow-hidden"
            :style="getGradient([entry.name, entry.kind])"
        >
            <div
                class="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent"
            />
            <div
                class="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white"
            >
                <Badge
                    variant="secondary"
                    class="border-white/20 bg-white/15 text-white backdrop-blur-md"
                >
                    <LucideBookOpen
                        v-if="isReadable(entry.kind)"
                        data-icon="inline-start"
                    />
                    <LucideClapperboard v-else data-icon="inline-start" />

                    <TranslatedMessage :keypath="EntryKindLabel[entry.kind]" />
                </Badge>

                <span
                    v-if="status?.favorite"
                    :aria-label="$t(StatusPropertyLabel.favorite)"
                    class="rounded-full bg-white/15 p-2 backdrop-blur-md"
                >
                    <LucideHeart class="fill-current" :aria-hidden="true" />
                </span>
            </div>
        </div>

        <CardHeader class="min-w-0 gap-2 px-4">
            <div class="flex min-w-0 items-start justify-between gap-3">
                <CardTitle
                    class="min-w-0 flex-1 text-base leading-tight font-semibold tracking-tight wrap-break-word"
                >
                    {{ entry.name }}
                </CardTitle>
                <div
                    v-if="status?.rating"
                    class="flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-semibold"
                >
                    <LucideStar />
                    {{ status.rating.toFixed(1) }}
                </div>
            </div>
            <div
                class="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground"
            >
                <span
                    v-if="isWatchableEntry(entry) && entry.chronology"
                    class="truncate"
                >
                    {{ entry.chronology }}
                </span>
                <Badge
                    v-if="entry.$reference?.length"
                    variant="outline"
                    class="shrink-0 font-normal"
                >
                    {{
                        $t("domain.store.card.relations", {
                            count: entry.$reference.length,
                        })
                    }}
                </Badge>
            </div>
        </CardHeader>

        <CardContent class="px-4 pb-4">
            <div
                class="flex min-h-10 items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs"
            >
                <span
                    v-if="progress"
                    class="flex items-center gap-2 font-medium"
                >
                    <LucideCheck v-if="completed" :aria-hidden="true" />
                </span>
                <span v-else class="text-muted-foreground">
                    {{ $t("domain.store.card.progress.no_progress") }}
                </span>
            </div>
            <p
                v-if="comments"
                class="line-clamp-2 text-sm leading-relaxed text-muted-foreground"
            >
                {{ comments }}
            </p>
        </CardContent>
    </Card>
</template>
