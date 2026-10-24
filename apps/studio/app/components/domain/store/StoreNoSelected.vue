<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import { cn } from "~/lib/utils";

    interface Props {
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    const manager = useStoreManager();
</script>

<template>
    <Empty :class="cn('h-full', props.class)">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <LucideFolderOpen />
            </EmptyMedia>
            <EmptyTitle>
                {{ $t("views.home.empty.no_store.title") }}
            </EmptyTitle>
            <EmptyDescription>
                {{ $t("views.home.empty.no_store.description") }}
            </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button class="cursor-pointer" @click="manager.dispatch.pick()">
                {{ $t("views.home.empty.no_store.action") }}
            </Button>
        </EmptyContent>
    </Empty>
</template>
