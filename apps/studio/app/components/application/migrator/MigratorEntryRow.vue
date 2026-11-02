<script setup lang="ts">
    import type { FlatEntry } from "~/lib/schema";
    import { KIND_LABELS } from "~/lib/store";
    import { cn } from "~/lib/utils";

    interface Props {
        entry: FlatEntry;
        selected?: boolean;
    }

    const props = defineProps<Props>();

    const { progress } = useEntryDisplay(() => props.entry);
    const gradient = useEntryGradient(() => props.entry.id);
</script>

<template>
    <button
        type="button"
        :aria-pressed="selected"
        :class="
            cn(
                'flex h-full w-full cursor-pointer items-center gap-3 rounded-xl px-2 text-left outline-none transition-[background-color,transform] duration-100 ease-out hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring/50 active:scale-[0.98] motion-reduce:active:scale-100',
                selected && 'bg-accent',
            )
        "
    >
        <span
            :style="gradient"
            class="flex size-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
        >
            <EntryDiscriminator :entry="entry">
                <template #universe>
                    <LucideGlobe class="size-4" />
                </template>
                <template #readable>
                    <LucideBookOpen class="size-4" />
                </template>
                <template #watchable>
                    <LucideClapperboard class="size-4" />
                </template>
            </EntryDiscriminator>
        </span>

        <span class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm font-medium tracking-[-0.01em]">
                {{ entry.name }}
            </span>
            <span
                class="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
                <TranslatedMessage :keypath="KIND_LABELS[entry.kind]" />
                <template v-if="entry.chronology">
                    <span aria-hidden="true">·</span>
                    <span class="truncate">{{ entry.chronology }}</span>
                </template>
            </span>
        </span>

        <Badge v-if="progress" variant="secondary" class="shrink-0">
            {{ progress }}
        </Badge>
    </button>
</template>
