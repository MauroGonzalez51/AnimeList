import type { RouteLocationRaw } from "vue-router";

export function useCallbackUrl(fallback: RouteLocationRaw = "/") {
    const config = useAppConfig();

    const { $localePath } = useNuxtApp();
    const route = useRoute();
    const router = useRouter();

    const callbackUrl = useRouteQuery(
        config.constants.query.CALLBACK_QUERY,
        undefined,
        {
            transform(value: string) {
                if (!value) {
                    return $localePath(fallback);
                }

                try {
                    const url = new URL(value.toString(), "https://internal");
                    return url.pathname + url.search + url.hash;
                } catch {
                    if (value.startsWith("/")) {
                        return value;
                    }

                    return $localePath(fallback);
                }
            },
        },
    );

    function cleanPath(path: string): string {
        try {
            const url = new URL(path, "https://internal");
            url.searchParams.delete(config.constants.query.CALLBACK_QUERY);

            return url.pathname + url.search + url.hash;
        } catch {
            return path;
        }
    }

    return {
        callbackUrl,
        navigate: () => {
            if (route.query[config.constants.query.CALLBACK_QUERY]) {
                return navigateTo(callbackUrl.value);
            }

            return router.back();
        },
        insertCallback: (
            path: RouteLocationRaw = route.fullPath,
            mode: "preserve" | "override" = "preserve",
        ) => {
            const cleanedPath = cleanPath(path.toString());

            if (mode === "preserve") {
                const currentCallback =
                    route.query[config.constants.query.CALLBACK_QUERY];
                return {
                    [config.constants.query.CALLBACK_QUERY]:
                        currentCallback || cleanedPath,
                };
            }

            if (mode === "override") {
                return {
                    [config.constants.query.CALLBACK_QUERY]: cleanedPath,
                };
            }
        },
    };
}
