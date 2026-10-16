import process from "node:process";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    ssr: false,

    devServer: {
        host: "0",
    },

    ///////////////////////////////////////////////////////
    // VITE
    ///////////////////////////////////////////////////////
    css: ["~/assets/css/tailwind.css"],
    vite: {
        clearScreen: false,
        envPrefix: ["VITE_", "TAURI_"],
        server: {
            strictPort: true,
            hmr: {
                overlay: false,
            },
        },
        plugins: [tailwindcss()],
        optimizeDeps: {
            include: [
                "@lucide/vue",
                "@tauri-apps/api/core",
                "@tauri-apps/api/path",
                "@tauri-apps/plugin-dialog",
                "@tauri-apps/plugin-fs",
                "class-variance-authority",
                "clsx",
                "es-toolkit/compat",
                "gsap",
                "memoize",
                "neverthrow",
                "quick-lru",
                "reka-ui",
                "tailwind-merge",
                "temporal-polyfill",
                "ulidx",
                "yaml",
                "zod",
                "prettier",
                "queue",
                "prettier/plugins/yaml",
                "prettier/standalone",
            ],
        },
    },

    ignore: ["**/src-tauri/**"],

    ///////////////////////////////////////////////////////
    // NUXT
    ///////////////////////////////////////////////////////
    imports: {
        dirs: [
            "~/composables/**/!(*test|*.spec).{ts,js,mjs,mts}",
            "~/utils/**/!(*test|*.spec).{ts,js,mjs,mts}",
            "~~/shared/utils/**/!(*test|*.spec).{ts,js,mjs,mts}",
        ],
    },
    components: [
        { path: "~/components/", extensions: [".vue"] },
        {
            path: "~/components/shared",
            pathPrefix: false,
            extensions: ["vue"],
        },
        {
            path: "~/components/domain",
            pathPrefix: false,
            extensions: ["vue"],
        },
    ],
    modules: [
        "@nuxt/eslint",
        "@nuxtjs/color-mode",
        "nuxt-lucide-icons",
        "@vueuse/nuxt",
        "shadcn-nuxt",
        "@nuxtjs/i18n",
        "@nuxt/image",
        "vue-sonner/nuxt",
        "@pinia/nuxt",
    ],
    router: {
        options: {
            hashMode: true,
        },
    },
    runtimeConfig: {
        public: {
            // WebKitGTK breaks view transitions when compositing is disabled
            disableViewTransitions:
                process.env.WEBKIT_DISABLE_COMPOSITING_MODE === "1",
        },
    },

    ///////////////////////////////////////////////////////
    // MODULES CONFIG
    ///////////////////////////////////////////////////////
    eslint: {
        config: {
            standalone: false,
        },
    },
    colorMode: {
        classSuffix: "",
    },
    shadcn: {
        prefix: "",
    },
    i18n: {
        skipSettingLocaleOnNavigate: true,
        detectBrowserLanguage: {
            useCookie: true,
            alwaysRedirect: false,
            fallbackLocale: "en",
        },
        customRoutes: "meta",
        defaultLocale: "en",
        strategy: "no_prefix",
        locales: [
            {
                code: "en",
                language: "en-US",
                file: "en.json",
                name: "English",
            },
        ],
        autoDeclare: true,
    },
    image: {
        provider: "none",
    },
});
