import type { Entry } from "@/types";
import { z } from "zod";
import { MESSAGES } from "@/messages";

const ValueLike = z.union([
    z.string(),
    z.record(z.string(), z.unknown()),
    z.array(z.union([z.string(), z.record(z.string(), z.unknown())])),
]);

const PositiveNumberLike = z.union([z.string(), z.number().positive()]);

const EntryRelation = z.union([
    z.literal("prequel").describe(MESSAGES.ENTRY_RELATION.PREQUEL),
    z.literal("sequel").describe(MESSAGES.ENTRY_RELATION.SEQUEL),
    z.literal("universe").describe(MESSAGES.ENTRY_RELATION.UNIVERSE),
    z.literal("author").describe(MESSAGES.ENTRY_RELATION.AUTHOR),
    z.literal("unknown").describe(MESSAGES.ENTRY_RELATION.UNKNOWN),
]);

export const EntryReference = z.object({
    id: z.string().describe(MESSAGES.ENTRY_REFERENCE.ID),
    relation: z
        .array(EntryRelation)
        .optional()
        .describe(MESSAGES.ENTRY_REFERENCE.RELATION),
});

export const BaseEntrySchema = z.object({
    id: z.string().optional().describe(MESSAGES.ENTRY.ID),
    references: z
        .array(EntryReference)
        .optional()
        .describe(MESSAGES.ENTRY.REFERENCE),
    name: z.string(),
    chronology: z.string().optional(),
    comments: ValueLike.optional().describe(
        MESSAGES.BASE_ENTRY_STATUS.COMMENTS,
    ),
});

export const BaseStatusSchema = z.object({
    watched: z
        .boolean()
        .optional()
        .describe(MESSAGES.BASE_ENTRY_STATUS.WATCHED),
    favorite: z
        .boolean()
        .optional()
        .describe(MESSAGES.BASE_ENTRY_STATUS.FAVORITE),
    rating: z
        .number()
        .positive()
        .optional()
        .describe(MESSAGES.BASE_ENTRY_STATUS.RATING),
    comments: ValueLike.optional().describe(
        MESSAGES.BASE_ENTRY_STATUS.COMMENTS,
    ),
});

export const WatchableKindSchema = z.union([
    z.literal("anime").describe(MESSAGES.ENTRY.KIND.JP),
    z.literal("donghua").describe(MESSAGES.ENTRY.KIND.CH),
    z.literal("aeni").describe(MESSAGES.ENTRY.KIND.KR),
    z.literal("ova"),
    z.literal("movie"),
    z.literal("jdrama").describe(MESSAGES.ENTRY.KIND.JP),
    z.literal("cdrama").describe(MESSAGES.ENTRY.KIND.CH),
    z.literal("kdrama").describe(MESSAGES.ENTRY.KIND.KR),
]);

export const WatchableStatusSchema = BaseStatusSchema.safeExtend({
    episode: PositiveNumberLike.optional().describe(
        MESSAGES.WATCHABLE_ENTRY.EPISODE,
    ),
});

export const ReadableKindSchema = z.union([
    z.literal("manga").describe(MESSAGES.ENTRY.KIND.JP),
    z.literal("manhua").describe(MESSAGES.ENTRY.KIND.CH),
    z.literal("manhwa").describe(MESSAGES.ENTRY.KIND.KR),
    z.literal("light-novel"),
    z.literal("web-novel"),
    z.literal("other"),
]);

export const ReadableStatusSchema = BaseStatusSchema.safeExtend({
    completed: z
        .boolean()
        .optional()
        .describe(MESSAGES.READABLE_ENTRY.COMPLETED),
    chapter: PositiveNumberLike.optional().describe(
        MESSAGES.READABLE_ENTRY.CHAPTER,
    ),
});

export const AdaptedUntilSchema = z.object({
    kind: WatchableKindSchema.optional(),
    chapter: PositiveNumberLike.optional().describe(
        MESSAGES.ADAPTATION.CHAPTER,
    ),
    volume: PositiveNumberLike.optional().describe(MESSAGES.ADAPTATION.VOLUME),
    episode: PositiveNumberLike.optional().describe(
        MESSAGES.ADAPTATION.EPISODE,
    ),
    arc: z.string().optional().describe(MESSAGES.ADAPTATION.ARC),
    notes: ValueLike.optional().describe(MESSAGES.ADAPTATION.NOTES),
});

export const UniverseKindSchema = z.literal("universe");

export const EntrySchema: z.ZodType<Entry> = z.discriminatedUnion("kind", [
    BaseEntrySchema.safeExtend({
        kind: UniverseKindSchema,
        get children() {
            return z.array(EntrySchema).optional();
        },
        get related() {
            return z.array(EntrySchema).optional();
        },
    }),

    BaseEntrySchema.safeExtend({
        kind: WatchableKindSchema.default("anime"),
        status: WatchableStatusSchema.optional().describe(MESSAGES.ENTRY.STATUS),
        get children() {
            return z.array(EntrySchema).optional();
        },
        get related() {
            return z.array(EntrySchema).optional();
        },
    }),

    BaseEntrySchema.safeExtend({
        kind: ReadableKindSchema,
        status: ReadableStatusSchema.optional().describe(MESSAGES.ENTRY.STATUS),
        adaptedUntil: AdaptedUntilSchema.optional().describe(
            MESSAGES.ENTRY.ADAPTED_UNTIL,
        ),
        get children() {
            return z.array(EntrySchema).optional();
        },
        get related() {
            return z.array(EntrySchema).optional();
        },
    }),
]);

export const JSONSchema = z.object({
    meta: z
        .object({
            name: z.string(),
            github: z.url(),
        })
        .describe(MESSAGES.SCHEMA.META),
    entries: z.array(EntrySchema).optional().describe(MESSAGES.SCHEMA.ENTRIES),
});
