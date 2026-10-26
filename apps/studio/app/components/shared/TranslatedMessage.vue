<script setup lang="ts">
    import type { PrimitiveProps } from "reka-ui";
    import { Primitive } from "reka-ui";

    interface Props extends Omit<PrimitiveProps, "asChild"> {
        keypath: MaybeRefOrGetter<string | undefined>;
    }

    defineOptions({ inheritAttrs: false });
    const props = withDefaults(defineProps<Props>(), {
        as: "span",
    });

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
        <Primitive :as="as" v-bind="$attrs">{{ message }}</Primitive>
    </slot>
</template>
