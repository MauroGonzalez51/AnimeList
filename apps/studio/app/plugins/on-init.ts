export default defineNuxtPlugin({
    name: "on-init",
    dependsOn: ["logger"],
    async setup() {
        const config = useConfig();
        if (import.meta.client) {
            config.dispatch.init();
        }
    },
});
