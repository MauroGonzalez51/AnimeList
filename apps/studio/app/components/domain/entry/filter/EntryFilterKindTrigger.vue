<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import type { EntryKind } from "@/lib/store";
    import { KIND_LABELS } from "@/lib/store";
    import { cn } from "@/lib/utils";

    interface Props {
        kind: EntryKind[] | undefined;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();
</script>

<template>
    <Button
        variant="outline"
        :class="
            cn(
                'cursor-pointer',
                !kind?.length && 'text-muted-foreground',
                props.class,
            )
        "
    >
        <LucideTags />
        <VLet
            v-slot="{ label }"
            :vars="{
                label: KIND_LABELS[kind?.[0] ?? 'other'],
            }"
        >
            <i18n-t
                keypath="domain.entry.kind.placeholder"
                :plural="kind?.length ?? 0"
                tag="span"
            >
                <template #kind>
                    {{ $t(label) }}
                </template>
                <template #count>
                    <span class="text-muted-foreground">
                        {{ kind?.length }}
                    </span>
                </template>
            </i18n-t>
        </VLet>
    </Button>
</template>
