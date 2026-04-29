import type { Argv } from "yargs";
import process from "node:process";
import { pipe } from "effect";
import yars from "yargs";
import { hideBin } from "yargs/helpers";
import { exportHandler, scrapeHandler } from "@/commands";
import { Logger } from "@/utils/logger";

function BROWSER_OPTIONS(yargs: Argv) {
    return yargs
        .option("browser", {
            alias: "b",
            type: "string",
            describe: "browser executable path to use",
        })
        .option("headless", {
            type: "boolean",
            default: false,
            describe: "run browser in headless mode",
        });
}

yars(hideBin(process.argv))
    .locale("en")
    .command<CLI.Commands.BrowserOptions & CLI.Commands.Export.Parameters>(
        "export",
        "export saved animes to format",
        (instance) =>
            pipe(instance, BROWSER_OPTIONS, (yargs) =>
                yargs.option("output", {
                    alias: "o",
                    type: "string",
                    describe: "exported file path",
                    default: ".output/list.json",
                }),
            ),
        exportHandler,
    )
    .command<CLI.Commands.BrowserOptions & CLI.Commands.Scrape.Parameters>(
        "scrape",
        "scrape animeflv based on saved list",
        (instance) =>
            pipe(instance, BROWSER_OPTIONS, (yargs) =>
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
            ),
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
