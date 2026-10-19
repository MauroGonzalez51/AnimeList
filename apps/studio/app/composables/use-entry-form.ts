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

    function create(parentId: FlatEntry["id"], source: SourceType) {
        open({
            submit: (draft) =>
                manager.dispatch.addEntry(parentId, source, draft),
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
