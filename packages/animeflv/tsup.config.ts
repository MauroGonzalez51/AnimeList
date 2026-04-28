import type { Options } from "tsup";
import { tsconfigPathsPlugin } from "esbuild-plugin-tsconfig-paths";
import { defineConfig } from "tsup";

const SHARED_OPTIONS: Options = {
    clean: true,
    minify: true,
    treeshake: true,
    platform: "node",
    banner: {
        js: "#!/usr/bin/env node",
    },
};

export default defineConfig([
    {
        name: "default",
        entry: ["src/index.ts"],
        format: ["cjs"],
        dts: true,
        outDir: "dist",
        plugins: [tsconfigPathsPlugin()],
        ...SHARED_OPTIONS,
    },
    // {
    //     name: "standalone",
    //     entry: ["src/index.ts"],
    //     format: ["cjs"],
    //     noExternal: [/.*/],
    //     outDir: "dist/standalone",
    //     plugins: [tsconfigPathsPlugin()],
    //     ...SHARED_OPTIONS,
    // },
]);
