/* eslint-disable style/indent-binary-ops */
/* eslint-disable style/indent */
declare global {
    namespace Components.Sidebar {
        interface Group {
            title?: string;
            items: Components.Sidebar.GroupItem[];
        }

        type GroupItem =
            | Components.Sidebar.GroupItemKind
            | Components.Sidebar.GroupCollapsibleKind
            | Components.Sidebar.GroupActionButtonKind;

        interface BaseItem {
            label: string;
            icon?: LucideIconComponent;
            hidden?: boolean | (() => boolean);
        }

        type GroupItemKind = (BaseItem & { kind: "item" }) &
            (
                | {
                      actionKind: "navigation";
                      to: () => RouteLocationRaw;
                  }
                | { actionKind: "function"; action: () => unknown }
            );

        interface GroupCollapsibleKind extends Components.Sidebar.BaseItem {
            kind: "collapsible";
            defaultActive?: boolean;
            collapsibleItems: Components.Sidebar.GroupCollapsibleKindItem[];
        }

        type GroupCollapsibleKindItem = Prettify<
            BaseItem &
                OneOf<[{ to: () => RouteLocationRaw }, { action: () => void }]>
        >;

        interface GroupActionButtonKind extends Components.Sidebar.BaseItem {
            kind: "action-button";
            menuAction?: () => unknown;
            dropdownItems: Components.GenericDropdown.Item[][];
        }
    }
}

export {};
