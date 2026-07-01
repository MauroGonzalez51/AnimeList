import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { z } from "zod";
import { MESSAGES } from "@/messages";

export const EntryReference = z
    .object({
        $id: z.string(),
    })
    .describe(MESSAGES.ENTRY_REFERENCE);

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

export const WatchableEntrySchema = BaseEntryStatusSchema;

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
            kind: z
                .union([
                    z.literal("anime").describe(MESSAGES.ENTRY.KIND.JP),
                    z.literal("donghua").describe(MESSAGES.ENTRY.KIND.CH),
                    z.literal("aeni").describe(MESSAGES.ENTRY.KIND.KR),
                    z.literal("ova"),
                    z.literal("movie"),
                ])
                .default("anime"),
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
            kind: z.union([
                z.literal("manga").describe(MESSAGES.ENTRY.KIND.JP),
                z.literal("manhua").describe(MESSAGES.ENTRY.KIND.CH),
                z.literal("manhwa").describe(MESSAGES.ENTRY.KIND.KR),
                z.literal("light-novel"),
                z.literal("web-novel"),
                z.literal("other"),
            ]),
            status: ReadableEntrySchema.optional().describe(
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

    const schema = JSONSchema.toJSONSchema();

    await writeFile(path, JSON.stringify(schema, null, 4), "utf-8");
}
