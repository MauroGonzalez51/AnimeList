import { open } from "@tauri-apps/plugin-dialog";

export async function pickStoreFile() {
    const path = await open({
        filters: [{ name: "YAML", extensions: ["yml", "yaml"] }],
        multiple: false,
    });
    return path;
}
