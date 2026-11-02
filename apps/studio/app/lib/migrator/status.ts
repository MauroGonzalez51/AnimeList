import { z } from "zod";

export const STATUS_KEY = "__animelist_migrator_status";

export const MigratorStatusSchema = z.enum(["resolved", "skipped", "pending"]);

export type MigratorStatus = z.infer<typeof MigratorStatusSchema>;

export type SourceRecord = Record<string, unknown>;

export interface SourceEntry {
    index: number;
    record: SourceRecord;
}

export function statusOf(record: SourceRecord) {
    const result = MigratorStatusSchema.safeParse(record[STATUS_KEY]);
    if (!result.success) {
        return undefined;
    }

    return result.data;
}

export function isPending(record: SourceRecord) {
    const status = statusOf(record);

    return status === undefined || status === "pending";
}
