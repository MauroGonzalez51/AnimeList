<script setup lang="ts" generic="TCell extends BentoCell">
    import type { BentoCell } from "@/components/shared/bento/types";
    import {
        gridHeight,
        gridSpan,
        positionStyle,
        repackCells,
        repackIfNeeded,
    } from "@/components/shared/bento/layout";
    import { BENTO_KEY } from "@/components/shared/bento/types";

    interface Props {
        bentoCells: TCell[];
        size?: number;
        maximumCells?: number;
        gap?: number;
    }

    const props = withDefaults(defineProps<Props>(), {
        size: 100,
        maximumCells: 4,
        gap: 10,
    });

    defineSlots<{
        default?: () => VNode[];
        empty?: () => VNode[];
    }>();

    const isDataMode = computed(() =>
        props.bentoCells.every((cell) => cell.component !== undefined),
    );
    const containerHeight = computed(
        () => `${gridHeight(props.bentoCells, props.size, props.gap)}px`,
    );
    const containerWidth = computed(
        () => `${gridSpan(props.maximumCells, props.size, props.gap)}px`,
    );

    provide(BENTO_KEY, {
        size: computed(() => props.size),
        gap: computed(() => props.gap),
    });

    watch(
        () => props.bentoCells,
        (cells) => {
            repackIfNeeded(cells, props.maximumCells);
        },
        { immediate: true },
    );

    watch(
        () => props.maximumCells,
        (columns) => {
            repackCells(props.bentoCells, columns);
        },
    );
</script>

<template>
    <div
        v-if="bentoCells.length > 0"
        :style="{
            height: containerHeight,
            width: containerWidth,
            position: 'relative',
            marginLeft: 'auto',
            marginRight: 'auto',
        }"
    >
        <div v-if="isDataMode">
            <div
                v-for="cell in bentoCells"
                :key="cell.id"
                :style="positionStyle(cell, size, gap)"
            >
                <component :is="cell.component" :model-value="cell" />
            </div>
        </div>

        <div v-else>
            <slot />
        </div>
    </div>

    <div v-else>
        <slot name="empty" />
    </div>
</template>
