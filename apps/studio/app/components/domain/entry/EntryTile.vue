<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import type { FlatEntry } from "~/lib/schema";
    import { LucideEye } from "@lucide/vue";
    import { entryText } from "~/lib/schema";
    import { KIND_LABELS } from "~/lib/store";
    import { cn } from "~/lib/utils";

    interface Props {
        entry: FlatEntry;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    const { progress, adaptedUntil } = useEntryDisplay(() => props.entry);
    const showMetadata = computed(() => {
        return (
            progress.value ||
            adaptedUntil.value ||
            props.entry.notes ||
            (props.entry.references?.length ?? 0) > 0
        );
    });

    const { insertCallback } = useCallbackUrl();

    const gradient = useEntryGradient(() => props.entry.id);
</script>

<template>
    <Card
        :style="gradient"
        :class="
            cn(
                'group relative min-h-64 gap-0 overflow-hidden rounded-2xl border-0 py-0 text-white shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] active:duration-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100',
                props.class,
            )
        "
    >
        <div
            class="absolute inset-0 bg-linear-to-b from-black/0 via-black/10 to-black/50 dark:via-black/30 dark:to-black/75"
        />

        <div class="relative flex items-center justify-between p-3">
            <Badge
                variant="secondary"
                class="border-white/20 bg-white/15 text-white backdrop-blur-md"
            >
                <EntryDiscriminator :entry="entry">
                    <template #universe>
                        <LucideGlobe data-icon="inline-start" />
                    </template>

                    <template #readable>
                        <LucideBookOpen data-icon="inline-start" />
                    </template>

                    <template #watchable>
                        <LucideClapperboard data-icon="inline-start" />
                    </template>
                </EntryDiscriminator>
                <TranslatedMessage :keypath="KIND_LABELS[entry.kind]" />
            </Badge>

            <div class="flex items-center gap-1">
                <EntryDiscriminator :entry="entry">
                    <template #readable="{ readable }">
                        <EntryFavoriteBadge
                            :entry="readable"
                            :favorite="readable.status?.favorite"
                        />
                    </template>

                    <template #watchable="{ watchable }">
                        <EntryFavoriteBadge
                            :entry="watchable"
                            :favorite="watchable.status?.favorite"
                        />
                    </template>
                </EntryDiscriminator>

                <DropdownMenuRoot
                    :items="[
                        [
                            {
                                label: 'views.home.entry_card.details_dropdown.see_details',
                                icon: LucideEye,
                                to: () =>
                                    $localeRoute({
                                        name: 'entry-id',
                                        params: { id: entry.id },
                                        query: {
                                            ...insertCallback(),
                                        },
                                    }),
                            },
                        ],
                    ]"
                    :content-props="{ align: 'end' }"
                >
                    <template #trigger>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            class="cursor-pointer rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:text-white"
                        >
                            <LucideMoreHorizontal :aria-hidden="true" />
                        </Button>
                    </template>
                </DropdownMenuRoot>
            </div>
        </div>

        <div class="relative mt-auto flex flex-col gap-1 px-4 pb-3 pt-6">
            <h3
                class="line-clamp-3 wrap-break-word text-2xl leading-[1.1] font-semibold tracking-[-0.02em] drop-shadow-sm"
            >
                {{ entry.name }}
            </h3>

            <div class="flex items-center gap-2 text-sm text-white/80">
                <EntryDiscriminator :entry="entry">
                    <template #readable="{ readable: { status } }">
                        <span
                            v-if="status?.rating"
                            class="flex items-center gap-1 font-semibold text-white"
                        >
                            <LucideStar
                                class="size-3.5 fill-amber-300 text-amber-300"
                                :aria-hidden="true"
                            />
                            {{ status.rating.toFixed(1) }}
                        </span>
                    </template>

                    <template #watchable="{ watchable: { status } }">
                        <span
                            v-if="status?.rating"
                            class="flex items-center gap-1 font-semibold text-white"
                        >
                            <LucideStar
                                class="size-3.5 fill-amber-300 text-amber-300"
                                :aria-hidden="true"
                            />
                            {{ status.rating.toFixed(1) }}
                        </span>
                    </template>
                </EntryDiscriminator>
                <span v-if="entry.chronology" class="truncate">
                    {{ entry.chronology }}
                </span>
            </div>
        </div>

        <div
            v-if="showMetadata"
            class="relative mx-2 mb-2 flex flex-col gap-1.5 rounded-xl border border-white/20 bg-white/15 p-3 text-xs font-medium backdrop-blur-xl contrast-more:border-white contrast-more:bg-black/70"
        >
            <div v-if="progress" class="flex items-center gap-1.5">
                <EntryDiscriminator :entry="entry">
                    <template #readable="{ readable: { status } }">
                        <LucideCheck
                            v-if="status?.completed || status?.watched"
                            class="size-3.5"
                        />
                        <LucidePlay v-else class="size-3.5" />
                    </template>

                    <template #watchable="{ watchable: { status } }">
                        <LucideCheck v-if="status?.watched" class="size-3.5" />
                        <LucidePlay v-else class="size-3.5" />
                    </template>
                </EntryDiscriminator>
                {{ progress }}
            </div>

            <EntryDiscriminator v-if="adaptedUntil" :entry="entry">
                <template #readable>
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-white/70">
                            {{
                                $t("views.home.entry_card.adapted_until.label")
                            }}
                        </span>
                        <span>{{ adaptedUntil }}</span>
                    </div>
                </template>
            </EntryDiscriminator>

            <p
                v-if="entry.notes"
                class="line-clamp-2 font-normal leading-snug text-white/80"
            >
                {{ entryText(entry.notes) }}
            </p>

            <span
                v-if="(entry.references?.length ?? 0) > 0"
                class="font-normal text-white/70"
            >
                {{
                    $t("views.home.entry_card.n_references", {
                        count: entry.references?.length,
                    })
                }}
            </span>
        </div>
    </Card>
</template>
