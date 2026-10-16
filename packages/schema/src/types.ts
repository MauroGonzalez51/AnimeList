import type { z } from "zod";
import type {
    AdaptedUntilSchema,
    BaseEntrySchema,
    BaseStatusSchema,
    MetaSchema,
    ReadableStatusSchema,
    ReadableTypeSchema,
    UniverseKindSchema,
    WatchableStatusSchema,
    WatchableTypeSchema,
} from "@/schema";

export type Meta = z.infer<typeof MetaSchema>;

export type BaseEntry = z.infer<typeof BaseEntrySchema>;
export type BaseStatus = z.infer<typeof BaseStatusSchema>;

export type AdaptedUntil = z.infer<typeof AdaptedUntilSchema>;

export type WatchableStatus = z.infer<typeof WatchableStatusSchema>;
export type ReadableStatus = z.infer<typeof ReadableStatusSchema>;

export type Entry = UniverseEntry | WatchableEntry | ReadableEntry;

export type UniverseKind = z.infer<typeof UniverseKindSchema>;

export type UniverseEntry = BaseEntry & {
    kind: UniverseKind;
    children?: Entry[] | undefined;
    related?: Entry[] | undefined;
};

export type WatchableKind = z.infer<typeof WatchableTypeSchema>;
export type WatchableEntry = BaseEntry & {
    kind: WatchableKind;
    status?: WatchableStatus | undefined;
    children?: Entry[] | undefined;
    related?: Entry[] | undefined;
};

export type ReadableKind = z.infer<typeof ReadableTypeSchema>;
export type ReadableEntry = BaseEntry & {
    kind: ReadableKind;
    status?: ReadableStatus | undefined;
    adaptedUntil?: AdaptedUntil | undefined;
    children?: Entry[] | undefined;
    related?: Entry[] | undefined;
};
