<script setup lang="ts">
    interface Props {
        keypath: MaybeRefOrGetter<string | undefined>;
    }

    defineOptions({ inheritAttrs: false });
    const props = defineProps<Props>();

    const { t, te } = useI18n();
    const message = computed(() => {
        const key = toValue(props.keypath);
        if (key && te(key)) {
            return t(key);
        }

        return key;
    });
</script>

<template>
    <slot :text="message">
        <span v-bind="$attrs">{{ message }}</span>
    </slot>
</template>
