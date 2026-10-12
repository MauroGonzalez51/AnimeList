import { z } from "zod";
import { defineCommands } from "@/lib/tauri/commands";

export const Config = z.object({
    store_path: z.string().nullable(),
});

export const tauri = defineCommands({
    get_config: {
        result: Config,
    },
    save_config: {
        input: z.object({ config: Config.shape }),
        result: Config,
    },
});
