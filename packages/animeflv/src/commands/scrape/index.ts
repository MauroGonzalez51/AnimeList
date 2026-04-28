import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { password, text } from "@clack/prompts";
import { z } from "zod";
import { Puppeteer } from "@/core/puppeteer";
import { SELECTORS } from "@/core/selectors";
import { Logger } from "@/utils/logger";
import { delay } from "@/utils/utils";

enum EpisodeStatus {
    Watched = "VISTO",
    NotWatched = "NO VISTO",
}

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

function parseWatched(value: string): boolean {
    const normalized = value.trim();

    if (normalized === EpisodeStatus.Watched) {
        return true;
    }

    if (normalized === EpisodeStatus.NotWatched) {
        return false;
    }

    return false;
}

export async function scrapeHandler(
    args: CLI.ResolveParameters<CLI.Commands.Scrape.Parameters>,
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

    const puppeteer = await Puppeteer.new(args.browser);

    try {
        const page = await puppeteer.createPage(async (_) => {
            await _.goto("https://www4.animeflv.net/");
            await _.waitForSelector(SELECTORS.AUTH.MODAL, { timeout: 30_000 });

            await _.click(SELECTORS.AUTH.MODAL);

            await Promise.all([
                _.waitForSelector(SELECTORS.AUTH.INPUT_EMAIL),
                _.waitForSelector(SELECTORS.AUTH.INPUT_PASSWORD),
                _.waitForSelector(SELECTORS.AUTH.LOGIN_BUTTON),
            ]);
            await _.type(
                SELECTORS.AUTH.INPUT_EMAIL,
                (
                    await text({
                        message: "email",
                        validate: (value) => {
                            const parsed = z.email().safeParse(value);
                            if (!parsed.success) {
                                throw new Error("invalid email provided");
                            }
                        },
                    })
                ).toString(),
            );
            await _.type(
                SELECTORS.AUTH.INPUT_PASSWORD,
                (await password({ message: "password", mask: "*" })).toString(),
            );
            await _.click(SELECTORS.AUTH.LOGIN_BUTTON);
        });

        await delay(1000);

        const report: AnimeReport[] = [];

        for (const entry of parsed.data) {
            await page.goto(entry.to);

            await page.waitForSelector(SELECTORS.ANIME_PAGE.EPISODES_CONTAINER);

            await page.evaluate(async (selector) => {
                const element = document.querySelector(selector);
                if (!(element instanceof HTMLElement)) {
                    return;
                }

                let previousHeight = 0;
                while (element.scrollHeight !== previousHeight) {
                    previousHeight = element.scrollHeight;
                    element.scrollTop = element.scrollHeight;
                    await new Promise((resolve) => setTimeout(resolve, 300));
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
                const watched = parseWatched(
                    await status.evaluate((element) =>
                        element.textContent.trim(),
                    ),
                );

                episodes.push({ index: episodeIndex, watched });
            }

            report.push({ label: entry.label, url: entry.to, episodes });

            await delay(1000);
        }

        await mkdir(dirname(args.output), { recursive: true });
        await writeFile(args.output, JSON.stringify(report, null, 2), {
            encoding: "utf-8",
        });
    } finally {
        puppeteer.terminate();
    }

    logger.info(`list saved to ${args.output}`);
}
