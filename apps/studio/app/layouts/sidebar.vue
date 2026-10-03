<script setup lang="ts">
    const open = useCookie(NuxtKeys.Sidebar.Cookie, {
        default: () => false,
    });
</script>

<template>
    <LayoutDefault>
        <SidebarProvider v-model:open="open">
            <LayoutAppSidebar collapsible="icon" />
            <SidebarInset>
                <header class="flex h-16 shrink-0 items-center">
                    <div class="flex justify-between grow px-4">
                        <div class="flex space-x-2 items-center">
                            <SidebarTrigger class="-ml-1 cursor-pointer" />
                        </div>
                        <!-- <div
                            class="flex space-x-2 items-center pointer-events-auto"
                        >
                            <SettingsLocale
                                :content-props="{
                                    side: 'bottom',
                                    align: 'end',
                                }"
                            />
                            <SettingsColorMode
                                :content-props="{
                                    side: 'bottom',
                                    align: 'end',
                                }"
                            />
                        </div> -->
                    </div>
                </header>

                <LayoutPageContainer>
                    <LayoutModal />
                    <slot />
                </LayoutPageContainer>
            </SidebarInset>
        </SidebarProvider>
    </LayoutDefault>
</template>
