import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { password, text } from "@clack/prompts";
import { z } from "zod";
import { Puppeteer } from "@/core/puppeteer";
import { SELECTORS } from "@/core/selectors";
import { Logger } from "@/utils/logger";

interface AnimeCard {
    label: string;
    to: string;
}

export async function exportHandler(
    args: CLI.ResolveParameters<CLI.Commands.Export.Parameters>,
) {
    const logger = Logger.getInstance();

    const puppeteer = await Puppeteer.new(args.browser);
    logger.info(`instance created`);

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

    logger.info(`list saved to ${args.output}`);
}
