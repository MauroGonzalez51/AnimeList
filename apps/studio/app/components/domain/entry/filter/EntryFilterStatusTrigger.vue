<script setup lang="ts">
    interface Props {
        count: number;
    }

    defineProps<Props>();
</script>

<template>
    <Button variant="outline" class="cursor-pointer w-32">
        <LucideSlidersHorizontal />
        <TranslatedMessage
            as="div"
            keypath="domain.entry.filter.status.trigger"
        />
        <Badge v-if="count" variant="secondary">
            {{ count }}
        </Badge>
    </Button>
</template>
