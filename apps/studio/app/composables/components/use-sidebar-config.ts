import { LucideCircleDot, LucideListFilter } from "@lucide/vue";
import { KINDS, STATUSES } from "@/composables/use-search-filters";

export function useSidebarConfig() {
    const filters = useSearchFilters();

    const SIDEBAR_CONFIG: Components.Sidebar.Group[] = [
        {
            title: "search.filter.label",
            items: [
                {
                    kind: "collapsible",
                    label: "search.filter.by_type.label",
                    icon: LucideListFilter,
                    defaultActive: true,
                    collapsibleItems:
                        KINDS.map<Components.Sidebar.GroupCollapsibleKindItem>(
                            (kind) => {
                                const key = kind.value.replaceAll(/-/g, "_");

                                return {
                                    kind: "checkbox",
                                    key: kind.value,
                                    label: `search.filter.by_type.options.${key}`,
                                    checked() {
                                        return filters.active.value[kind.value];
                                    },
                                    action() {
                                        filters.dispatch.toggle(kind.value);
                                    },
                                };
                            },
                        ),
                },
                {
                    kind: "collapsible",
                    label: "search.filter.by_status.label",
                    icon: LucideCircleDot,
                    defaultActive: true,
                    collapsibleItems:
                        STATUSES.map<Components.Sidebar.GroupCollapsibleKindItem>(
                            (status) => {
                                return {
                                    kind: "checkbox",
                                    key: status,
                                    label: `search.filter.by_status.options.${status}`,
                                    checked() {
                                        return filters.active.value[status];
                                    },
                                    action() {
                                        filters.dispatch.toggle(status);
                                    },
                                };
                            },
                        ),
                },
            ],
        },
    ];

    const sidebarContent = computed(() => SIDEBAR_CONFIG);

    return { sidebarContent };
}
