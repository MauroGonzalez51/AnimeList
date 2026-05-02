import process from "node:process";
import { AnimeFLV, Puppeteer, SELECTORS } from "@/core";
import { Logger, writeTo } from "@/utils";

interface AnimeCard {
    label: string;
    to: string;
}

export async function exportHandler(
    args: CLI.ResolveParameters<
        CLI.Commands.BrowserOptions &
            CLI.Commands.OutputOptions &
            CLI.Commands.Export.Parameters
    >,
) {
    const logger = Logger.getInstance();

    const puppeteer = await Puppeteer.new({
        executablePath: args.browser ?? "",
        headless: args.headless,
    });
    logger.info(`instance created`);

    try {
        const page = (await AnimeFLV.login(puppeteer)).match(
            (_) => {
                logger.info("login succesfull");
                return _;
            },
            (err) => {
                logger.error(err);
                process.exit(1);
            },
        );

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

        await writeTo(args.output, cards, { format: args.format });
    } finally {
        await puppeteer.terminate();
    }

    logger.info(`list saved to ${args.output}`);
}
