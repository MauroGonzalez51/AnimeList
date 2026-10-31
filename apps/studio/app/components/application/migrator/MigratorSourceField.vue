<script setup lang="ts">
    import { entryText } from "~/lib/schema";

    interface Props {
        label: string;
        value: unknown;
    }

    const props = defineProps<Props>();

    const nested = computed(
        () => typeof props.value === "object" && props.value !== null,
    );

    const inline = computed(() => {
        if (props.value === undefined || props.value === null) {
            return "";
        }

        return entryText(props.value as Parameters<typeof entryText>[0]);
    });

    const json = computed(() => JSON.stringify(props.value, null, 4));
</script>

<template>
    <div v-if="nested" class="flex flex-col gap-1">
        <span class="font-medium text-muted-foreground">{{ label }}</span>
        <CodeBlock size="sm">
            <CodeBlockContent wrap>{{ json }}</CodeBlockContent>
        </CodeBlock>
    </div>

    <div v-else class="grid grid-cols-[auto_1fr] gap-x-4">
        <span class="font-medium text-muted-foreground">{{ label }}</span>
        <span class="truncate">{{ inline }}</span>
    </div>
</template>
