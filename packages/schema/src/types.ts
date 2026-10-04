import type { z } from "zod";
import type {
    AdaptedUntilSchema,
    BaseEntrySchema,
    BaseEntryStatusSchema,
    ReadableEntryKindSchema,
    ReadableEntrySchema,
    WatchableEntryKindSchema,
    WatchableEntrySchema,
} from "@/schema";

export type BaseEntry = z.infer<typeof BaseEntrySchema>;
export type BaseEntryStatus = z.infer<typeof BaseEntryStatusSchema>;

export type AdaptedUntil = z.infer<typeof AdaptedUntilSchema>;

export type StatusWatchable = z.infer<typeof WatchableEntrySchema>;
export type StatusReadable = z.infer<typeof ReadableEntrySchema>;

export type KindEntry = KindRoot | KindWatchable | KindReadable;

export type KindRoot = BaseEntry & {
    kind: "$root";
    childs?: KindEntry[] | undefined;
    $related?: KindEntry[] | undefined;
};

export type KindWatchableEntryKind = z.infer<typeof WatchableEntryKindSchema>;
export type KindWatchable = BaseEntry & {
    kind: KindWatchableEntryKind;
    chronology?: string | undefined;
    status?: StatusWatchable | undefined;
    adapted_until?: AdaptedUntil | undefined;
    childs?: KindEntry[] | undefined;
    $related?: KindEntry[] | undefined;
};

export type KindReadableEntryKind = z.infer<typeof ReadableEntryKindSchema>;
export type KindReadable = BaseEntry & {
    kind: KindReadableEntryKind;
    status?: StatusReadable | undefined;
    childs?: KindEntry[] | undefined;
    $related?: KindEntry[] | undefined;
};
