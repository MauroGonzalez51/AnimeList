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
        <CodeBlock :class="cn('shrink-0', props.class)">
            <CodeBlockContent wrap class="h-fit shrink-0">
                {{ JSON.stringify(content, null, 4) }}
            </CodeBlockContent>
        </CodeBlock>
    </DevOnly>
</template>
