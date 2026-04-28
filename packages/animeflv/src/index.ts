import process from "node:process";
import yars from "yargs";
import { hideBin } from "yargs/helpers";
import { exportHandler, scrapeHandler } from "@/commands";
import { Logger } from "@/utils/logger";

yars(hideBin(process.argv))
    .locale("en")
    .command<CLI.Commands.Export.Parameters>(
        "export",
        "export saved animes to format",
        (yargs) =>
            yargs
                .option("browser", {
                    alias: "b",
                    type: "string",
                    describe: "browser executable path to use",
                })
                .option("output", {
                    alias: "o",
                    type: "string",
                    describe: "exported file path",
                    default: ".output/list.json",
                }),
        exportHandler,
    )
    .command<CLI.Commands.Scrape.Parameters>(
        "scrape",
        "scrape animeflv based on saved list",
        (yargs) =>
            yargs
                .option("input", {
                    alias: "i",
                    type: "string",
                    describe: "generated list",
                    demandOption: true,
                })
                .option("output", {
                    alias: "o",
                    type: "string",
                    describe: "exported file path",
                    default: ".output/scraped.json",
                }),
        scrapeHandler,
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
