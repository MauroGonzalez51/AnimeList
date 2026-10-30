import type { z } from "zod";

export type MigratorStatus = "resolved" | "skipped" | "pending";

export const MIGRATOR_STATUS_KEY = "__animelist_migrator_status";

export type SourceRecord = Record<string, unknown> & {
    [MIGRATOR_STATUS_KEY]?: MigratorStatus;
};

// a source entry lifted out of the loaded collection; the key is stable within
// one loaded document (position in the selected collection)
export interface SourceEntry {
    key: number;
    record: SourceRecord;
}

export interface LoadedSource {
    // the file the data came from; writes go back here as the checkpoint
    path: string;
    // the parsed JSON root, kept verbatim so the whole document can be written back
    root: unknown;
}

export interface InferredSchema {
    // human-readable shape, produced by json-to-zod, shown in the UI
    display: string;
    // runtime validator used to flag (not block) entries that drift from the shape
    runtime: z.ZodType;
}
