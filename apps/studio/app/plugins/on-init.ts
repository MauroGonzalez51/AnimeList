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

                    const data = await manager.dispatch.process(path);
                    if (data) {
                        manager.meta.value = data.meta;
                        manager.entries.value = data.entries;
                    }
                },
                { immediate: true },
            );
        }
    },
});
