import { WRITE_QUEUE } from "@/lib/schema";

export default defineNuxtPlugin({
    name: "on-init",
    dependsOn: ["logger"],
    async setup(nuxtApp) {
        const config = useConfig();

        const manager = useStoreManager();
        const { entries } = storeToRefs(manager);

        if (import.meta.client) {
            config.dispatch.init();

            watch(
                () => config.state.value?.store_path,
                async (path) => {
                    if (!path) {
                        entries.value = undefined;
                        return;
                    }

                    await manager.dispatch.reload();
                },
                { immediate: true },
            );

            WRITE_QUEUE.addEventListener("error", (error) => {
                nuxtApp.$logger.error(error);
            });
        }
    },
});
