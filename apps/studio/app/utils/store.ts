import type {
    Entry,
    ReadableEntry,
    WatchableEntry,
} from "@animelist/packages-schema";
import type { z } from "zod";
import {
    BaseStatusSchema,
    ReadableKindSchema,
    ReadableStatusSchema,
    UniverseKindSchema,
    WatchableKindSchema,
    WatchableStatusSchema,
} from "@animelist/packages-schema";
import memoize from "memoize";

export const UniverseKind = UniverseKindSchema.value;
export type UniverseKind = z.infer<typeof UniverseKindSchema>;

export const ReadableKinds = ReadableKindSchema.options.map(
    (option) => option.value,
);
const _ReadableKindsSet = new Set<AnyEntryKind>(ReadableKinds);
export type ReadableKind = z.infer<typeof ReadableKindSchema>;

export const WatchableKinds = WatchableKindSchema.options.map(
    (option) => option.value,
);
const _WatchableKindsSet = new Set<AnyEntryKind>(WatchableKinds);
export type WatchableKind = z.infer<typeof WatchableKindSchema>;

export const AllKinds = [UniverseKind, ...ReadableKinds, ...WatchableKinds];
export type AnyEntryKind = UniverseKind | ReadableKind | WatchableKind;

export const StatusOptions = ReadableStatusSchema.extend(
    WatchableStatusSchema.shape,
);
export const StatusProperties = StatusOptions.keyof().options;
export type StatusProperty = keyof z.infer<typeof BaseStatusSchema>;

export const EntryKindLabel: Record<AnyEntryKind, string> = {
    anime: "domain.store.card.kinds.anime",
    donghua: "domain.store.card.kinds.donghua",
    aeni: "domain.store.card.kinds.aeni",
    ova: "domain.store.card.kinds.ova",
    movie: "domain.store.card.kinds.movie",
    jdrama: "domain.store.card.kinds.jdrama",
    cdrama: "domain.store.card.kinds.cdrama",
    kdrama: "domain.store.card.kinds.kdrama",
    manga: "domain.store.card.kinds.manga",
    manhua: "domain.store.card.kinds.manhua",
    manhwa: "domain.store.card.kinds.manhwa",
    "light-novel": "domain.store.card.kinds.light_novel",
    "web-novel": "domain.store.card.kinds.web_novel",
    other: "domain.store.card.kinds.other",
    universe: "domain.store.card.kinds.universe",
};

export const StatusPropertyLabel: Record<StatusProperty, string> = {
    watched: "domain.store.card.status.properties.watched",
    completed: "domain.store.card.status.properties.completed",
    favorite: "domain.store.card.status.properties.favorite",
    chapter: "domain.store.card.status.properties.chapter",
    comments: "domain.store.card.status.properties.comments",
    episode: "domain.store.card.status.properties.episode",
    rating: "domain.store.card.status.properties.rating",
};

export const isReadable = memoize((kind: AnyEntryKind) => {
    return _ReadableKindsSet.has(kind);
});

export const isWatchable = memoize((kind: AnyEntryKind) => {
    return _WatchableKindsSet.has(kind);
});

export const isReadableEntry = memoize(
    (entry: Entry): entry is ReadableEntry => {
        return _ReadableKindsSet.has(entry.kind);
    },
);

export const isWatchableEntry = memoize(
    (entry: Entry): entry is WatchableEntry => {
        return _WatchableKindsSet.has(entry.kind);
    },
);
