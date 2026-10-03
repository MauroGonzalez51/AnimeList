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
            "app/composables/**/!(*test|*.spec).{ts,js,mjs,mts}",
            "app/utils/**/!(*test|*.spec).{ts,js,mjs,mts}",
            "shared/utils/**/!(*test|*.spec).{ts,js,mjs,mts}",
        ],
    },
    modules: [
        "@nuxt/eslint",
        "@nuxtjs/color-mode",
        "nuxt-lucide-icons",
        "@vueuse/nuxt",
        "shadcn-nuxt",
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
});
