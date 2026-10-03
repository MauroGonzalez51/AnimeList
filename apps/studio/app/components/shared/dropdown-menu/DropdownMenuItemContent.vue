<script setup lang="ts" generic="TContext">
    interface Props<T> {
        item: Components.Dropdown.Item<T>;
        context?: MaybeRefOrGetter<T>;
    }

    const props = defineProps<Props<TContext>>();
    const context = computed(() => toValue(props.context));
</script>

<template>
    <template v-if="item.to">
        <NuxtLink :to="item.to(context)">
            <component :is="item.icon" class="mr-2 size-4" />
            <TranslatedMessage :keypath="item.label" />
        </NuxtLink>
    </template>
    <template v-else>
        <component :is="item.icon" class="mr-2 size-4" />
        <TranslatedMessage :keypath="item.label" />
    </template>
</template>
