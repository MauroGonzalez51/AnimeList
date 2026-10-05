export function useSidebarConfig() {
    const SIDEBAR_CONFIG: Components.Sidebar.Group[] = [];

    const sidebarContent = computed(() => SIDEBAR_CONFIG);

    return { sidebarContent };
}
