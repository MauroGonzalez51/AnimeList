import type { SourceEntry } from "@/lib/migrator/status";
import { isPlainObject } from "es-toolkit";

function collectionOf(root: unknown, key?: string): unknown[] {
    if (Array.isArray(root)) {
        return root;
    }

    if (!key || !isPlainObject(root)) {
        return [];
    }

    const value = root[key];
    if (!Array.isArray(value)) {
        return [];
    }

    return value;
}

export function arrayKeys(root: unknown) {
    if (!isPlainObject(root)) {
        return [];
    }

    return Object.keys(root).filter((key) => Array.isArray(root[key]));
}

export function resolveEntries(root: unknown, key?: string): SourceEntry[] {
    return collectionOf(root, key).flatMap((record, index) => {
        if (!isPlainObject(record)) {
            return [];
        }

        return [{ index, record }];
    });
}
