import { AllKinds, StatusOptions } from "@/utils/store";

export const Statuses = StatusOptions.pick({
    completed: true,
    watched: true,
    favorite: true,
}).keyof().options;

export const ALL_FILTERS = [...AllKinds, ...Statuses] as const;

export type FilterKind = (typeof ALL_FILTERS)[number];

export default function () {
    const active = useState<Record<FilterKind, boolean>>(
        NuxtKeys.Composables.UseSearchFilters.Active,
        () =>
            Object.fromEntries(
                ALL_FILTERS.map((filter) => [filter, false]),
            ) as Record<FilterKind, boolean>,
    );

    function toggle(filter: FilterKind) {
        active.value[filter] = !active.value[filter];
    }

    function clear() {
        ALL_FILTERS.forEach((filter) => (active.value[filter] = false));
    }

    return {
        active,
        dispatch: {
            toggle,
            clear,
        },
    };
}
