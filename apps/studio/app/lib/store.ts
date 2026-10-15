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

export function _isUniverse<T extends Entry | FlatEntry>(
    entry: T,
): entry is Extract<T, { kind: "universe" }> {
    return entry.kind === "universe";
}

export function _isReadable<T extends Entry | FlatEntry>(
    entry: T,
): entry is Extract<T, { kind: ReadableKind }> {
    return ReadableTypeSchema.options.some(
        (option) => option.value === entry.kind,
    );
}

export function _isWatchable<T extends Entry | FlatEntry>(
    entry: T,
): entry is Extract<T, { kind: WatchableKind }> {
    return WatchableTypeSchema.options.some(
        (option) => option.value === entry.kind,
    );
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
    "web-novel": "domain.entry.kind.domain.entry.kind.web-novel",
    other: "domain.entry.kind.other",
};
