<script setup lang="ts">
    interface Props {
        title?: string;
    }

    defineProps<Props>();
</script>

<template>
    <FieldSet class="min-w-0 gap-3">
        <FieldLabel
            v-if="title"
            class="text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
        >
            {{ title }}
        </FieldLabel>
        <div
            class="divide-y divide-border/60 overflow-hidden rounded-xl border bg-card"
        >
            <slot />
        </div>
    </FieldSet>
</template>
