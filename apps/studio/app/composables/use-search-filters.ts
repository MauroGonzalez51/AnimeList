import {
    BaseEntryStatusSchema,
    ReadableEntryKindSchema,
    ReadableEntrySchema,
    WatchableEntryKindSchema,
} from "@animelist/packages-schema";

export const KINDS = [
    ReadableEntryKindSchema,
    WatchableEntryKindSchema,
].flatMap((kind) => [...kind.options.values()]);

export const STATUSES = BaseEntryStatusSchema.pick({
    watched: true,
    favorite: true,
})
    .extend(ReadableEntrySchema.pick({ completed: true }).shape)
    // eslint-disable-next-line antfu/consistent-chaining
    .keyof().options;

export const ALL_FILTERS = [...KINDS.map((k) => k.value), ...STATUSES] as const;

export type FilterKind =
    | (typeof KINDS)[number]["value"]
    | (typeof STATUSES)[number];

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
