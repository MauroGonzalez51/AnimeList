import type { InferredSchema } from "@/lib/migrator/types";
import { jsonToZod } from "json-to-zod";
import { z } from "zod";
import { MIGRATOR_STATUS_KEY } from "@/lib/migrator/types";

const MigratorStatusSchema = z
    .enum(["resolved", "skipped", "pending"])
    .optional();

// build a runtime ZodType from a sample value without evaluating generated code
function build(value: unknown): z.ZodType {
    if (value === null) {
        return z.null();
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return z.array(z.unknown());
        }

        return z.array(build(value[0]));
    }

    switch (typeof value) {
        case "string":
            return z.string();
        case "number":
            return z.number();
        case "bigint":
            return z.number().int();
        case "boolean":
            return z.boolean();
        case "object":
            return buildObject(value as Record<string, unknown>);
        default:
            return z.unknown();
    }
}

function buildObject(value: Record<string, unknown>): z.ZodType {
    const shape: Record<string, z.ZodType> = {};

    for (const [key, item] of Object.entries(value)) {
        // every inferred field is optional: scraped data is irregular, so a
        // missing field must flag, not hard-fail
        shape[key] = build(item).optional();
    }

    return z.object(shape);
}

// the display string from json-to-zod, augmented with the tracking field so the
// shown shape matches what the migrator actually tracks
function augmentDisplay(display: string): string {
    const marker = "z.object({";
    const index = display.indexOf(marker);
    if (index === -1) {
        return display;
    }

    const head = display.slice(0, index + marker.length);
    const tail = display.slice(index + marker.length);
    return `${head}'${MIGRATOR_STATUS_KEY}':z.enum(["resolved","skipped","pending"]).optional(),${tail}`;
}

export function inferSchema(sample: unknown): InferredSchema {
    const base = build(sample);

    let runtime: z.ZodType = base;
    if (base instanceof z.ZodObject) {
        runtime = base.extend({ [MIGRATOR_STATUS_KEY]: MigratorStatusSchema });
    }

    let display = "";
    try {
        display = jsonToZod(sample);
        if (base instanceof z.ZodObject) {
            display = augmentDisplay(display);
        }
    } catch {
        display = "";
    }

    return { display, runtime };
}
