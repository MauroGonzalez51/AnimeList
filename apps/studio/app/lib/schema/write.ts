import type {
    BaseStatus,
    Entry,
    Meta,
    ReadableEntry,
    ReadableStatus,
    Store,
    UniverseEntry,
    WatchableEntry,
    WatchableStatus,
} from "@animelist/packages-schema";
import type { KeysOfUnion } from "type-fest";
import type { Pair } from "yaml";
import type { FlatEntry } from "@/lib/schema/types";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import * as yamlPlugin from "prettier/plugins/yaml";
import { format } from "prettier/standalone";
import Queue from "queue";
import { Document, isMap, isNode, visit } from "yaml";
import { unflattenEntries } from "@/lib/schema/process";

interface Args {
    data: {
        meta: Meta;
        entries: Map<FlatEntry["id"], FlatEntry>;
    };
    path: string;
}

const KEY_ORDER: KeysOfUnion<
    | Store
    | UniverseEntry
    | ReadableEntry
    | WatchableEntry
    | BaseStatus
    | ReadableStatus
    | WatchableStatus
>[] = [
    /////////////////////////
    "meta",
    "entries",

    /////////////////////////
    "id",
    "kind",
    "name",
    "related",
    "references",
    "chronology",

    /////////////////////////
    "adaptedUntil",
    "status",
    "children",

    /////////////////////////
    "favorite",
    "watched",
    "completed",
    "chapter",
];

// TODO: set this via config
const SCHEMA_HEADER =
    "# yaml-language-server: $schema=./packages/schema/.output/schema.json\n\n";

function keyRank(key: unknown) {
    const index = KEY_ORDER.indexOf(String(key) as KeysOfUnion<Entry>);

    if (index === -1) {
        return KEY_ORDER.length;
    }

    return index;
}

function sortMapEntries(a: Pair, b: Pair) {
    return (
        keyRank(a.key) - keyRank(b.key) ||
        String(a.key).localeCompare(String(b.key))
    );
}

export const WRITE_QUEUE = new Queue({ concurrency: 1, autostart: true });

export function performWrite(args: Args) {
    WRITE_QUEUE.push(async () => {
        const entries = unflattenEntries(args.data.entries);

        const storeData: Store = {
            meta: args.data.meta,
            entries,
        };

        const doc = new Document(storeData, { sortMapEntries });

        if (isMap(doc.contents)) {
            for (const { key } of doc.contents.items.slice(1)) {
                if (isNode(key)) {
                    key.spaceBefore = true;
                }
            }
        }

        visit(doc, {
            Seq(_, seq) {
                if (!seq.items.every(isMap)) {
                    return;
                }

                for (const item of seq.items.slice(1)) {
                    item.spaceBefore = true;
                }
            },
        });

        const content = await format(SCHEMA_HEADER + doc.toString(), {
            parser: "yaml",
            plugins: [yamlPlugin],
            tabWidth: 4,
        });

        await writeTextFile(args.path, content);

        return args.path;
    });
}
