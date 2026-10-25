<script setup lang="ts">
    import type { DropdownMenuContentProps } from "reka-ui";
    import type { SidebarProps } from "@/components/ui/sidebar";
    import { basename } from "pathe";
    import SidebarImage from "@/assets/images/sidebar.webp";
    import { useSidebar } from "@/components/ui/sidebar";

    const props = withDefaults(defineProps<SidebarProps>(), {
        variant: "inset",
    });

    const { $localeRoute } = useNuxtApp();

    const { isMobile } = useSidebar();
    const dropdownSide = computed<DropdownMenuContentProps["side"]>(() => {
        if (isMobile.value) {
            return "bottom";
        }

        return "right";
    });
    const dropdownAlign = computed<DropdownMenuContentProps["align"]>(() => {
        if (isMobile.value) {
            return "end";
        }

        return "start";
    });

    function filterSidebarGroups(
        groups: Components.Sidebar.Group[],
    ): Components.Sidebar.Group[] {
        return groups.map((group) => ({
            ...group,
            items: group.items.filter((item) => !toValue(item.hidden)),
        }));
    }

    const config = useConfig();
    const storePath = computed(() => config.state.value?.store_path);

    const { sidebarContent, sidebarFooter } = useSidebarConfig();
    const filteredGroups = computed(() =>
        filterSidebarGroups(sidebarContent.value),
    );
    const filteredFooterGroups = computed(() =>
        filterSidebarGroups(sidebarFooter.value),
    );

    const { define: DefineActionKind, reuse: ReuseActionKind } =
        createReusableTemplate<{
            group: Components.Sidebar.GroupActionButtonKind;
        }>();

    const { define: DefineItemKind, reuse: ReuseItemKind } =
        createReusableTemplate<{ group: Components.Sidebar.GroupItemKind }>();
</script>

<template>
    <DefineActionKind v-slot="{ group }">
        <DropdownSidebarMenuRoot
            :items="group.dropdownItems"
            :content-props="{
                side: dropdownSide,
                align: dropdownAlign,
                class: 'min-w-56 rounded-lg',
            }"
        >
            <template #trigger>
                <SidebarMenuButton
                    class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    @click="group.menuAction"
                >
                    <component :is="group.icon" v-if="group.icon" />
                    <span>{{ group.label }}</span>
                    <LucideMoreHorizontal class="ml-auto" />
                </SidebarMenuButton>
            </template>
        </DropdownSidebarMenuRoot>
    </DefineActionKind>

    <DefineItemKind v-slot="{ group }">
        <SidebarMenuItem class="cursor-pointer">
            <template v-if="group.actionKind === 'navigation'">
                <SidebarMenuButton as-child>
                    <NuxtLink :to="group.to()">
                        <component :is="group.icon" v-if="group.icon" />
                        <span>{{ $t(group.label) }}</span>
                    </NuxtLink>
                </SidebarMenuButton>
            </template>

            <template v-if="group.actionKind === 'function'">
                <SidebarMenuButton @click="group.action">
                    <component :is="group.icon" v-if="group.icon" />
                    <span>{{ $t(group.label) }}</span>
                </SidebarMenuButton>
            </template>
        </SidebarMenuItem>
    </DefineItemKind>

    <Sidebar v-bind="props">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <NuxtLink :to="$localeRoute({ name: 'index' })">
                            <div
                                class="aspect-square size-8 rounded-lg bg-muted dark:bg-gray-300"
                            >
                                <NuxtImg
                                    :src="SidebarImage"
                                    class="object-cover min-w-full min-h-full rounded-lg"
                                />
                            </div>
                            <div
                                class="grid flex-1 text-left text-sm leading-tight"
                            >
                                <span class="truncate font-medium">
                                    {{ $t("meta.app.title") }}
                                </span>
                            </div>
                        </NuxtLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent as-child>
            <ScrollArea class="h-full">
                <template
                    v-for="(group, groupIndex) in filteredGroups"
                    :key="`group-${groupIndex}-${group.items.length}`"
                >
                    <SidebarGroup>
                        <SidebarGroupLabel v-if="group.title">
                            <TranslatedMessage :keypath="group.title" />
                        </SidebarGroupLabel>

                        <SidebarMenu>
                            <template
                                v-for="(
                                    groupItem, groupItemIndex
                                ) in group.items"
                                :key="`${group.title}-${groupItem.kind}-${groupItemIndex}`"
                            >
                                <template
                                    v-if="groupItem.kind === 'collapsible'"
                                >
                                    <CollapsibleSidebarRoot :item="groupItem" />
                                </template>

                                <template
                                    v-if="groupItem.kind === 'action-button'"
                                >
                                    <ReuseActionKind :group="groupItem" />
                                </template>

                                <template v-if="groupItem.kind === 'item'">
                                    <ReuseItemKind :group="groupItem" />
                                </template>
                            </template>
                        </SidebarMenu>
                    </SidebarGroup>
                </template>
            </ScrollArea>
        </SidebarContent>

        <SidebarFooter>
            <SidebarMenu
                v-for="(group, groupIndex) in filteredFooterGroups"
                :key="`footer-${groupIndex}-${group.items.length}`"
            >
                <template
                    v-for="(groupItem, groupItemIndex) in group.items"
                    :key="`footer-${groupItem.kind}-${groupItemIndex}`"
                >
                    <ReuseItemKind
                        v-if="groupItem.kind === 'item'"
                        :group="groupItem"
                    />
                </template>
            </SidebarMenu>

            <SidebarMenu v-if="storePath">
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        class="cursor-default border border-border/40 dark:border-purple-300/50 bg-muted"
                        :title="storePath"
                    >
                        <div
                            class="flex size-8 shrink-0 items-center justify-center"
                        >
                            <LucideFileText
                                class="size-4 text-rose-500 dark:text-purple-300"
                            />
                        </div>
                        <div
                            class="grid flex-1 text-left text-sm leading-tight"
                        >
                            <span class="truncate font-medium text-primary">
                                {{ basename(storePath) }}
                            </span>
                            <span
                                class="truncate text-xs text-muted-foreground"
                            >
                                {{ storePath }}
                            </span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
    </Sidebar>
</template>
