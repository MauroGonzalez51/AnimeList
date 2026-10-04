<script setup lang="ts">
    import type { CollapsibleContentProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import { cn } from "@/lib/utils";

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
                                    v-if="subItem.kind === 'checkbox'"
                                    class="cursor-pointer select-none"
                                    :aria-pressed="subItem.checked()"
                                    :data-checked="subItem.checked()"
                                    @click="subItem.action"
                                >
                                    <span
                                        aria-hidden="true"
                                        class="mr-2 flex size-4 items-center justify-center rounded-sm border transition-colors"
                                        :class="
                                            cn(
                                                'border-sidebar-border bg-transparent',
                                                subItem.checked() &&
                                                    'border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30',
                                            )
                                        "
                                    >
                                        <LucideCheck
                                            v-if="subItem.checked()"
                                            class="size-3"
                                        />
                                    </span>
                                    <component
                                        :is="subItem.icon"
                                        v-if="subItem.icon"
                                        class="mr-2 size-4"
                                    />
                                    <TranslatedMessage
                                        :keypath="subItem.label"
                                    />
                                </SidebarMenuSubButton>
                                <SidebarMenuSubButton
                                    v-else
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
