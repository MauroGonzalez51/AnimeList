import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { z } from "zod";
import { MESSAGES } from "@/messages";

const EntryRelation = z.union([
    z.literal("prequel").describe(MESSAGES.ENTRY_RELATION.PREQUEL),
    z.literal("sequel").describe(MESSAGES.ENTRY_RELATION.SEQUEL),
    z.literal("universe").describe(MESSAGES.ENTRY_RELATION.UNIVERSE),
    z.literal("author").describe(MESSAGES.ENTRY_RELATION.AUTHOR),
    z.literal("unknown").describe(MESSAGES.ENTRY_RELATION.UNKNOWN),
]);

export const EntryReference = z.object({
    $id: z.string().describe(MESSAGES.ENTRY_REFERENCE.ID),
    relation: z
        .array(EntryRelation)
        .optional()
        .describe(MESSAGES.ENTRY_REFERENCE.RELATION),
});

export const BaseEntrySchema = z.object({
    $id: z.string().optional().describe(MESSAGES.ENTRY.ID),
    $reference: z
        .array(EntryReference)
        .optional()
        .describe(MESSAGES.ENTRY.REFERENCE),
    name: z.string(),
});

export const BaseEntryStatusSchema = z.object({
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
    comments: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .describe(MESSAGES.BASE_ENTRY_STATUS.COMMENTS),
});

export const WatchableEntryKindSchema = z.union([
    z.literal("anime").describe(MESSAGES.ENTRY.KIND.JP),
    z.literal("donghua").describe(MESSAGES.ENTRY.KIND.CH),
    z.literal("aeni").describe(MESSAGES.ENTRY.KIND.KR),
    z.literal("ova"),
    z.literal("movie"),
]);

export const WatchableEntrySchema = BaseEntryStatusSchema.safeExtend({
    episode: z
        .union([z.string(), z.number().positive()])
        .optional()
        .describe(MESSAGES.WATCHABLE_ENTRY.EPISODE),
});

export const ReadableEntryKindSchema = z.union([
    z.literal("manga").describe(MESSAGES.ENTRY.KIND.JP),
    z.literal("manhua").describe(MESSAGES.ENTRY.KIND.CH),
    z.literal("manhwa").describe(MESSAGES.ENTRY.KIND.KR),
    z.literal("light-novel"),
    z.literal("web-novel"),
    z.literal("other"),
]);

export const ReadableEntrySchema = BaseEntryStatusSchema.safeExtend({
    completed: z
        .boolean()
        .optional()
        .describe(MESSAGES.READABLE_ENTRY.COMPLETED),
    chapter: z
        .union([z.string(), z.number().positive()])
        .optional()
        .describe(MESSAGES.READABLE_ENTRY.CHAPTER),
});

export const AdaptedUntilSchema = z.object({
    kind: WatchableEntryKindSchema.optional(),
    chapter: z
        .union([z.string(), z.number().positive()])
        .optional()
        .describe(MESSAGES.ADAPTATION.CHAPTER),
    volume: z
        .union([z.string(), z.number().positive()])
        .optional()
        .describe(MESSAGES.ADAPTATION.VOLUME),
    episode: z
        .union([z.string(), z.number().positive()])
        .optional()
        .describe(MESSAGES.ADAPTATION.EPISODE),
    arc: z.string().optional().describe(MESSAGES.ADAPTATION.ARC),
});

export const Entry: z.ZodType<Schema.Kind.Entry> = z.discriminatedUnion(
    "kind",
    [
        BaseEntrySchema.safeExtend({
            kind: z.literal("$root"),
            get childs() {
                return z
                    .array(Entry)
                    .optional()
                    .describe(MESSAGES.ENTRY.CHILDS);
            },
            get $related() {
                return z
                    .array(Entry)
                    .optional()
                    .describe(MESSAGES.ENTRY.RELATED);
            },
        }),

        BaseEntrySchema.safeExtend({
            kind: WatchableEntryKindSchema.default("anime"),
            chronology: z.string().optional(),
            status: WatchableEntrySchema.optional().describe(
                MESSAGES.ENTRY.STATUS,
            ),
            get childs() {
                return z
                    .array(Entry)
                    .optional()
                    .describe(MESSAGES.ENTRY.CHILDS);
            },
            get $related() {
                return z
                    .array(Entry)
                    .optional()
                    .describe(MESSAGES.ENTRY.RELATED);
            },
        }),

        BaseEntrySchema.safeExtend({
            kind: ReadableEntryKindSchema,
            status: ReadableEntrySchema.optional().describe(
                MESSAGES.ENTRY.STATUS,
            ),
            adapted_until: AdaptedUntilSchema.optional().describe(
                MESSAGES.ENTRY.ADAPTED_UNTIL,
            ),
            get childs() {
                return z
                    .array(Entry)
                    .optional()
                    .describe(MESSAGES.ENTRY.CHILDS);
            },
            get $related() {
                return z
                    .array(Entry)
                    .optional()
                    .describe(MESSAGES.ENTRY.RELATED);
            },
        }),
    ],
);

export const JSONSchema = z.object({
    meta: z
        .object({
            name: z.string(),
            github: z.url(),
        })
        .describe(MESSAGES.SCHEMA.META),
    entries: z.array(Entry).optional().describe(MESSAGES.SCHEMA.ENTRIES),
});

export async function saveSchema(path: string) {
    await mkdir(dirname(path), { recursive: true });

    const schema = JSONSchema.toJSONSchema({ reused: "ref" });

    await writeFile(path, JSON.stringify(schema, null, 4), "utf-8");
}
