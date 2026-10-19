import { LucidePlus, LucideSearch, LucideTrash } from "@lucide/vue";

export function useSidebarConfig() {
    const config = useConfig();
    const manager = useStoreManager();
    const entryForm = useEntryForm();

    const hasStore = () => Boolean(config.state.value?.store_path);

    const SIDEBAR_CONFIG: Components.Sidebar.Group[] = [
        {
            items: [
                {
                    kind: "item",
                    actionKind: "function",
                    label: "layout.sidebar.entry.create",
                    icon: LucidePlus,
                    action: () => entryForm.create(),
                    hidden: () => !hasStore(),
                },
            ],
        },
    ];

    const SIDEBAR_FOOTER_CONFIG: Components.Sidebar.Group[] = [
        {
            items: [
                {
                    kind: "item",
                    actionKind: "function",
                    label: "layout.sidebar.store.select",
                    icon: LucideSearch,
                    action: manager.dispatch.pick,
                },
                {
                    kind: "item",
                    actionKind: "function",
                    label: "layout.sidebar.store.remove",
                    icon: LucideTrash,
                    action: manager.dispatch.clear,
                    hidden: () => !hasStore(),
                },
            ],
        },
    ];

    const sidebarContent = computed(() => SIDEBAR_CONFIG);
    const sidebarFooter = computed(() => SIDEBAR_FOOTER_CONFIG);

    return { sidebarContent, sidebarFooter };
}
