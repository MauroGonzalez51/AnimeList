<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import type { ButtonVariants } from "~/components/ui/button";
    import type { FlatEntry } from "~/lib/schema";
    import { cn } from "~/lib/utils";

    interface Props {
        entry: FlatEntry;
        favorite: boolean | undefined;
        variant?: ButtonVariants["variant"];
        size?: ButtonVariants["size"];
        class?: HTMLAttributes["class"];
    }

    const props = withDefaults(defineProps<Props>(), {
        variant: "ghost",
        size: "icon-sm",
    });

    const manager = useStoreManager();
</script>

<template>
    <Button
        type="button"
        :variant="variant"
        :size="size"
        :aria-pressed="Boolean(favorite)"
        :class="
            cn(
                'cursor-pointer rounded-full bg-white/15 text-white backdrop-blur-md transition-[transform,background-color] duration-100 hover:bg-white/25 hover:text-white active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100',
                props.class,
            )
        "
        @click="
            manager?.dispatch.patchEntry(entry.id, 'status.favorite', !favorite)
        "
    >
        <LucideHeart
            :aria-hidden="true"
            :class="cn('transition-colors', favorite && 'fill-current text-rose-300')"
        />
    </Button>
</template>
