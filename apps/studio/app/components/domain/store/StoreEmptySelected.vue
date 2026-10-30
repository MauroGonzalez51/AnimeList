<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import { cn } from "~/lib/utils";

    interface Props {
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    const { create } = useEntryForm();
</script>

<template>
    <Empty :class="cn('h-full', props.class)">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <LucideLibrary />
            </EmptyMedia>
            <EmptyTitle>
                {{ $t("views.home.empty.no_entries.title") }}
            </EmptyTitle>
            <EmptyDescription>
                {{ $t("views.home.empty.no_entries.description") }}
            </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button class="cursor-pointer" @click="() => create()">
                {{ $t("views.home.empty.no_entries.action") }}
            </Button>
        </EmptyContent>
    </Empty>
</template>
