import { writeFile, mkdir } from "node:fs/promises";
import { Puppeteer } from "@/core/puppeteer";
import { SELECTORS } from "@/core/selectors";
import { Logger } from "@/utils/logger";
import { dirname } from "node:path";

interface AnimeCard {
    label: string;
    to: string;
}

export async function exportHandler(
    args: CLI.ResolveParameters<CLI.Commands.Export.Parameters>,
) {
    const logger = Logger.getInstance();

    const puppeteer = await Puppeteer.new(args.browser);
    logger.info(`Instance created`);

    try {
        const page = await puppeteer.createPage();
        await page.goto("https://www4.animeflv.net/");

        const confirmed = await logger.prompt("Proceed?", { type: "confirm" });

        if (!confirmed) {
            logger.warn("Canceled by user");
            await puppeteer.terminate();
            return;
        }

        const usernameElement = await page.waitForSelector(
            SELECTORS.USERNAME_ELEMENT,
        );

        const username = await usernameElement?.evaluate(
            (element) => element.textContent,
        );

        if (!username) {
            logger.error("Username could not be detected. Cancelling");
            await puppeteer.terminate();
            return;
        }

        await page.goto(
            `https://www4.animeflv.net/perfil/${username}/siguiendo`,
        );

        const cards: AnimeCard[] = [];

        while (true) {
            const pageCards = await page.$$eval(
                SELECTORS.CARDS.ANIME.ALL,
                (cards, anchorSelector) => {
                    return cards
                        .map<AnimeCard | null>((element) => {
                            const anchor =
                                element.querySelector(anchorSelector);
                            if (!(anchor instanceof HTMLAnchorElement)) {
                                return null;
                            }

                            return {
                                to: anchor.href,
                                label: anchor.textContent,
                            };
                        })
                        .filter((card): card is AnimeCard => card !== null);
                },
                SELECTORS.CARDS.ANIME.ANCHOR,
            );

            if (!pageCards.length) {
                break;
            }

            cards.push(...pageCards);

            const canGoNext = await page.$eval(
                SELECTORS.PAGINATION.BUTTON_NEXT,
                (nextAnchor) => {
                    const li = nextAnchor.closest("li");
                    const classes =
                        `${nextAnchor.className} ${li?.className ?? ""}`.toLowerCase();
                    const ariaDisabled =
                        nextAnchor.getAttribute("aria-disabled") === "true" ||
                        li?.getAttribute("aria-disabled") === "true";
                    const href =
                        (nextAnchor instanceof HTMLAnchorElement
                            ? nextAnchor.getAttribute("href")
                            : "") ?? "";

                    const looksDisabled =
                        classes.includes("disabled") ||
                        ariaDisabled ||
                        href === "#" ||
                        href.toLowerCase().startsWith("javascript");

                    return !looksDisabled;
                },
            );

            if (!canGoNext) {
                break;
            }

            await Promise.all([
                page.waitForNavigation({
                    waitUntil: "domcontentloaded",
                    timeout: 5000,
                }),
                page.click(SELECTORS.PAGINATION.BUTTON_NEXT),
            ]);
        }

        await mkdir(dirname(args.output), { recursive: true });
        await writeFile(args.output, JSON.stringify(cards, null, 2), {
            encoding: "utf-8",
        });
    } finally {
        await puppeteer.terminate();
    }

    logger.info(`List saved to ${args.output}`);
}
