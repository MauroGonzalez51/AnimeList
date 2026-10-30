import type { EntryDraft, FlatEntry, SourceType } from "~/lib/schema";

// store-side actions a migrator source entry can drive; selecting a source entry
// never calls any of these, so selection alone leaves the store untouched
export default function () {
    const manager = useStoreManager();
    const entryForm = useEntryForm();
    const { entries } = storeToRefs(manager);

    // create a brand new store entry, optionally pre-filled with manual hints;
    // stays on the current page instead of navigating to the new entry
    function create(hints?: Partial<EntryDraft>, onCreated?: () => void) {
        entryForm.create({
            hints,
            onCreated: () => onCreated?.(),
        });
    }

    // attach a new entry under an existing target as a child or related node;
    // any store id is a valid parent, so nested targets work with the same call
    function attach(
        target: FlatEntry["id"],
        source: SourceType,
        hints?: Partial<EntryDraft>,
        onCreated?: () => void,
    ) {
        entryForm.create({
            parent: { id: target, source },
            hints,
            onCreated: () => onCreated?.(),
        });
    }

    // edit an existing entry's references or other fields through the form
    function edit(entry: FlatEntry, onSaved?: () => void) {
        entryForm.edit(entry, onSaved);
    }

    // filter store entries by name for picking an attach target
    function search(query: string): FlatEntry[] {
        const list = entries.value ?? [];
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) {
            return list;
        }

        return list.filter((entry) =>
            entry.name.toLowerCase().includes(trimmed),
        );
    }

    return {
        entries,
        dispatch: {
            create,
            attach,
            edit,
            search,
        },
    };
}
