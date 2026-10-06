function _$<T>(
    context: T | undefined,
    defaultValue: string,
    value: (value: T) => string,
) {
    if (!context) {
        return defaultValue;
    }

    return value(context);
}

function _$$<A, B>(
    a: A | undefined,
    b: B | undefined,
    defaults: {
        none: string;
        onlyA: (a: A) => string;
        both: (a: A, b: B) => string;
    },
) {
    if (!a) {
        return defaults.none;
    }

    if (!b) {
        return defaults.onlyA(a);
    }

    return defaults.both(a, b);
}

export const NuxtKeys = {
    Components: {
        Pagination: {
            ClientSide: {
                Loading: "components:pagination:client-side:loading",
            },
        },
    },
    Composables: {},
    Sidebar: {
        OpenCollapsible: (group: Components.Sidebar.GroupCollapsibleKind) =>
            `sidebar:${group.kind}:${group.label}`,
        Cookie: "sidebar_state",
    },
} as const;

export const ModalKeys = {} as const;
