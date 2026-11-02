import type { MigratorStatus } from "~/lib/migrator";
import { readFile } from "@tauri-apps/plugin-fs";
import { hasMime } from "~/lib/file";
import {
    arrayKeys,
    isPending,
    persistSource,
    resolveEntries,
    SOURCE_FILTER,
    STATUS_KEY,
} from "~/lib/migrator";

export const useMigratorManager = defineStore(
    NuxtKeys.Stores.MigratorManager,
    () => {
        const { $logger } = useNuxtApp();

        const filePath = ref<string | undefined>(undefined);
        const content = ref<unknown | undefined>(undefined);
        const collectionKey = ref<string | undefined>(undefined);
        const targetId = ref<string | undefined>(undefined);

        const loaded = computed(() => content.value !== undefined);
        const keys = computed(() => arrayKeys(content.value));
        const entries = computed(() =>
            resolveEntries(content.value, collectionKey.value),
        );
        const pending = computed(() =>
            entries.value.filter((entry) => isPending(entry.record)),
        );
        const current = computed(() => pending.value[0]);

        async function load(path: string) {
            try {
                const bytes = await readFile(await resolvePath(path));
                if (!(await hasMime(bytes, SOURCE_FILTER))) {
                    $logger.error(new Error(`unaccepted file type: ${path}`));
                    return false;
                }

                content.value = JSON.parse(new TextDecoder().decode(bytes));
                filePath.value = path;
                collectionKey.value = undefined;

                return true;
            } catch (error: unknown) {
                $logger.error(error);
                return false;
            }
        }

        function select(key: string) {
            collectionKey.value = key;
        }

        function pick(id: string) {
            targetId.value = id;
        }

        function mark(status: MigratorStatus) {
            const entry = current.value;
            if (!entry || !filePath.value) {
                return;
            }

            entry.record[STATUS_KEY] = status;
            persistSource(filePath.value, content.value);
        }

        function resolve() {
            mark("resolved");
        }

        function skip() {
            mark("skipped");
        }

        return {
            filePath,
            content,
            collectionKey,
            targetId,
            loaded,
            keys,
            entries,
            pending,
            current,
            dispach: {
                load,
                select,
                pick,
                resolve,
                skip,
            },
        };
    },
);
