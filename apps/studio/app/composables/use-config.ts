import type { Get, Paths } from "type-fest";
import type { z } from "zod";
import type { Config } from "@/lib/tauri";
import { set } from "es-toolkit/compat";
import { toast } from "vue-sonner";
import { tauri } from "@/lib/tauri";

type _Config = z.infer<typeof Config>;

interface PatchOptions {
    autoSave?: boolean;
}

export default function () {
    const {
        $logger,
        $i18n: { t },
    } = useNuxtApp();

    const state = useState<_Config | null>(
        NuxtKeys.Composables.UseConfig.State,
        () => null,
    );

    function init() {
        tauri
            .call("get_config")
            .then((config) => (state.value = config))
            .catch((error) => {
                $logger.error(error);
                toast.error(t("exceptions.config.load.title"));
            });
    }

    async function save(config = state.value) {
        if (!config) {
            return;
        }

        tauri
            .call("save_config", { config })
            .then((config) => {
                state.value = config;
                toast(t("actions.config.save.title"));
            })
            .catch((error) => {
                $logger.error(error);
                toast.error(t("exceptions.config.save.title"), {
                    description: t("exceptions.config.save.description"),
                });
            });
    }

    async function patch<P extends Paths<_Config>, V extends Get<_Config, P>>(
        path: P,
        value: V,
        options: PatchOptions = { autoSave: true },
    ) {
        if (!state.value) {
            return;
        }

        const next = set({ ...state.value }, path, value);
        if (options.autoSave) {
            await save(next);
            return;
        }

        state.value = next;
    }

    return { state, dispatch: { init, save, patch } };
}
