/* eslint-disable style/operator-linebreak */
import type { z } from "zod";
import type {
    BaseEntrySchema,
    BaseEntryStatusSchema,
    ReadableEntrySchema,
    WatchableEntrySchema,
} from "@/schema";

declare global {
    namespace Schema {
        type BaseEntry = z.infer<typeof BaseEntrySchema>;
        type BaseEntryStatus = z.infer<typeof BaseEntryStatusSchema>;

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

            type Watchable = Schema.BaseEntry & {
                kind: "anime" | "donghua" | "aeni" | "ova" | "movie";
                chronology?: string | undefined;
                status?: Schema.Status.Watchable | undefined;
                childs?: Schema.Kind.Entry[] | undefined;
                $related?: Schema.Kind.Entry[] | undefined;
            };

            type Readable = Schema.BaseEntry & {
                kind:
                    | "manga"
                    | "manhua"
                    | "manhwa"
                    | "light-novel"
                    | "web-novel"
                    | "other";
                status?: Schema.Status.Readable | undefined;
                childs?: Schema.Kind.Entry[] | undefined;
                $related?: Schema.Kind.Entry[] | undefined;
            };
        }
    }
}
