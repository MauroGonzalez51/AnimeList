#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { JSONSchema } from "@/schema";

async function saveSchema(path: string): Promise<void> {
    await mkdir(dirname(path), { recursive: true });

    const schema = JSONSchema.toJSONSchema({ reused: "ref" });

    await writeFile(path, JSON.stringify(schema, null, 4), "utf-8");
}

yargs(hideBin(process.argv))
    .locale("en")
    .command(
        "save <path>",
        "save schema to given path",
        (yargs) =>
            yargs.positional("path", {
                describe: "path to saved file",
                type: "string",
                demandOption: true,
            }),
        (args) => saveSchema(args.path),
    )
    .help()
    .parse();
