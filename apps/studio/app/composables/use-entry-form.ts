import type { EntryDraft, FlatEntry, SourceType } from "~/lib/schema";

interface CreateOptions {
    parent?: { id: FlatEntry["id"]; source: SourceType };
    // starting hints for a manual form; never an automatic field mapping
    hints?: Partial<EntryDraft>;
    // when provided, called with the new id instead of navigating to it; the
    // migrator stays on its page and does not route away after a create
    onCreated?: (id: FlatEntry["id"]) => void;
}

export function useEntryForm() {
    const modal = useModal();
    const manager = useStoreManager();
    const localeRoute = useLocaleRoute();

    function open(props: {
        entry?: FlatEntry;
        hints?: Partial<EntryDraft>;
        submit: (draft: EntryDraft) => void;
    }) {
        modal.dispatch.loadComponent({
            key: "entry:form",
            kind: "sheet",
            loader: () =>
                import("~/components/domain/entry/form/EntryFormSheet.vue"),
            props,
        });
    }

    // without a parent the entry is created at the root of the library
    function create(options: CreateOptions = {}) {
        const { parent, hints, onCreated } = options;

        open({
            hints,
            submit: (draft) => {
                const id = manager.dispatch.addEntry(draft, parent);

                if (onCreated) {
                    onCreated(id);
                    return;
                }

                if (!parent) {
                    navigateTo(
                        localeRoute({ name: "entry-id", params: { id } }) ??
                        "/",
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
