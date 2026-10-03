import type { RouteLocationRaw } from "vue-router";

declare global {
    namespace Components {
        namespace Dropdown {
            interface Item<TContext = unknown> {
                label: string;
                shortcut?: string[];
                icon?: Components.LucideIconComponent;
                disabled?: boolean | ((ctx?: TContext) => boolean);
                hidden?: boolean | (() => boolean);
                to?: (ctx?: TContext) => RouteLocationRaw;
                action?: (ctx?: TContext) => void;
                sub?: Components.Dropdown.Item<TContext>[][];
            }
        }
    }
}

export {};
