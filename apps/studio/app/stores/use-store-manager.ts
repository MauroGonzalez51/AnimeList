import type { Meta } from "@animelist/packages-schema";
import type { DistributedOmit, Get, Paths } from "type-fest";
import type { FlatEntry } from "@/lib/schema";
import { set } from "es-toolkit/compat";
import {
    flattenEntries,
    performWrite,
    pickStoreFile,
    readStoreContent,
} from "@/lib/schema";

type PatchedFlatEntry = DistributedOmit<
    FlatEntry,
    "id" | "_isGeneratedId" | "_source" | "style"
>;

export const useStoreManager = defineStore(NuxtKeys.Stores.StoreManager, () => {
    const { $logger } = useNuxtApp();
    const config = useConfig();

    const meta = ref<Meta | undefined>(undefined);
    const entries = ref<FlatEntry[] | undefined>(undefined);
    const entriesMap = shallowReactive<Map<FlatEntry["id"], FlatEntry>>(
        new Map<string, FlatEntry>(),
    );

    async function process(path: string) {
        const data = (await readStoreContent(path, { logger: $logger })).match(
            (content) => content,
            (error) => {
                $logger.error(error);
                return null;
            },
        );

        if (!data || !data.entries) {
            return null;
        }

        return {
            meta: data.meta,
            entries: flattenEntries(data.entries, { style: true }),
        };
    }

    async function pick() {
        const path = await pickStoreFile();
        if (!path) {
            return;
        }

        config.dispatch.patch("store_path", path);
    }

    async function clear() {
        if (config.state.value?.store_path) {
            config.dispatch.patch("store_path", null);
        }
    }

    async function patchEntry<
        Path extends Paths<PatchedFlatEntry>,
        Value extends Get<PatchedFlatEntry, Path>,
    >(id: FlatEntry["id"], path: Path, value: Value) {
        const entry = entriesMap.get(id);
        if (!entry) {
            return;
        }

        set(entry, path, value);

        if (config.state.value?.store_path && meta.value) {
            performWrite({
                path: config.state.value.store_path,
                data: { meta: meta.value, entries: entriesMap },
            });
        }
    }

    watch(
        entries,
        (newEntries) => {
            entriesMap.clear();

            if (!newEntries) {
                return;
            }

            for (let i = 0; i < newEntries.length; i++) {
                const entry = newEntries[i];

                if (!entry) {
                    continue;
                }

                entriesMap.set(entry.id, entry);
            }
        },
        { immediate: true },
    );

    return {
        meta,
        entries,
        entriesMap,
        dispatch: { pick, clear, process, patchEntry },
    };
});
