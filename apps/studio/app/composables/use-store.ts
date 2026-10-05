import type { Entry, JSONSchema } from "@animelist/packages-schema";
import type { OpenDialogOptions } from "@tauri-apps/plugin-dialog";
import type { z } from "zod";
import { basename } from "pathe";
import Queue from "queue";
import { toRaw } from "vue";
import { tauri } from "@/lib/tauri/commands";
import { isReadableEntry, isWatchableEntry } from "@/utils/store";

const FILE_OPTIONS: OpenDialogOptions = {
    multiple: false,
    filters: [{ name: "YAML", extensions: ["yaml", "yml"] }],
    pickerMode: "document",
};

const writeQueue = new Queue({
    autostart: true,
    concurrency: 1,
});

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

    function findEntry(
        entries: Entry[] | undefined,
        target: Entry,
    ): Entry | undefined {
        if (!entries) {
            return;
        }

        for (const entry of entries) {
            if (entry === target) {
                return entry;
            }

            const child = findEntry(entry.children, target);
            if (child) {
                return child;
            }

            const related = findEntry(entry.related, target);
            if (related) {
                return related;
            }
        }
    }

    function toggleFavorite(entry: Entry) {
        if (!store.value?.entries || entry.kind === "universe") {
            return;
        }

        const current = findEntry(store.value.entries, entry);
        if (!current) {
            return;
        }

        if (isReadableEntry(current)) {
            current.status = {
                ...current.status,
                favorite: !current.status?.favorite,
            };
        }

        if (isWatchableEntry(current)) {
            current.status = {
                ...current.status,
                favorite: !current.status?.favorite,
            };
        }

        const snapshot = structuredClone(toRaw(store.value));
        writeQueue.push(async () => {
            try {
                await tauri.call("save_schema", { schema: snapshot });
                store.value = await tauri.call("query_schema");
            } catch (error) {
                $logger.error(error);
                try {
                    store.value = await tauri.call("query_schema");
                } catch (syncError) {
                    $logger.error(syncError);
                }
            }
        });
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

    return {
        storePath,
        storeFileName,
        store,
        dispatch: { sync, pick, clear, operation: { toggleFavorite } },
    };
}
