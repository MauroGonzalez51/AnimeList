<script setup lang="ts">
    import type { CollapsibleContentProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";

    interface Props {
        item: MaybeRefOrGetter<Components.Sidebar.GroupCollapsibleKind>;
        contentProps?: CollapsibleContentProps & {
            class?: HTMLAttributes["class"];
        };
    }

    const props = withDefaults(defineProps<Props>(), {
        contentProps: undefined,
    });

    function filterCollapsibleItems(
        items: Components.Sidebar.GroupCollapsibleKindItem[],
    ) {
        return items.filter((item) => !toValue(item.hidden));
    }

    const { t, te } = useI18n();
    const collapsible = computed(() => toValue(props.item));
    const collapsibleItems = computed(() =>
        filterCollapsibleItems(collapsible.value.collapsibleItems),
    );
    const label = computed(() => {
        if (te(collapsible.value.label)) {
            return t(collapsible.value.label);
        }

        return collapsible.value.label;
    });

    const open = useState(
        NuxtKeys.Sidebar.OpenCollapsible(collapsible.value),
        () => collapsible.value.defaultActive,
    );
    const animations = useCollapsibleAnimations();
</script>

<template>
    <Collapsible v-model:open="open" as-child class="group/collapsible">
        <SidebarMenuItem>
            <SidebarMenuButton
                :tooltip="label"
                class="cursor-pointer"
                @click.stop="() => (open = !open)"
            >
                <component :is="collapsible.icon" v-if="collapsible.icon" />
                <span>{{ label }}</span>
            </SidebarMenuButton>

            <template v-if="collapsible.collapsibleItems.length">
                <CollapsibleTrigger as-child>
                    <SidebarMenuAction
                        class="data-[state=open]:rotate-90 cursor-pointer"
                    >
                        <LucideChevronRight />
                        <span class="sr-only">Toggle</span>
                    </SidebarMenuAction>
                </CollapsibleTrigger>

                <Transition
                    :css="false"
                    @enter="animations.onEnter"
                    @leave="animations.onLeave"
                >
                    <CollapsibleContent v-if="open" force-mount>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem
                                v-for="subItem in collapsibleItems"
                                :key="`${collapsible.collapsibleItems.length.toString(32)}-${
                                    subItem.label
                                }`"
                            >
                                <SidebarMenuSubButton
                                    :as-child="!!subItem.to"
                                    class="cursor-pointer select-none"
                                    @click="subItem.action"
                                >
                                    <template v-if="subItem.to">
                                        <NuxtLink :to="subItem.to()">
                                            <component
                                                :is="subItem.icon"
                                                class="mr-2 size-4"
                                            />
                                            <TranslatedMessage
                                                :keypath="subItem.label"
                                            />
                                        </NuxtLink>
                                    </template>
                                    <template v-else>
                                        <component
                                            :is="subItem.icon"
                                            class="mr-2 size-4"
                                        />
                                        <TranslatedMessage
                                            :keypath="subItem.label"
                                        />
                                    </template>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Transition>
            </template>
        </SidebarMenuItem>
    </Collapsible>
</template>
