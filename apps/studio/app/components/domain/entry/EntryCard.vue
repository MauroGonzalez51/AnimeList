<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import type { FlatEntry } from "~/lib/schema";
    import { cn } from "~/lib/utils";

    interface Props {
        entry: FlatEntry;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();
</script>

<template>
    <Card :class="cn(props.class)">
        <CardHeader>
            <CardTitle class="wrap-break-word">{{ entry.name }}</CardTitle>
        </CardHeader>
    </Card>
</template>
