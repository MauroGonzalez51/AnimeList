<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import type { FlatEntry } from "~/lib/schema";
    import { KIND_LABELS } from "~/lib/store";
    import { cn } from "~/lib/utils";

    interface Props {
        entry: FlatEntry;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    const manager = useStoreManager();

    const { define: DefineHeartBadge, reuse: ReuseHeartBadge } =
        createReusableTemplate<{
            favorite?: boolean | undefined;
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
            </div>
        </CardHeader>
    </Card>
</template>
