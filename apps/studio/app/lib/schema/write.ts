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
import { JSONSchema } from "@animelist/packages-schema";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { dirname, relative } from "pathe";
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
    schemaPath?: string | null;
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

export const WRITE_QUEUE = new Queue({ concurrency: 1, autostart: true });

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

function _template(path: string) {
    return `# yaml-language-server: $schema=${path}\n\n`;
}

async function schemaHeader(storePath: string, schemaPath?: string | null) {
    if (!schemaPath) {
        return "";
    }

    const target = relative(dirname(storePath), await resolvePath(schemaPath));
    if (!target.startsWith(".")) {
        return _template(`./${target}`);
    }

    return _template(target);
}

async function ensureSchemaFile(schemaPath: string) {
    if (
        (await exists(schemaPath)) &&
        (await readTextFile(schemaPath)).trim() !== ""
    ) {
        return;
    }

    const schema = JSONSchema.toJSONSchema({ reused: "ref" });
    await writeTextFile(
        schemaPath,
        await format(JSON.stringify(schema), {
            tabWidth: 4,
        }),
    );
}

export function performWrite(args: Args) {
    WRITE_QUEUE.push(async () => {
        const path = await resolvePath(args.path);

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

        if (args.schemaPath) {
            await ensureSchemaFile(await resolvePath(args.schemaPath));
        }

        const content = await format(
            (await schemaHeader(path, args.schemaPath)) + doc.toString(),
            {
                parser: "yaml",
                plugins: [yamlPlugin],
                tabWidth: 4,
            },
        );

        await writeTextFile(path, content);

        return path;
    });
}
