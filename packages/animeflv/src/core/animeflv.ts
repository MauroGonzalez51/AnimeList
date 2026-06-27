import { Puppeteer } from "@/core/";
import { confirm, outro } from "@clack/prompts";
import { ok } from "neverthrow";
import { SELECTORS } from "@/core/";

export const AnimeFLV = {
    async login(puppeteer: Puppeteer) {
        const page = await puppeteer.createPage(async (_) => {
            await _.goto("https://www4.animeflv.net/");
            await _.waitForSelector(SELECTORS.AUTH.MODAL, { timeout: 30_000 });
        });

        /**
         * ! CLI Login Removed
         *
         * Due to page popups, gets really complicated to manage
         * login, considering that, every click, is going to trigger a
         * new popuppage.
         *
         */

        // await Puppeteer.clickWithRetry(
        //     puppeteer.getBrowser(),
        //     page,
        //     SELECTORS.AUTH.MODAL,
        //     Infinity,
        // );

        // await page.type(
        //     SELECTORS.AUTH.INPUT_EMAIL,
        //     (
        //         await text({
        //             message: "email",
        //             validate: (value) => {
        //                 const parsed = z.email().safeParse(value);
        //                 if (!parsed.success) {
        //                     throw new Error("invalid email provided");
        //                 }
        //             },
        //         })
        //     ).toString(),
        // );

        // await page.type(
        //     SELECTORS.AUTH.INPUT_PASSWORD,
        //     (await password({ message: "password", mask: "*" })).toString(),
        // );

        // await Puppeteer.click(page, SELECTORS.AUTH.LOGIN_BUTTON);

        // await page.waitForNavigation({ waitUntil: "domcontentloaded" });
        // if (page.url() === "https://www4.animeflv.net/auth/sign_in") {
        //     return err(new AnimeFLVLoginError());
        // }

        await confirm({
            message: "Continue?",
        });

        outro("starting...");

        return ok(page);
    },
};
