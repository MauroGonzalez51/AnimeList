import type { Get, Paths } from "type-fest";
import type { z } from "zod";
import type { Config } from "@/lib/tauri";
import { set } from "es-toolkit/compat";
import { toast } from "vue-sonner";
import { tauri } from "@/lib/tauri";

type _Config = z.infer<typeof Config>;

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

    function save() {
        if (!state.value) {
            return;
        }

        tauri
            .call("save_config", { config: state.value })
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

    function patch<P extends Paths<_Config>, V extends Get<_Config, P>>(
        path: P,
        value: V,
    ) {
        if (!state.value) {
            return;
        }

        set(state.value, path, value);
        save();
    }

    return { state, dispatch: { init, save, patch } };
}
