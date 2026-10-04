import type { JSONSchema } from "@animelist/packages-schema";
import type { OpenDialogOptions } from "@tauri-apps/plugin-dialog";
import type { z } from "zod";
import { basename } from "pathe";
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

    const storeFileName = computed(() => {
        if (!storePath.value) {
            return;
        }

        return basename(storePath.value);
    });

    const store = useState<z.infer<typeof JSONSchema> | undefined>(
        NuxtKeys.Composables.UseStore.Store,
        () => undefined,
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

    async function clear() {
        await tauri.call("clear_store_path");
        await sync();
        store.value = undefined;
    }

    watch(
        storePath,
        async () => {
            if (storePath.value) {
                store.value = await tauri.call("query_schema");
            }
        },
        { immediate: true },
    );

    return { storePath, storeFileName, store, dispatch: { sync, pick, clear } };
}
