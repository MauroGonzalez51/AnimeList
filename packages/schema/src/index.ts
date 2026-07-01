import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { saveSchema } from "@/schema";

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
