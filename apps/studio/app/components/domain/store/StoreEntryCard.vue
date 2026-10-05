<script setup lang="ts">
    import type { KindEntry } from "@animelist/packages-schema";
    import { isObject } from "@vueuse/core";
    import { cn } from "@/lib/utils";
    import { getGradient } from "@/utils/gradient";
    import {
        EntryKindLabel,
        isReadable,
        StatusPropertyLabel,
    } from "@/utils/store";

    interface Props {
        entry: KindEntry;
    }

    const props = defineProps<Props>();
    const { dispatch } = useStore();
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

        if (props.entry.status.watched) {
            return $t(StatusPropertyLabel.watched);
        }

        return undefined;
    });

    const completed = computed(
        () =>
            status.value?.watched ||
            (isReadableEntry(props.entry) && props.entry.status?.completed),
    );

    const comments = computed(() => {
        const entryComments = extractComments(props.entry.comments);
        if (entryComments) {
            return entryComments;
        }

        return extractComments(status.value?.comments);
    });

    const adaptedUntil = computed(() => {
        if (!isReadableEntry(props.entry)) {
            return;
        }

        const adapted = props.entry.adapted_until;
        if (!adapted) {
            return;
        }

        const values: string[] = [];
        if (adapted.chapter) {
            values.push(
                $t("domain.store.card.adapted_until.chapter", {
                    value: adapted.chapter,
                }),
            );
        }

        if (adapted.volume) {
            values.push(
                $t("domain.store.card.adapted_until.volume", {
                    value: adapted.volume,
                }),
            );
        }

        if (adapted.episode) {
            values.push(
                $t("domain.store.card.adapted_until.episode", {
                    value: adapted.episode,
                }),
            );
        }

        if (adapted.arc) {
            values.push(adapted.arc);
        }

        return values.join(" · ");
    });

    function extractComments(value: unknown): string | undefined {
        if (!value) {
            return;
        }

        if (typeof value === "string") {
            return value;
        }

        if (Array.isArray(value)) {
            return value
                .map((item) => extractComments(item))
                .filter((item): item is string => Boolean(item))
                .join(" · ");
        }

        if (isObject(value)) {
            return Object.entries(value)
                .flatMap(([key, item]) => {
                    const text = extractComments(item);
                    if (!text) {
                        return [];
                    }

                    return [`${key}: ${text}`];
                })
                .join(" · ");
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

                <Button
                    v-if="entry.kind !== '$root'"
                    variant="ghost"
                    size="icon"
                    class="cursor-pointer hover:border-white/20 hover:bg-white/15 backdrop-blur-md hover:text-white"
                    :aria-label="$t(StatusPropertyLabel.favorite)"
                    @click="() => dispatch.operation.toggleFavorite(entry)"
                >
                    <LucideHeart
                        :class="
                            cn('size-5', status?.favorite && 'fill-current')
                        "
                    />
                </Button>
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

        <CardContent class="px-4 pb-4 space-y-3">
            <div
                v-if="entry.kind !== '$root'"
                class="flex min-h-10 items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs"
            >
                <span
                    v-if="progress"
                    class="flex items-center gap-2 font-medium"
                >
                    <LucideCheck v-if="completed" :aria-hidden="true" />
                    <LucidePlay v-else :aria-hidden="true" />
                    {{ progress }}
                </span>
                <span v-else class="text-muted-foreground">
                    {{ $t("domain.store.card.progress.no_progress") }}
                </span>
                <span
                    v-if="adaptedUntil"
                    class="text-right text-muted-foreground"
                >
                    {{ $t("domain.store.card.adapted_until.label") }}
                    {{ adaptedUntil }}
                </span>
            </div>
            <p
                v-if="comments"
                class="line-clamp-2 rounded-md border border-dotted border-border px-3 py-2 text-sm leading-relaxed text-muted-foreground"
            >
                {{ comments }}
            </p>
        </CardContent>
    </Card>
</template>
