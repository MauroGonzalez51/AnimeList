<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import type { FlatEntry } from "~/lib/schema";
    import { LucideEye } from "@lucide/vue";
    import {
        _isReadable,
        _isUniverse,
        _isWatchable,
        KIND_LABELS,
    } from "~/lib/store";
    import { cn } from "~/lib/utils";

    interface Props {
        entry: FlatEntry;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    const manager = useStoreManager();

    const progress = computed(() => {
        if (_isUniverse(props.entry)) {
            return undefined;
        }

        if (
            (_isReadable(props.entry) || _isWatchable(props.entry)) &&
            props.entry.status?.watched
        ) {
            return $t("domain.entry.status.watched");
        }

        if (_isReadable(props.entry)) {
            const status = props.entry.status;

            if (status?.completed) {
                return $t("domain.entry.status.completed");
            }

            if (status?.chapter) {
                return $t("domain.entry.status.chapter", {
                    chapter: status.chapter,
                });
            }
        }

        if (_isWatchable(props.entry) && props.entry.status?.episode) {
            return $t("domain.entry.status.episode", {
                episode: props.entry.status.episode,
            });
        }

        return undefined;
    });

    const adaptedUntil = computed(() => {
        if (_isUniverse(props.entry) || _isWatchable(props.entry)) {
            return undefined;
        }

        const _progress = props.entry.adaptedUntil;
        if (_progress?.volume) {
            return $t("domain.entry.adapted_until.volume", {
                volume: _progress.volume,
            });
        }

        if (_progress?.arc) {
            return $t("domain.entry.adapted_until.arc", { arc: _progress.arc });
        }

        if (_progress?.chapter) {
            return $t("domain.entry.status.chapter", {
                chapter: _progress.chapter,
            });
        }

        if (_progress?.episode) {
            return $t("domain.entry.status.episode", {
                episode: _progress.episode,
            });
        }

        if (_progress?.notes) {
            return _progress.notes;
        }

        return undefined;
    });

    function _toString(
        value:
            | string
            | Record<string, unknown>
            | (string | Record<string, unknown>)[],
    ): string {
        if (typeof value === "string") {
            return value;
        }

        if (Array.isArray(value)) {
            return value
                .map((item) => {
                    if (typeof item === "string") {
                        return item;
                    }

                    return JSON.stringify(item);
                })
                .join(", ");
        }

        return JSON.stringify(value);
    }

    const { define: DefineHeartBadge, reuse: ReuseHeartBadge } =
        createReusableTemplate<{
            favorite?: boolean | undefined;
        }>();

    const { define: DefineRating, reuse: ReuseRating } =
        createReusableTemplate<{
            rating?: number | undefined;
        }>();

    const { define: DefineProgress, reuse: ReuseProgress } =
        createReusableTemplate<{
            condition?: boolean | undefined;
        }>();
</script>

<template>
    <DefineHeartBadge v-slot="{ favorite }">
        <Button
            variant="ghost"
            class="rounded-full p-2! cursor-pointer bg-white/15 backdrop-blur-md hover:bg-white/15"
            @click="
                manager?.dispatch.patchEntry(
                    entry.id,
                    'status.favorite',
                    !favorite,
                )
            "
        >
            <LucideHeart
                :class="
                    cn(
                        favorite && 'fill-current group-hover:text-rose-300',
                        'size-6',
                    )
                "
            />
        </Button>
    </DefineHeartBadge>

    <DefineRating v-slot="{ rating }">
        <div
            v-if="rating"
            class="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-semibold"
        >
            <LucideStar
                class="fill-amber-400 text-amber-400"
                :aria-hidden="true"
            />
            {{ rating.toFixed(1) }}
        </div>
    </DefineRating>

    <DefineProgress v-slot="{ condition }">
        <template v-if="condition">
            <LucideCheck :aria-hidden="true" />
        </template>
        <template v-else>
            <LucidePlay :aria-hidden="true" />
        </template>
        {{ progress }}
    </DefineProgress>

    <Card
        :class="
            cn(
                'group overflow-hidden border-border/70 bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                props.class,
            )
        "
    >
        <div class="relative h-36 overflow-hidden" :style="entry?.style">
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
                    <EntryDiscriminator :entry="entry">
                        <template #readable>
                            <LucideBookOpen data-icon="inline-start" />
                        </template>

                        <template #watchable>
                            <LucideClapperboard data-icon="inline-start" />
                        </template>
                    </EntryDiscriminator>
                    <TranslatedMessage :keypath="KIND_LABELS[entry.kind]" />
                </Badge>
                <EntryDiscriminator :entry="entry">
                    <template #readable="{ readable }">
                        <ReuseHeartBadge
                            :favorite="readable.status?.favorite"
                        />
                    </template>

                    <template #watchable="{ watchable }">
                        <ReuseHeartBadge
                            :favorite="watchable.status?.favorite"
                        />
                    </template>
                </EntryDiscriminator>
            </div>
        </div>

        <CardHeader class="min-w-0 gap-2 px-4 pt-4">
            <div class="flex min-w-0 items-start justify-between gap-3">
                <CardTitle
                    class="min-w-0 flex-1 line-clamp-4 wrap-break-word text-base leading-tight font-semibold tracking-tight"
                >
                    {{ entry.name }}
                </CardTitle>
                <div class="flex shrink-0 items-center gap-1">
                    <EntryDiscriminator :entry="entry">
                        <template #readable="{ readable }">
                            <ReuseRating :rating="readable.status?.rating" />
                        </template>

                        <template #watchable="{ watchable }">
                            <ReuseRating :rating="watchable.status?.rating" />
                        </template>
                    </EntryDiscriminator>
                    <DropdownMenuRoot
                        :items="[
                            [
                                {
                                    label: 'views.home.entry_card.details_dropdown.see_details',
                                    icon: LucideEye,
                                },
                            ],
                        ]"
                        :content-props="{ align: 'end' }"
                    >
                        <template #trigger>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                class="text-muted-foreground cursor-pointer"
                            >
                                <LucideMoreHorizontal :aria-hidden="true" />
                            </Button>
                        </template>
                    </DropdownMenuRoot>
                </div>
            </div>
            <div
                class="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground"
            >
                <template v-if="entry.chronology">
                    <span class="truncate">{{ entry.chronology }}</span>
                </template>
                <template v-if="(entry.references?.length ?? 0) > 0">
                    <Badge variant="outline" class="shrink-0 font-normal">
                        {{
                            $t("views.home.entry_card.n_references", {
                                count: entry.references?.length,
                            })
                        }}
                    </Badge>
                </template>
            </div>
        </CardHeader>
        <CardContent class="px-4 pb-4 space-y-2">
            <div
                v-if="progress"
                class="flex min-h-10 items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs"
            >
                <EntryDiscriminator :entry="entry">
                    <template #readable="{ readable: { status } }">
                        <ReuseProgress
                            :condition="status?.completed || status?.watched"
                        />
                    </template>

                    <template #watchable="{ watchable: { status } }">
                        <ReuseProgress :condition="status?.watched" />
                    </template>
                </EntryDiscriminator>
            </div>

            <EntryDiscriminator v-if="adaptedUntil" :entry="entry">
                <template #readable>
                    <div
                        class="flex flex-row items-center justify-between min-h-10 rounded-lg px-3 py-2.5 bg-muted/40 border border-border/50"
                    >
                        <span
                            class="text-xs tracking-wider text-muted-foreground font-medium"
                        >
                            {{
                                $t("views.home.entry_card.adapted_until.label")
                            }}
                        </span>

                        <div
                            :style="entry.style"
                            class="px-2.5 py-0.5 rounded-md text-white font-bold text-xs"
                        >
                            {{ adaptedUntil }}
                        </div>
                    </div>
                </template>
            </EntryDiscriminator>

            <template v-if="entry?.notes">
                <div
                    class="rounded-lg border-2 border-border/50 bg-muted/40 px-3 py-2.5 flex gap-2 items-center"
                >
                    <LucideMessageSquare
                        class="size-3.5 text-muted-foreground"
                    />
                    <p
                        class="line-clamp-2 text-xs italic leading-relaxed text-muted-foreground"
                    >
                        "{{ _toString(entry.notes) }}"
                    </p>
                </div>
            </template>
        </CardContent>
    </Card>
</template>
