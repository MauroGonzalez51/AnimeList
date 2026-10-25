<script setup lang="ts">
    import type { BentoCell } from "@/components/shared/bento/types";
    import type { FlatEntry } from "~/lib/schema";
    import { useElementSize } from "@vueuse/core";
    import {
        fillRightGaps,
        repackCells,
    } from "@/components/shared/bento/layout";

    interface Props {
        entries: FlatEntry[];
    }

    interface EntryCell extends BentoCell {
        entry: FlatEntry;
    }

    const props = defineProps<Props>();
    const COLUMNS = 3;
    const GAP = 16;
    const FALLBACK_SIZE = 260;

    const manager = useStoreManager();

    const container = useTemplateRef<HTMLElement>("container");
    const { width } = useElementSize(container);

    const size = computed(() => {
        const available = width.value - GAP * (COLUMNS - 1);

        if (available <= 0) {
            return FALLBACK_SIZE;
        }

        return available / COLUMNS;
    });

    const cells = ref<EntryCell[]>([]);

    watch(
        [() => props.entries, () => manager.childCounts],
        () => {
            cells.value = toCells(props.entries);
        },
        { immediate: true },
    );

    function toCells(entries: FlatEntry[]): EntryCell[] {
        const cells = entries.map((entry) => {
            const span = spanFor(manager.childCounts.get(entry.id) ?? 0);

            return {
                id: entry.id,
                x: 0,
                y: 0,
                width: span.width,
                height: span.height,
                entry,
            };
        });

        repackCells(cells, COLUMNS);
        fillRightGaps(cells, COLUMNS);

        return cells;
    }

    function spanFor(childCount: number) {
        if (childCount >= 3) {
            return { width: 2, height: 2 };
        }

        if (childCount >= 1) {
            return { width: 2, height: 1 };
        }

        return { width: 1, height: 1 };
    }
</script>

<template>
    <div ref="container" class="w-full min-w-0">
        <BentoGrid
            :bento-cells="cells"
            :size="size"
            :gap="GAP"
            :maximum-cells="COLUMNS"
        >
            <BentoItem
                v-for="cell in cells"
                :key="cell.id"
                :x="cell.x"
                :y="cell.y"
                :width="cell.width"
                :height="cell.height"
            >
                <EntryTile :entry="cell.entry" class="h-full min-w-0" />
            </BentoItem>
        </BentoGrid>
    </div>
</template>
