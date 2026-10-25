<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import { cn } from "~/lib/utils";

    interface Props {
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();
</script>

<template>
    <Card
        data-slot="entry-tile-skeleton"
        :class="
            cn(
                'relative min-h-64 gap-0 overflow-hidden rounded-2xl border-0 bg-muted py-0 shadow-md',
                props.class,
            )
        "
    >
        <div class="relative flex items-center justify-between p-3">
            <Skeleton class="h-6 w-24 rounded-full" />

            <div class="flex items-center gap-1">
                <Skeleton class="size-8 rounded-full" />
                <Skeleton class="size-8 rounded-full" />
            </div>
        </div>

        <div class="relative mt-auto flex flex-col gap-2 px-4 pb-3 pt-6">
            <Skeleton class="h-7 w-3/4" />
            <Skeleton class="h-7 w-1/2" />

            <div class="flex items-center gap-2 pt-1">
                <Skeleton class="h-4 w-1/3" />
            </div>
        </div>
    </Card>
</template>
