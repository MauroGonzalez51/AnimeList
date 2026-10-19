import { open } from "@tauri-apps/plugin-dialog";

export async function pickStoreFile() {
    const path = await open({
        filters: [{ name: "YAML", extensions: ["yml", "yaml"] }],
        multiple: false,
    });
    return path;
}

export function entryText(
    value:
        | string
        | Record<string, unknown>
        | (string | Record<string, unknown>)[],
): string {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }

                return JSON.stringify(item);
            })
            .join(", ");
    }

    return JSON.stringify(value);
}
