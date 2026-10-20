import {
    LucideFolderOpen,
    LucidePlus,
    LucideRefreshCw,
    LucideUnplug,
} from "@lucide/vue";
import { toast } from "vue-sonner";

export default function () {
    const { t } = useI18n();

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
                    icon: LucideFolderOpen,
                    action: manager.dispatch.pick,
                },
                {
                    kind: "item",
                    actionKind: "function",
                    label: "layout.sidebar.store.remove",
                    icon: LucideUnplug,
                    action: manager.dispatch.clear,
                    hidden: () => !hasStore(),
                },
                {
                    kind: "item",
                    actionKind: "function",
                    label: "layout.sidebar.store.reload",
                    icon: LucideRefreshCw,
                    action: () => {
                        manager.dispatch
                            .reload()
                            .then(() =>
                                toast.success(t("actions.config.reload.title")),
                            );
                    },
                    hidden: () => !hasStore(),
                },
            ],
        },
    ];

    const sidebarContent = computed(() => SIDEBAR_CONFIG);
    const sidebarFooter = computed(() => SIDEBAR_FOOTER_CONFIG);

    return { sidebarContent, sidebarFooter };
}
