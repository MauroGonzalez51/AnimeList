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
    });

    const manager = useStoreManager();
</script>

<template>
    <Button
        :variant="variant"
        :class="
            cn(
                'rounded-full p-2! cursor-pointer bg-white/15 backdrop-blur-md hover:bg-white/15',
                props.class,
            )
        "
        :size="size"
        @click="
            manager?.dispatch.patchEntry(entry.id, 'status.favorite', !favorite)
        "
    >
        <LucideHeart
            :class="
                cn(
                    favorite && 'fill-current group-hover:text-rose-300',
                    'size-6',
                )
            "
        />
    </Button>
</template>
