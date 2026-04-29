import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { progress } from "@clack/prompts";
import pLimit from "p-limit";
import { z } from "zod";
import { AnimeFLV, Puppeteer, SELECTORS } from "@/core";
import { delay, Logger } from "@/utils/";

interface AnimeEpisode {
    index: string;
    watched: boolean;
}

interface AnimeReport {
    label: string;
    url: string;
    episodes: AnimeEpisode[];
}

const Schema = z.object({
    to: z.url(),
    label: z.string(),
});

export async function scrapeHandler(
    args: CLI.ResolveParameters<
        CLI.Commands.BrowserOptions & CLI.Commands.Scrape.Parameters
    >,
) {
    const logger = Logger.getInstance();

    logger.info("parsing input file");
    const input = await readFile(resolve(args.input), "utf-8");
    const parsed = z.array(Schema).safeParse(JSON.parse(input));

    if (!parsed.success) {
        logger.error("invalid input format");
        logger.error(parsed.error.message);
        process.exit(1);
    }

    const puppeteer = await Puppeteer.new({
        executablePath: args.browser ?? "",
        headless: args.headless,
    });

    try {
        (await AnimeFLV.login(puppeteer)).match(
            () => {
                logger.info("login succesfull");
            },
            (err) => {
                logger.error(err);
                process.exit(1);
            },
        );

        await delay(1000);

        async function processSingle(
            entry: z.infer<typeof Schema>,
        ): Promise<AnimeReport> {
            const page = await puppeteer.createPage();
            try {
                await page.goto(entry.to);

                await page.waitForSelector(
                    SELECTORS.ANIME_PAGE.EPISODES_CONTAINER,
                );

                await page.evaluate(async (selector) => {
                    const element = document.querySelector(selector);
                    if (!(element instanceof HTMLElement)) {
                        return;
                    }

                    let previousHeight = 0;
                    while (element.scrollHeight !== previousHeight) {
                        previousHeight = element.scrollHeight;
                        element.scrollTop = element.scrollHeight;
                        await new Promise((resolve) =>
                            setTimeout(resolve, 300),
                        );
                    }
                }, SELECTORS.ANIME_PAGE.EPISODES_CONTAINER);

                const episodes: AnimeEpisode[] = [];

                const animeEpisodes = await page.$$(
                    SELECTORS.ANIME_PAGE.EPISODE_ITEM,
                );
                for (const episode of animeEpisodes) {
                    const index = await episode.$(
                        SELECTORS.ANIME_PAGE.EPISODE_INDEX,
                    );
                    const status = await episode.$(
                        SELECTORS.ANIME_PAGE.EPISODE_STATUS,
                    );

                    if (!index || !status) {
                        continue;
                    }

                    const episodeIndex = await index.evaluate((element) =>
                        element.textContent.trim(),
                    );

                    const watched = await status.evaluate((input) => {
                        if (!(input instanceof HTMLInputElement)) {
                            return false;
                        }

                        return input.checked;
                    });

                    episodes.push({ index: episodeIndex, watched });
                }

                return { label: entry.label, url: entry.to, episodes };
            } finally {
                await page.close();
            }
        }

        const limit = pLimit({ concurrency: 3 });

        const bar = progress({ max: parsed.data.length, style: "heavy" });
        bar.start("Starting");
        const results = await Promise.all(
            parsed.data.map((entry) =>
                limit(async () => {
                    try {
                        const data = await processSingle(entry);
                        bar.advance(1, `Done: ${entry.label}`);

                        return { entry, data, error: undefined };
                    } catch (error) {
                        if (error instanceof Error) {
                            logger.warn(
                                `failed to scrape: ${entry.label} - ${error.message}`,
                            );
                        }

                        bar.advance(1, `Failed: ${entry.label}`);
                        return { entry, data: null, error };
                    }
                }),
            ),
        );
        bar.stop("Done");

        const report = results
            .filter((r) => r.data !== null)
            .map((r) => r.data);

        const failed = results
            .filter((r) => r.data === null)
            .map((r) => ({
                label: r.entry.label,
                url: r.entry.to,
                error: r.error,
            }));

        await mkdir(dirname(args.output), { recursive: true });
        await writeFile(args.output, JSON.stringify(report, null, 2), {
            encoding: "utf-8",
        });

        if (failed.length > 0) {
            const path = resolve(dirname(args.output), "failed.json");
            await writeFile(path, JSON.stringify(failed, null, 2), {
                encoding: "utf-8",
            });
            logger.info(`${failed.length} failed entries saved to ${path}`);
        }
    } finally {
        await puppeteer.terminate();
    }

    logger.info(`list saved to ${args.output}`);
}
