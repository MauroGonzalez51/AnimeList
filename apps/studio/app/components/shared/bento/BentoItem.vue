<script setup lang="ts">
    import type { BentoContext } from "@/components/shared/bento/types";
    import { positionStyle } from "@/components/shared/bento/layout";
    import { BENTO_KEY } from "@/components/shared/bento/types";

    interface Props {
        x: number;
        y: number;
        width?: number;
        height?: number;
    }

    const props = withDefaults(defineProps<Props>(), {
        width: 1,
        height: 1,
    });

    const bento = requireBento();

    const style = computed(() =>
        positionStyle(props, bento.size.value, bento.gap.value),
    );

    function requireBento(): BentoContext {
        const context = inject(BENTO_KEY);

        if (!context) {
            throw createError({
                fatal: true,
                statusText: "use of BentoItem outside BentoGrid context",
            });
        }

        return context;
    }
</script>

<template>
    <div :style="style">
        <slot />
    </div>
</template>
