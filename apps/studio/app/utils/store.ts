import type {
    KindEntry,
    KindReadable,
    KindWatchable,
} from "@animelist/packages-schema";
import type { z } from "zod";
import {
    ReadableEntryKindSchema,
    ReadableEntrySchema,
    RootEntryKindSchema,
    WatchableEntryKindSchema,
    WatchableEntrySchema,
} from "@animelist/packages-schema";
import memoize from "memoize";

export const _RootKind = RootEntryKindSchema.value;
export type RootKind = z.infer<typeof RootEntryKindSchema>;

export const ReadableKinds = ReadableEntryKindSchema.options.map(
    (option) => option.value,
);
const _ReadableKindsSet = new Set(...ReadableKinds);
export type ReadableKind = z.infer<typeof ReadableEntryKindSchema>;

export const WatchableKinds = WatchableEntryKindSchema.options.map(
    (option) => option.value,
);
const _WatchableKindsSet = new Set(...WatchableKinds);
export type WatchableKind = z.infer<typeof WatchableEntryKindSchema>;

export const AllKinds = [_RootKind, ...ReadableKinds, ...WatchableKinds];
export type AnyEntryKind = RootKind | ReadableKind | WatchableKind;

export const StatusOptions = ReadableEntrySchema.extend(
    WatchableEntrySchema.shape,
);
export const StatusProperties = StatusOptions.keyof().options;
export type StatusProperty = keyof z.infer<typeof StatusOptions>;

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
    $root: "domain.store.card.kinds.$root",
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
    (entry: KindEntry): entry is KindReadable => {
        return _ReadableKindsSet.has(entry.kind);
    },
);

export const isWatchableEntry = memoize(
    (entry: KindEntry): entry is KindWatchable => {
        return _WatchableKindsSet.has(entry.kind);
    },
);
