import type { Meta, Store } from "@animelist/packages-schema";
import type { FlatEntry } from "@/lib/schema/types";
import { writeFile } from "@tauri-apps/plugin-fs";
import prettier from "prettier";
import Queue from "queue";
import { stringify } from "yaml";
import { unflattenEntries } from "@/lib/schema/process";

interface Args {
    data: {
        meta: Meta;
        entries: Map<FlatEntry["id"], FlatEntry>;
    };
    path: string;
}

export const WRITE_QUEUE = new Queue({ concurrency: 1, autostart: true });

export function performWrite(args: Args) {
    WRITE_QUEUE.push(async () => {
        const entries = unflattenEntries(args.data.entries);

        const storeData: Store = {
            meta: args.data.meta,
            entries,
        };

        const content = await prettier.format(stringify(storeData), {
            parser: "yaml",
            arrowParens: "always",
            bracketSameLine: false,
            bracketSpacing: true,
            semi: true,
            experimentalTernaries: false,
            singleQuote: false,
            jsxSingleQuote: false,
            quoteProps: "as-needed",
            trailingComma: "all",
            singleAttributePerLine: false,
            htmlWhitespaceSensitivity: "css",
            vueIndentScriptAndStyle: true,
            proseWrap: "preserve",
            insertPragma: false,
            printWidth: 80,
            requirePragma: false,
            tabWidth: 4,
            useTabs: false,
            embeddedLanguageFormatting: "auto",
        });

        const encoder = new TextEncoder();
        await writeFile(args.path, encoder.encode(content));

        return args.path;
    });
}
