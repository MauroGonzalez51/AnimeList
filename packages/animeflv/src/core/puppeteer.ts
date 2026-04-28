import type { Browser, BrowserContext, LaunchOptions, Page } from "puppeteer";
import process from "node:process";
import { err, ok } from "neverthrow";
import puppeteer from "puppeteer";
import { BrowserNotFound } from "@/core/errors";
import { Logger } from "@/utils/logger";

const DEFAULT_LAUNCH_CONFIG: LaunchOptions = {
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--window-size=1920,1080",
        "--lang=es-419,es",
    ],
};

export class Puppeteer {
    #instance: Browser;
    #context: BrowserContext;

    private constructor(instance: Browser, context: BrowserContext) {
        this.#instance = instance;
        this.#context = context;
    }

    static #makeInstance(executablePath?: string) {
        if (executablePath) {
            return puppeteer
                .launch({ executablePath, ...DEFAULT_LAUNCH_CONFIG })
                .then((instance) => ok(instance))
                .catch(() => err(new BrowserNotFound()));
        }

        return puppeteer
            .launch({ channel: "chrome" })
            .then((instance) => ok(instance))
            .catch(() => err(new BrowserNotFound()));
    }

    public static async new(executablePath?: string): Promise<Puppeteer> {
        const logger = Logger.getInstance();

        const instance = (await this.#makeInstance(executablePath)).match(
            (instance) => instance,
            (err) => {
                logger.error(err);
                process.exit(1);
            },
        );

        const context = await instance.createBrowserContext();

        const page = await context.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        );

        await page.setExtraHTTPHeaders({
            "Accept-Language": "es-419,es;q=0.9",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        });

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", {
                get: () => undefined,
            });
            Object.defineProperty(navigator, "plugins", {
                get: () => [1, 2, 3],
            });
            Object.defineProperty(navigator, "languages", {
                get: () => ["es-419", "es"],
            });
        });

        await page.close();

        return new Puppeteer(instance, context);
    }

    async createPage(setup?: (page: Page) => void | Promise<void>) {
        const page = await this.#instance.newPage();

        await page.setRequestInterception(true);
        page.on("request", (request) => {
            const blockedDomains = [
                "googlesyndication.com",
                "doubleclick.net",
                "adservice.google.com",
                "amazon-adsystem.com",
                "ads.pubmatic.com",
            ];

            const url = request.url();
            const isAd = blockedDomains.some((domain) => url.includes(domain));

            if (isAd) {
                request.abort();
                return;
            }

            request.continue();
        });

        if (setup) {
            await setup(page);
        }

        return page;
    }

    async terminate() {
        await this.#context.close();
        await this.#instance.close();
    }
}
