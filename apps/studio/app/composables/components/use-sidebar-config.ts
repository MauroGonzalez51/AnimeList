export function useSidebarConfig() {
    // const { insertCallback } = useCallbackUrl();

    const SIDEBAR_CONFIG: Components.Sidebar.Group[] = [];

    const sidebarContent = computed(() => SIDEBAR_CONFIG);

    return { sidebarContent };
}
