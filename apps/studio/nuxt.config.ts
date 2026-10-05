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
    ],

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
            redirectOn: "no prefix",
            fallbackLocale: "en",
            alwaysRedirect: true,
        },
        customRoutes: "meta",
        defaultLocale: "en",
        strategy: "prefix",
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
});
