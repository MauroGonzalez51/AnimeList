import process from "node:process";
import yars from "yargs";
import { hideBin } from "yargs/helpers";
import { exportHandler } from "@/commands/export";
import { Logger } from "@/utils/logger";

yars(hideBin(process.argv))
    .locale("en")
    .command<CLI.Commands.Export.Parameters>(
        "export",
        "export saved animes to format",
        (yargs) =>
            yargs.option("output", {
                alias: "o",
                type: "string",
                describe: "Export file path",
                default: ".output/list.json",
            }),
        exportHandler,
    )
    .option("verbose", {
        alias: "v",
        type: "boolean",
        describe: "Enable verbose logging",
    })
    .middleware((argv) => {
        Logger.getInstance(argv.verbose ?? false);
    })
    .help()
    .parse();
