import type {
    Entry,
    ReadableKind,
    UniverseKind,
    WatchableKind,
} from "@animelist/packages-schema";
import type { FlatEntry } from "@/lib/schema";
import {
    ReadableTypeSchema,
    WatchableTypeSchema,
} from "@animelist/packages-schema";

export const READABLE_KINDS = ReadableTypeSchema.options.map(
    (option) => option.value,
);

export const WATCHABLE_KINDS = WatchableTypeSchema.options.map(
    (option) => option.value,
);

const READABLE_KIND_SET: ReadonlySet<string> = new Set(READABLE_KINDS);
const WATCHABLE_KIND_SET: ReadonlySet<string> = new Set(WATCHABLE_KINDS);

export function isUniverseKind(kind: string): kind is UniverseKind {
    return kind === "universe";
}

export function isReadableKind(kind: string): kind is ReadableKind {
    return READABLE_KIND_SET.has(kind);
}

export function isWatchableKind(kind: string): kind is WatchableKind {
    return WATCHABLE_KIND_SET.has(kind);
}

export function _isUniverse<T extends Entry | FlatEntry>(
    entry: T,
): entry is Extract<T, { kind: "universe" }> {
    return isUniverseKind(entry.kind);
}

export function _isReadable<T extends Entry | FlatEntry>(
    entry: T,
): entry is Extract<T, { kind: ReadableKind }> {
    return isReadableKind(entry.kind);
}

export function _isWatchable<T extends Entry | FlatEntry>(
    entry: T,
): entry is Extract<T, { kind: WatchableKind }> {
    return isWatchableKind(entry.kind);
}

export const KIND_LABELS: Record<
    UniverseKind | ReadableKind | WatchableKind,
    string
> = {
    universe: "domain.entry.kind.universe",
    anime: "domain.entry.kind.anime",
    donghua: "domain.entry.kind.donghua",
    aeni: "domain.entry.kind.aeni",
    ova: "domain.entry.kind.ova",
    movie: "domain.entry.kind.movie",
    jdrama: "domain.entry.kind.jdrama",
    cdrama: "domain.entry.kind.cdrama",
    kdrama: "domain.entry.kind.kdrama",
    manga: "domain.entry.kind.manga",
    manhua: "domain.entry.kind.manhua",
    manhwa: "domain.entry.kind.manhwa",
    "light-novel": "domain.entry.kind.light-novel",
    "web-novel": "domain.entry.kind.web-novel",
    other: "domain.entry.kind.other",
};

export type EntryKind = keyof typeof KIND_LABELS;

export const KINDS = Object.keys(KIND_LABELS) as EntryKind[];

// kinds an existing entry can switch to without losing its family-specific fields
export function kindsInFamily(kind: EntryKind): readonly EntryKind[] {
    if (isReadableKind(kind)) {
        return READABLE_KINDS;
    }

    if (isWatchableKind(kind)) {
        return WATCHABLE_KINDS;
    }

    return [kind];
}

export type EntryReference = NonNullable<Entry["references"]>[number];
export type EntryRelation = NonNullable<EntryReference["relation"]>[number];

export const RELATION_LABELS: Record<EntryRelation, string> = {
    prequel: "domain.entry.relation.prequel",
    sequel: "domain.entry.relation.sequel",
    universe: "domain.entry.relation.universe",
    author: "domain.entry.relation.author",
    unknown: "domain.entry.relation.unknown",
};

export const RELATION_HELP: Record<EntryRelation, string> = {
    prequel: "domain.entry.relation_help.prequel",
    sequel: "domain.entry.relation_help.sequel",
    universe: "domain.entry.relation_help.universe",
    author: "domain.entry.relation_help.author",
    unknown: "domain.entry.relation_help.unknown",
};

export const RELATIONS = Object.keys(RELATION_LABELS) as EntryRelation[];
