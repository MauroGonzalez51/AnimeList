import { readFile } from "@tauri-apps/plugin-fs";
import { hasMime } from "~/lib/file";
import { SOURCE_FILTER } from "~/lib/migrator";

export const useMigratorManager = defineStore(
    NuxtKeys.Stores.MigratorManager,
    () => {
        const { $logger } = useNuxtApp();

        const filePath = ref<string | undefined>(undefined);
        const content = ref<unknown | undefined>(undefined);

        async function load(path: string) {
            try {
                const bytes = await readFile(await resolvePath(path));
                if (!(await hasMime(bytes, SOURCE_FILTER))) {
                    $logger.error(`unacepted file format: ${path}`);
                    return false;
                }

                content.value = JSON.parse(new TextDecoder().decode(bytes));
                filePath.value = path;

                return true;
            } catch (error: unknown) {
                $logger.error(error);
                return false;
            }
        }

        return {
            filePath,
            content,
            dispatch: {
                load,
            },
        };
    },
);
