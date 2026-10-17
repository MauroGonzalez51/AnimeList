<script setup lang="ts" generic="T">
    import type { HTMLAttributes } from "vue";
    import { cn } from "~/lib/utils";

    interface Props {
        content: T;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();
</script>

<template>
    <DevOnly>
        <div
            :class="
                cn(
                    'p-4 border-2 border-border/60 rounded-lg bg-muted/30',
                    props.class,
                )
            "
        >
            <slot :content="content">
                <pre class="text-muted-foreground" v-text="content" />
            </slot>
        </div>
    </DevOnly>
</template>
