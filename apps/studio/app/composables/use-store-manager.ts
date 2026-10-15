import type { FlatEntry } from "@/lib/schema";
import { flattenEntries, pickStoreFile, readStoreContent } from "@/lib/schema";

export default function () {
    const { $logger } = useNuxtApp();
    const config = useConfig();

    const entries = useState<FlatEntry[] | undefined>(
        NuxtKeys.Composables.UseStoreManager.Content,
        () => undefined,
    );
    const entriesMap = shallowReactive<Map<string, FlatEntry>>(
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

        return flattenEntries(data.entries, { style: true });
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

    return { entries, entriesMap, dispatch: { pick, clear, process } };
}
