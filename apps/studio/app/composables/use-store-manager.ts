import type { FlatEntry } from "@/lib/schema";
import { StoreManager } from "@/lib/schema";

export default function () {
    const { $logger } = useNuxtApp();
    const config = useConfig();

    const entries = useState<FlatEntry[] | null>(
        NuxtKeys.Composables.UseStoreManager.Content,
        () => null,
    );

    function pick() {}

    watch(
        () => config.state.value?.store_path,
        async (path) => {
            if (!path) {
                return;
            }

            const data = (
                await StoreManager.readContent(path, { logger: $logger })
            ).match(
                (_) => _,
                (error) => {
                    $logger.error(error);
                    return null;
                },
            );

            if (!data) {
                return;
            }

            if (data.entries) {
                entries.value = StoreManager.flatten(data.entries);
            }
        },
        { immediate: true },
    );

    return { entries, dispatch: { pick } };
}
