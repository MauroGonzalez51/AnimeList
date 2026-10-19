<script setup lang="ts">
    import { cn } from "~/lib/utils";

    interface Props {
        index: number;
        count: number;
        editable?: boolean;
    }

    const props = defineProps<Props>();
    const emit = defineEmits<{ move: [direction: -1 | 1]; edit: [] }>();

    const row = useTemplateRef<HTMLElement>("row");
    const handle = useTemplateRef<HTMLElement>("handle");
    const sortable = computed(() => props.count > 1);

    const origin = ref(0);

    const SIBLING = {
        1: "nextElementSibling",
        [-1]: "previousElementSibling",
    } as const;

    function directionOf(delta: number): -1 | 1 {
        if (delta > 0) {
            return 1;
        }

        return -1;
    }

    function canMove(direction: -1 | 1) {
        const next = props.index + direction;
        return next >= 0 && next < props.count;
    }

    function hasCrossedHalf(delta: number, neighbor: HTMLElement) {
        return Math.abs(delta) >= neighbor.offsetHeight / 2;
    }

    function slotShift(
        element: HTMLElement,
        neighbor: HTMLElement,
        direction: -1 | 1,
    ) {
        if (direction === 1) {
            return (
                neighbor.offsetTop +
                neighbor.offsetHeight -
                element.offsetTop -
                element.offsetHeight
            );
        }

        return neighbor.offsetTop - element.offsetTop;
    }

    function swapIfCrossed(top: number) {
        const element = row.value;
        if (!element) {
            return;
        }

        const delta = top - origin.value;
        const direction = directionOf(delta);
        const neighbor = element[SIBLING[direction]];

        if (
            !canMove(direction) ||
            !(neighbor instanceof HTMLElement) ||
            !hasCrossedHalf(delta, neighbor)
        ) {
            return;
        }

        origin.value += slotShift(element, neighbor, direction);
        emit("move", direction);
    }

    const { y, isDragging } = useDraggable(row, {
        handle,
        axis: "y",
        preventDefault: true,
        onStart() {
            origin.value = row.value?.getBoundingClientRect().top ?? 0;
        },
        onMove: ({ y: top }) => swapIfCrossed(top),
    });

    const translateY = computed(() => {
        if (!isDragging.value) {
            return 0;
        }

        return y.value - origin.value;
    });
</script>

<template>
    <div
        ref="row"
        :class="
            cn(
                'group -mx-2 flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted',
                isDragging && 'relative z-10 bg-card shadow-md',
            )
        "
        :style="{ transform: `translateY(${translateY}px)` }"
    >
        <button
            v-if="sortable"
            ref="handle"
            type="button"
            class="-ml-1 cursor-grab touch-none rounded p-0.5 text-muted-foreground/50 outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            :aria-label="$t('views.entry.id.actions.drag')"
            tabindex="-1"
        >
            <LucideGripVertical class="size-4" />
        </button>

        <div class="flex min-w-0 flex-1 items-center">
            <slot />
        </div>

        <Button
            v-if="editable"
            type="button"
            variant="ghost"
            size="icon-xs"
            class="shrink-0 cursor-pointer text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
            :aria-label="$t('views.entry.id.actions.edit')"
            @click="emit('edit')"
        >
            <LucideSquarePen />
        </Button>

        <div
            v-if="sortable"
            class="flex shrink-0 flex-col opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        >
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                class="size-4 cursor-pointer text-muted-foreground"
                :disabled="index === 0"
                :aria-label="$t('views.entry.id.actions.move_up')"
                @click="emit('move', -1)"
            >
                <LucideChevronUp />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                class="size-4 cursor-pointer text-muted-foreground"
                :disabled="index === count - 1"
                :aria-label="$t('views.entry.id.actions.move_down')"
                @click="emit('move', 1)"
            >
                <LucideChevronDown />
            </Button>
        </div>
    </div>
</template>
