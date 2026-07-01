/* eslint-disable style/operator-linebreak */
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

declare global {
    namespace Schema {
        type BaseEntry = z.infer<typeof BaseEntrySchema>;
        type BaseEntryStatus = z.infer<typeof BaseEntryStatusSchema>;

        type AdaptedUntil = z.infer<typeof AdaptedUntilSchema>;

        namespace Status {
            type Watchable = z.infer<typeof WatchableEntrySchema>;
            type Readable = z.infer<typeof ReadableEntrySchema>;
        }

        namespace Kind {
            type Entry =
                | Schema.Kind.Root
                | Schema.Kind.Watchable
                | Schema.Kind.Readable;

            type Root = Schema.BaseEntry & {
                kind: "$root";
                childs?: Schema.Kind.Entry[] | undefined;
                $related?: Schema.Kind.Entry[] | undefined;
            };

            type WatchableEntryKind = z.infer<typeof WatchableEntryKindSchema>;
            type Watchable = Schema.BaseEntry & {
                kind: Schema.Kind.WatchableEntryKind;
                chronology?: string | undefined;
                status?: Schema.Status.Watchable | undefined;
                adapted_until?: Schema.AdaptedUntil | undefined;
                childs?: Schema.Kind.Entry[] | undefined;
                $related?: Schema.Kind.Entry[] | undefined;
            };

            type ReadableEntryKind = z.infer<typeof ReadableEntryKindSchema>;
            type Readable = Schema.BaseEntry & {
                kind: Schema.Kind.ReadableEntryKind;
                status?: Schema.Status.Readable | undefined;
                childs?: Schema.Kind.Entry[] | undefined;
                $related?: Schema.Kind.Entry[] | undefined;
            };
        }
    }
}
