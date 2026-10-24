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
        <CodeBlock :class="cn(props.class)">
            <CodeBlockContent wrap>
                {{ content }}
            </CodeBlockContent>
        </CodeBlock>
    </DevOnly>
</template>
