import type { z } from "zod";
import type {
    AdaptedUntilSchema,
    BaseEntrySchema,
    BaseStatusSchema,
    ReadableKindSchema,
    ReadableStatusSchema,
    UniverseKindSchema,
    WatchableKindSchema,
    WatchableStatusSchema,
} from "@/schema";

export type BaseEntry = z.infer<typeof BaseEntrySchema>;
export type BaseStatus = z.infer<typeof BaseStatusSchema>;

export type AdaptedUntil = z.infer<typeof AdaptedUntilSchema>;

export type WatchableStatus = z.infer<typeof WatchableStatusSchema>;
export type ReadableStatus = z.infer<typeof ReadableStatusSchema>;

export type Entry = UniverseEntry | WatchableEntry | ReadableEntry;

export type UniverseEntry = BaseEntry & {
    kind: z.infer<typeof UniverseKindSchema>;
    children?: Entry[] | undefined;
    related?: Entry[] | undefined;
};

export type WatchableKind = z.infer<typeof WatchableKindSchema>;
export type WatchableEntry = BaseEntry & {
    kind: WatchableKind;
    status?: WatchableStatus | undefined;
    children?: Entry[] | undefined;
    related?: Entry[] | undefined;
};

export type ReadableKind = z.infer<typeof ReadableKindSchema>;
export type ReadableEntry = BaseEntry & {
    kind: ReadableKind;
    status?: ReadableStatus | undefined;
    adaptedUntil?: AdaptedUntil | undefined;
    children?: Entry[] | undefined;
    related?: Entry[] | undefined;
};
