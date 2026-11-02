import type { AcceptedFormat } from "@/lib/file";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import Queue from "queue";
import { FILE_EXTENSIONS, MIME_TYPES } from "@/lib/file";
import { formatJson } from "@/lib/format";

export const SOURCE_FILTER: AcceptedFormat[] = [
    {
        name: "JSON",
        extensions: FILE_EXTENSIONS.JSON,
        mime: [MIME_TYPES.JSON],
    },
];

export const SOURCE_WRITE_QUEUE = new Queue({
    concurrency: 1,
    autostart: true,
});

export function persistSource(path: string, root: unknown) {
    SOURCE_WRITE_QUEUE.push(async () => {
        const target = await resolvePath(path);
        await writeTextFile(target, await formatJson(JSON.stringify(root)));

        return target;
    });
}
