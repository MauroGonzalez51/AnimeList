import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts", "src/cli.ts"],
    outDir: "dist",
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    target: false,
    outExtensions({ format }) {
        if (format === "es") {
            return {
                js: ".mjs",
                dts: ".d.mts",
            };
        }

        if (format === "cjs") {
            return {
                js: ".cjs",
                dts: ".d.cts",
            };
        }

        return {
            js: ".js",
            dts: ".d.ts",
        };
    },
});
