import type { Puppeteer } from "@/core/";
import { password, text } from "@clack/prompts";
import { err, ok } from "neverthrow";
import { z } from "zod";
import { AnimeFLVLoginError, SELECTORS } from "@/core/";

export const AnimeFLV = {
    async login(puppeteer: Puppeteer) {
        const page = await puppeteer.createPage(async (_) => {
            await _.goto("https://www4.animeflv.net/");
            await _.waitForSelector(SELECTORS.AUTH.MODAL, { timeout: 30_000 });

            await _.click(SELECTORS.AUTH.MODAL);

            await Promise.all([
                _.waitForSelector(SELECTORS.AUTH.INPUT_EMAIL),
                _.waitForSelector(SELECTORS.AUTH.INPUT_PASSWORD),
                _.waitForSelector(SELECTORS.AUTH.LOGIN_BUTTON),
            ]);
        });

        await page.type(
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
        await page.type(
            SELECTORS.AUTH.INPUT_PASSWORD,
            (await password({ message: "password", mask: "*" })).toString(),
        );
        await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
        if (page.url() === "https://www4.animeflv.net/auth/sign_in") {
            return err(new AnimeFLVLoginError());
        }

        return ok(page);
    },
};
