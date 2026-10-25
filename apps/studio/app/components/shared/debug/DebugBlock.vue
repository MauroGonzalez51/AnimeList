<script setup lang="ts" generic="T">
    import type { HTMLAttributes } from "vue";
    import { cn } from "~/lib/utils";

    interface Props {
        content: T;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();
    const animations = useCollapsibleAnimations();
</script>

<template>
    <DevOnly>
        <Collapsible v-slot="{ open }">
            <CodeBlock :class="cn('shrink-0', props.class)">
                <CodeBlockHeader :class="cn(!open && 'p-3')">
                    <CodeBlockActions>
                        <CollapsibleTrigger as-child>
                            <Button
                                variant="ghost"
                                size="icon"
                                :class="
                                    cn('cursor-pointer', open && 'rotate-90')
                                "
                            >
                                <LucideChevronsRight />
                            </Button>
                        </CollapsibleTrigger>
                    </CodeBlockActions>
                </CodeBlockHeader>
                <Transition
                    :css="false"
                    @enter="animations.onEnter"
                    @leave="animations.onLeave"
                >
                    <CollapsibleContent v-if="open" force-mount>
                        <CodeBlockContent wrap class="h-fit shrink-0">
                            {{ content }}
                        </CodeBlockContent>
                    </CollapsibleContent>
                </Transition>
            </CodeBlock>
        </Collapsible>
    </DevOnly>
</template>
