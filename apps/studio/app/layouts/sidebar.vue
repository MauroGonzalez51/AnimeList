<script setup lang="ts">
    const open = useCookie(NuxtKeys.Sidebar.Cookie, {
        default: () => false,
    });
</script>

<template>
    <LayoutDefault>
        <SidebarProvider
            v-model:open="open"
            class="h-svh min-h-0 overflow-hidden"
        >
            <LayoutAppSidebar collapsible="icon" variant="floating" />
            <SidebarInset class="min-h-0 overflow-hidden">
                <header
                    class="sticky top-0 z-50 flex h-16 shrink-0 items-center rounded-t-lg border-b border-border/20 bg-background/60 backdrop-blur-md transition-colors duration-200"
                >
                    <div class="flex justify-between grow px-4">
                        <div class="flex space-x-2 items-center">
                            <SidebarTrigger class="-ml-1 cursor-pointer" />
                        </div>
                        <div
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
                        </div>
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
