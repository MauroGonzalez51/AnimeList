import type { FlatEntry } from "@/lib/schema";
import { StoreManager } from "@/lib/schema";

export default function () {
    const { $logger } = useNuxtApp();
    const config = useConfig();

    const entries = useState<FlatEntry[] | null>(
        NuxtKeys.Composables.UseStoreManager.Content,
        () => null,
    );

    const entriesMap = shallowReactive<Map<string, FlatEntry>>(
        new Map<string, FlatEntry>(),
    );

    async function _process(path: string) {
        const data = (
            await StoreManager.readContent(path, { logger: $logger })
        ).match(
            (content) => content,
            (error) => {
                $logger.error(error);
                return null;
            },
        );

        if (!data || !data.entries) {
            return null;
        }

        return StoreManager.flatten(data.entries);
    }

    async function pick() {
        const path = await StoreManager.pick();
        if (!path) {
            return;
        }

        config.dispatch.patch("store_path", path);

        const _entries = await _process(path);
        if (_entries) {
            entries.value = _entries;
        }
    }

    async function clear() {
        config.dispatch.patch("store_path", null);
    }

    watch(
        () => config.state.value?.store_path,
        async (path) => {
            if (!path) {
                entries.value = null;
                return;
            }

            const _entries = await _process(path);
            if (_entries) {
                entries.value = _entries;
            }
        },
        { immediate: true },
    );

    watch(
        entries,
        (newEntries) => {
            if (!newEntries) {
                return;
            }

            entriesMap.clear();

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

    return { entries, entriesMap, dispatch: { pick, clear } };
}
