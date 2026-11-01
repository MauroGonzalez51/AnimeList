import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import { format } from "prettier/standalone";

export function formatJson(text: string) {
    return format(text, {
        parser: "json",
        plugins: [babelPlugin, estreePlugin],
        tabWidth: 4,
    });
}
