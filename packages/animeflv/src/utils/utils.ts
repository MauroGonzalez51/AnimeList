import type { Result } from "neverthrow";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname } from "node:path";
import { err, ok } from "neverthrow";
import TOML from "smol-toml";
import YAML from "yaml";
import { OutputFormat, ParseFileError } from "@/core";

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function writeTo<T>(
    path: string,
    content: T,
    options: { format: OutputFormat },
) {
    await mkdir(dirname(path), { recursive: true });

    if (options.format === OutputFormat.JSON) {
        await writeFile(path, JSON.stringify(content, null, 2), {
            encoding: "utf-8",
        });
        return;
    }

    if (options.format === OutputFormat.YAML) {
        await writeFile(path, YAML.stringify(content, { indent: 2 }), {
            encoding: "utf8",
        });
        return;
    }

    if (options.format === OutputFormat.TOML) {
        await writeFile(path, TOML.stringify(content), { encoding: "utf-8" });
    }
}

type Parser = (content: string) => unknown;

const PARSERS: Record<string, Parser> = {
    json: (c) => JSON.parse(c),
    yaml: (c) => YAML.parse(c),
    yml: (c) => YAML.parse(c),
    toml: (c) => TOML.parse(c),
};

export async function readFrom<T = unknown>(
    path: string,
): Promise<Result<T, ParseFileError>> {
    const content = await readFile(path, { encoding: "utf-8" });
    const ext = extname(path).slice(1).toLowerCase();

    const knownParser = PARSERS[ext];
    if (knownParser) {
        try {
            return ok(knownParser(content) as T);
        } catch {
            return err(new ParseFileError(path));
        }
    }

    for (const parser of Object.values(PARSERS)) {
        try {
            return ok(parser(content) as T);
        } catch {}
    }

    return err(new ParseFileError(path));
}
