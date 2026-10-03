import type { CommandMap } from "@/lib/tauri/command-builder";
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
});

export type Commands = CommandMap<typeof tauri.defs>;
