import type { Options } from "tsup";
import process from "node:process";
import { tsconfigPathsPlugin } from "esbuild-plugin-tsconfig-paths";
import { defineConfig } from "tsup";

const ENV_VARIABLE = "ANIMEFLV_BUILD_TARGET";

const SHARED_OPTIONS: Options = {
    target: "es2020",
    clean: true,
    minify: true,
    treeshake: true,
    platform: "node",
    banner: {
        js: "#!/usr/bin/env node",
    },
};

const DEFAULT_BUILD: Options = {
    name: "default",
    entry: ["src/index.ts"],
    format: ["cjs"],
    dts: true,
    outDir: "dist",
    plugins: [tsconfigPathsPlugin()],
    ...SHARED_OPTIONS,
};

const STANDALONE_BUILD: Options = {
    name: "standalone",
    entry: ["src/index.ts"],
    format: ["cjs"],
    noExternal: [/.*/],
    outDir: "dist/standalone",
    plugins: [tsconfigPathsPlugin()],
    ...SHARED_OPTIONS,
};

const CONFIGS = [DEFAULT_BUILD, STANDALONE_BUILD];

function resolveConfig() {
    const target = process.env[ENV_VARIABLE];

    const config = CONFIGS.find(
        (config) => config.name?.toLowerCase() === target?.toLowerCase(),
    );

    if (config) {
        return config;
    }

    return CONFIGS;
}

export default defineConfig(resolveConfig());
