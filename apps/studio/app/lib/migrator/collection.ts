import type {
    MigratorStatus,
    SourceEntry,
    SourceRecord,
} from "@/lib/migrator/types";
import { isPlainObject } from "es-toolkit";
import { MIGRATOR_STATUS_KEY } from "@/lib/migrator/types";

// true when the root is an array the migrator can iterate directly
export function isArrayRoot(root: unknown): root is unknown[] {
    return Array.isArray(root);
}

// object keys whose value is an array of objects; these are the selectable
// "field to iterate" options when the root is an object, not an array
export function iterableKeys(root: unknown): string[] {
    if (!isPlainObject(root)) {
        return [];
    }

    const keys: string[] = [];
    for (const [key, value] of Object.entries(root)) {
        if (Array.isArray(value) && value.every(isPlainObject)) {
            keys.push(key);
        }
    }

    return keys;
}

// resolve the array to iterate: the root itself when it is an array, otherwise
// the array held by the selected key
export function resolveCollection(
    root: unknown,
    selectedKey?: string,
): SourceRecord[] {
    if (isArrayRoot(root)) {
        return root.filter(isPlainObject) as SourceRecord[];
    }

    if (selectedKey && isPlainObject(root)) {
        const value = (root as Record<string, unknown>)[selectedKey];
        if (Array.isArray(value)) {
            return value.filter(isPlainObject) as SourceRecord[];
        }
    }

    return [];
}

export function toSourceEntries(records: SourceRecord[]): SourceEntry[] {
    return records.map((record, key) => ({ key, record }));
}

export function statusOf(record: SourceRecord): MigratorStatus | undefined {
    return record[MIGRATOR_STATUS_KEY];
}

// an entry is processed only when it has no status or is still pending
export function isPending(record: SourceRecord): boolean {
    const status = statusOf(record);
    return status === undefined || status === "pending";
}

export function processingSet(entries: SourceEntry[]): SourceEntry[] {
    return entries.filter((entry) => isPending(entry.record));
}
