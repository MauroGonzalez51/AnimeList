import type { Argv, Options } from "yargs";
import process from "node:process";
import { pipe } from "effect";
import yars from "yargs";
import { hideBin } from "yargs/helpers";
import { exportHandler, scrapeHandler } from "@/commands";
import { OutputFormat } from "@/core/constants";
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

function OUTPUT_OPTIONS(yargs: Argv, options?: Options) {
    return yargs
        .option("output", {
            ...options,
            alias: "o",
            type: "string",
            describe: "exported file path",
        })
        .option("format", {
            type: "string",
            choices: Object.values(OutputFormat),
            default: OutputFormat.JSON,
            describe: "format to export",
        });
}

yars(hideBin(process.argv))
    .locale("en")
    .command<
        CLI.Commands.BrowserOptions &
            CLI.Commands.OutputOptions &
            CLI.Commands.Export.Parameters
    >(
        "export",
        "export saved animes to format",
        (instance) =>
            pipe(instance, BROWSER_OPTIONS, (_) =>
                OUTPUT_OPTIONS(_, { default: "list.json" }),
            ),
        exportHandler,
    )
    .command<
        CLI.Commands.BrowserOptions &
            CLI.Commands.OutputOptions &
            CLI.Commands.Scrape.Parameters
    >(
        "scrape",
        "scrape animeflv based on saved list",
        (instance) =>
            pipe(
                instance,
                BROWSER_OPTIONS,
                (yargs) =>
                    yargs.option("input", {
                        alias: "i",
                        type: "string",
                        describe: "generated list",
                        demandOption: true,
                    }),
                (_) => OUTPUT_OPTIONS(_, { default: "scraped.json" }),
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
