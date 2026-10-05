import { LucideCircleDot, LucideListFilter } from "@lucide/vue";
import { Statuses } from "@/composables/use-search-filters";
import { AllKinds, EntryKindLabel, StatusPropertyLabel } from "@/utils/store";

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
                        AllKinds.map<Components.Sidebar.GroupCollapsibleKindItem>(
                            (kind) => {
                                return {
                                    kind: "checkbox",
                                    key: kind,
                                    label: EntryKindLabel[kind],
                                    checked() {
                                        return filters.active.value[kind];
                                    },
                                    action() {
                                        filters.dispatch.toggle(kind);
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
                        Statuses.map<Components.Sidebar.GroupCollapsibleKindItem>(
                            (status) => {
                                return {
                                    kind: "checkbox",
                                    key: status,
                                    label: StatusPropertyLabel[status],
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
