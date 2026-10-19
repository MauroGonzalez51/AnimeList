import type { EntryDraft, FlatEntry, SourceType } from "~/lib/schema";

export function useEntryForm() {
    const modal = useModal();
    const manager = useStoreManager();

    function open(props: { entry?: FlatEntry; submit: (draft: EntryDraft) => void }) {
        modal.dispatch.loadComponent({
            key: "entry:form",
            kind: "sheet",
            loader: () => import("@/components/domain/entry/EntryFormSheet.vue"),
            props,
        });
    }

    // without a parent the entry is created at the root of the library
    function create(parent?: { id: FlatEntry["id"]; source: SourceType }) {
        open({
            submit: (draft) => manager.dispatch.addEntry(draft, parent),
        });
    }

    function edit(entry: FlatEntry, onSaved?: () => void) {
        open({
            entry,
            submit: (draft) => {
                manager.dispatch.updateEntry(entry.id, draft);
                onSaved?.();
            },
        });
    }

    return { create, edit };
}
