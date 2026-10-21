export default defineNuxtRouteMiddleware(async () => {
    const { $localeRoute } = useNuxtApp();

    if (!import.meta.dev) {
        return await navigateTo($localeRoute({ name: "index" }));
    }
});
