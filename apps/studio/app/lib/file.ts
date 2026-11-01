import type { DialogFilter } from "@tauri-apps/plugin-dialog";
import type { ReadonlyDeep } from "type-fest";
import { fileTypeFromBuffer } from "file-type";
import { extname } from "pathe";

export interface AcceptedFormat extends ReadonlyDeep<DialogFilter> {
    mime: string[];
}

export const MIME_TYPES = {
    JSON: "application/json",
} as const;

export const FILE_EXTENSIONS = {
    JSON: ["json"],
    YAML: ["yml", "yaml"],
} as const;

export function hasFormat(path: string, formats: readonly AcceptedFormat[]) {
    const extension = extname(path).slice(1).toLowerCase();

    return formats.some((format) => format.extensions.includes(extension));
}

// text formats (json, yaml) have no magic bytes: nothing detected means plain
// text, so only a detected binary type that is not accepted is rejected
export async function hasMime(
    bytes: Uint8Array,
    formats: readonly AcceptedFormat[],
) {
    const detected = await fileTypeFromBuffer(bytes);
    if (!detected) {
        return true;
    }

    return formats.some((format) => format.mime.includes(detected.mime));
}
