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
                'group rounded-full p-2! cursor-pointer bg-white/15 backdrop-blur-md hover:bg-white/15',
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
                    'size-6 transition-colors',
                    favorite &&
                        'fill-current text-rose-300 group-hover:text-rose-500',
                )
            "
        />
    </Button>
</template>
