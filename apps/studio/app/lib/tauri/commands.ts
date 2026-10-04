import type { CommandMap } from "@/lib/tauri/command-builder";
import { JSONSchema } from "@animelist/packages-schema";
import { z } from "zod";
import { defineCommands } from "@/lib/tauri/command-builder";

export const tauri = defineCommands({
    get_store_status: {
        result: z.string().nullable(),
    },
    set_store_path: {
        input: z.object({ path: z.string().min(1) }),
        result: z.string(),
    },
    clear_store_path: {
        result: z.null(),
    },
    query_schema: {
        result: JSONSchema,
    },
    save_schema: {
        input: z.object({ schema: z.unknown() }),
        result: z.null(),
    },
});

export type Commands = CommandMap<typeof tauri.defs>;
