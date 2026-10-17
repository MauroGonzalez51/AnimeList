import type { ConsolaInstance } from "consola";
import { JSONSchema } from "@animelist/packages-schema";
import { exists, readTextFile } from "@tauri-apps/plugin-fs";
import { err, ok } from "neverthrow";
import { parse } from "yaml";

class FileNotExists extends Error {
    constructor() {
        super();
        this.name = "FileNotExists";
    }
}

class InvalidFileFormat extends Error {
    constructor() {
        super();
        this.name = "InvalidFileFormat";
    }
}

export async function readStoreContent(
    path: string,
    options?: { logger: ConsolaInstance },
) {
    const resolvedPath = await resolvePath(path);

    if (!(await exists(resolvedPath))) {
        return err(new FileNotExists());
    }

    const logger = options?.logger;

    try {
        const contents = await readTextFile(resolvedPath, {
            encoding: "utf-8",
        });
        const parsed = JSONSchema.safeParse(parse(contents));

        if (!parsed.success) {
            logger?.error(parsed.error.issues);
            return err(new InvalidFileFormat());
        }

        return ok(parsed.data);
    } catch (error: unknown) {
        logger?.error(error);
        return err(new InvalidFileFormat());
    }
}
