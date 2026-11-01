import type { AcceptedFormat } from "@/lib/file";
import { FILE_EXTENSIONS, MIME_TYPES } from "@/lib/file";

export const SOURCE_FILTER: AcceptedFormat[] = [
    {
        name: "JSON",
        extensions: FILE_EXTENSIONS.JSON,
        mime: [MIME_TYPES.JSON],
    },
];
