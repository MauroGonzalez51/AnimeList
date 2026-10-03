export default defineNuxtPlugin({
    name: "on-init",
    dependsOn: ["logger"],
    async setup(nuxtApp) {
        if (import.meta.client) {
            const store = useStore();
            await store.dispatch
                .sync()
                .catch((error) => nuxtApp.$logger.error(error));
        }
    },
});
