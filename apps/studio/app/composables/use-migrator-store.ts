import type { EntryDraft, FlatEntry, SourceType } from "~/lib/schema";
import { stringify } from "yaml";
import { buildEntryTree } from "~/lib/schema";

// store-side actions a migrator source entry can drive; selecting a source entry
// never calls any of these, so selection alone leaves the store untouched
export default function () {
    const manager = useStoreManager();
    const entryForm = useEntryForm();
    const { entries, entriesMap } = storeToRefs(manager);

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

    function plain(entry: FlatEntry): Record<string, unknown> {
        const internals = new Set([
            "_parentId",
            "_source",
            "children",
            "related",
        ]);

        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(entry)) {
            if (internals.has(key)) {
                continue;
            }

            result[key] = value;
        }

        return result;
    }

    interface YamlNode extends Record<string, unknown> {
        children?: YamlNode[];
        related?: YamlNode[];
    }

    function toYaml(id: FlatEntry["id"]): string | undefined {
        const tree = buildEntryTree(entriesMap.value, id);
        if (!tree) {
            return undefined;
        }

        function toNode(node: NonNullable<typeof tree>): YamlNode {
            const result: YamlNode = plain(node.entry);

            if (node.children.length) {
                result.children = node.children.map(toNode);
            }

            if (node.related.length) {
                result.related = node.related.map(toNode);
            }

            return result;
        }

        return stringify(toNode(tree), { indent: 4 });
    }

    return {
        entries,
        entriesMap,
        dispatch: {
            create,
            attach,
            edit,
            search,
            toYaml,
        },
    };
}
