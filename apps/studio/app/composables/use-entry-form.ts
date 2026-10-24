import type { EntryDraft, FlatEntry, SourceType } from "~/lib/schema";

export function useEntryForm() {
    const modal = useModal();
    const manager = useStoreManager();
    const localeRoute = useLocaleRoute();

    function open(props: { entry?: FlatEntry; submit: (draft: EntryDraft) => void }) {
        modal.dispatch.loadComponent({
            key: "entry:form",
            kind: "sheet",
            loader: () => import("~/components/domain/entry/form/EntryFormSheet.vue"),
            props,
        });
    }

    // without a parent the entry is created at the root of the library
    function create(parent?: { id: FlatEntry["id"]; source: SourceType }) {
        open({
            submit: (draft) => {
                const id = manager.dispatch.addEntry(draft, parent);
                if (!parent) {
                    navigateTo(
                        localeRoute({ name: "entry-id", params: { id } }) ?? "/",
                    );
                }
            },
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
