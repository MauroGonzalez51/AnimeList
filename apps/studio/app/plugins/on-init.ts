import { WRITE_QUEUE } from "@/lib/schema";

export default defineNuxtPlugin({
    name: "on-init",
    dependsOn: ["logger"],
    async setup(nuxtApp) {
        const config = useConfig();

        const manager = useStoreManager();
        const { meta, entries } = storeToRefs(manager);

        if (import.meta.client) {
            config.dispatch.init();

            watch(
                () => config.state.value?.store_path,
                async (path) => {
                    if (!path) {
                        entries.value = undefined;
                        return;
                    }

                    const data = await manager.dispatch.process(path);
                    if (data) {
                        meta.value = data.meta;
                        entries.value = data.entries;
                    }
                },
                { immediate: true },
            );

            WRITE_QUEUE.addEventListener("error", (error) => {
                nuxtApp.$logger.error(error);
            });
        }
    },
});
