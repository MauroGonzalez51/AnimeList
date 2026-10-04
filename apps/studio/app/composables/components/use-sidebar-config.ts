import {
    BaseEntryStatusSchema,
    ReadableEntryKindSchema,
    ReadableEntrySchema,
    WatchableEntryKindSchema,
} from "@animelist/packages-schema";

export function useSidebarConfig() {
    // const { insertCallback } = useCallbackUrl();

    const kinds = [ReadableEntryKindSchema, WatchableEntryKindSchema].flatMap(
        (kind) => [...kind.options.values()],
    );

    const statuses = [
        BaseEntryStatusSchema.pick({ watched: true, favorite: true }),
        ReadableEntrySchema.pick({ completed: true }),
    ].flatMap((schema) => Object.keys(schema.shape));

    const SIDEBAR_CONFIG: Components.Sidebar.Group[] = [
        {
            title: "search.filter.label",
            items: [
                {
                    kind: "collapsible",
                    label: "search.filter.by_type.label",
                    collapsibleItems:
                        kinds.map<Components.Sidebar.GroupCollapsibleKindItem>(
                            (kind) => {
                                const key = kind.value.replaceAll(/-/g, "_");

                                return {
                                    label: `search.filter.by_type.options.${key}`,
                                    action() {},
                                };
                            },
                        ),
                },
                {
                    kind: "collapsible",
                    label: "search.filter.by_status.label",
                    collapsibleItems:
                        statuses.map<Components.Sidebar.GroupCollapsibleKindItem>(
                            (status) => {
                                return {
                                    label: `search.filter.by_status.options.${status}`,
                                    action() {},
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
