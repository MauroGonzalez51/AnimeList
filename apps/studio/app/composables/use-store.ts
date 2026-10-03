import type { OpenDialogOptions } from "@tauri-apps/plugin-dialog";
import { tauri } from "@/lib/tauri/commands";

const FILE_OPTIONS: OpenDialogOptions = {
    multiple: false,
    filters: [{ name: "YAML", extensions: ["yaml", "yml"] }],
    pickerMode: "document",
};

export function useStore() {
    const { $logger } = useNuxtApp();
    const storePath = useState<string | null>(
        NuxtKeys.Composables.UseStore.StorePath,
        () => null,
    );

    async function sync() {
        storePath.value = await tauri.call("get_store_status");
    }

    async function pick() {
        const { open } = await import("@tauri-apps/plugin-dialog");

        const selected = await open(FILE_OPTIONS);
        if (!selected) {
            return;
        }

        $logger.info(selected);
        storePath.value = await tauri.call("set_store_path", {
            path: selected,
        });
    }

    return { storePath, dispatch: { sync, pick } };
}
