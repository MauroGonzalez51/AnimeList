import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";

export const Puppeteer = {
    async launch(): Promise<Browser> {
        const browser = await puppeteer.launch({
            channel: "chrome",
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
        });

        const page = await browser.newPage();

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

        return browser;
    },

    async newPage(browser: Browser) {
        const page = await browser.newPage();

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

        return page;
    },
};
