import type { z } from "zod";
import type { Config } from "@/lib/tauri";
import { toast } from "vue-sonner";
import { tauri } from "@/lib/tauri";

type _Config = z.infer<typeof Config>;

export default function () {
    const { $logger } = useNuxtApp();
    const state = useState<_Config | null>(
        NuxtKeys.Composables.UseConfig.State,
        () => null,
    );

    function init() {
        tauri
            .call("get_config")
            .then((_) => (state.value = _))
            .catch((error) => {
                $logger.error(error);
                toast.error($t("exceptions.config.load.title"));
            });
    }

    function save() {
        tauri
            .call("save_config", { config: state.value })
            .then(() => toast($t("actions.config.save.title")))
            .catch((error) => {
                $logger.error(error);
                toast.error($t("exceptions.config.save.title"), {
                    description: $t("exceptions.config.save.description"),
                });
            });
    }

    return { state, dispatch: { init, save } };
}
