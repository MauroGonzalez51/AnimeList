export default defineNuxtPlugin({
    name: "on-init",
    dependsOn: ["logger"],
    async setup() {
        const config = useConfig();
        const manager = useStoreManager();

        if (import.meta.client) {
            config.dispatch.init();

            watch(
                () => config.state.value?.store_path,
                async (path) => {
                    if (!path) {
                        manager.entries.value = undefined;
                        return;
                    }

                    const entries = await manager.dispatch.process(path);
                    if (entries) {
                        manager.entries.value = entries;
                    }
                },
                { immediate: true },
            );
        }
    },
});
