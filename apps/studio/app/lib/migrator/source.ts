import type { ConsolaInstance } from "consola";
import type { LoadedSource } from "@/lib/migrator/types";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { err, ok } from "neverthrow";
import Queue from "queue";

class InvalidJsonFile extends Error {
    constructor() {
        super();
        this.name = "InvalidJsonFile";
    }
}

// dedicated single-concurrency queue for the source file, kept separate from the
// store's WRITE_QUEUE so the two destinations never serialize against each other
export const SOURCE_WRITE_QUEUE = new Queue({
    concurrency: 1,
    autostart: true,
});

// prompt for a JSON file and return its absolute path; the dialog yields a real
// filesystem path (unlike a web drop), which the write-back checkpoint needs
export async function pickSourceFile() {
    const path = await open({
        filters: [{ name: "JSON", extensions: ["json"] }],
        multiple: false,
    });
    return path;
}

// read a JSON file by path and parse it; the path doubles as the write target so
// the file itself becomes the resumable checkpoint
export async function loadSource(
    path: string,
    options?: { logger?: ConsolaInstance },
) {
    try {
        const text = await readTextFile(await resolvePath(path), {
            encoding: "utf-8",
        });
        const root: unknown = JSON.parse(text);
        return ok<LoadedSource>({ path, root });
    } catch (error: unknown) {
        options?.logger?.error(error);
        return err(new InvalidJsonFile());
    }
}

// serialize the whole in-memory document and write it back to its path; the file
// is the resumable checkpoint, so the entire root is persisted, not a diff
export function enqueueSourceWrite(source: LoadedSource) {
    SOURCE_WRITE_QUEUE.push(async () => {
        const path = await resolvePath(source.path);
        const content = `${JSON.stringify(source.root, null, 4)}\n`;
        await writeTextFile(path, content);
        return path;
    });
}
