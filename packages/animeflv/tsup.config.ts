import { tsconfigPathsPlugin } from "esbuild-plugin-tsconfig-paths";
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    clean: true,
    dts: true,
    format: ["cjs"],
    minify: true,
    treeshake: true,
    outDir: "dist",
    plugins: [tsconfigPathsPlugin()],
});
