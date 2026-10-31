<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import { cn } from "~/lib/utils";
    import { getGradient } from "~/utils/gradient";

    interface Props {
        id: string;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    const style = computed(() => getGradient([props.id]));
</script>

<template>
    <span
        :style="style"
        :class="cn('size-6 shrink-0 rounded-full shadow-sm', props.class)"
        :aria-hidden="true"
    />
</template>
