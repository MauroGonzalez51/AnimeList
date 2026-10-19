import { z } from "zod";

export default defineNuxtPlugin({
    name: "zod-config",
    dependsOn: ["on-init"],
    setup({ $i18n: { t } }) {
        z.config({
            customError(issue) {
                if (
                    issue.code === "invalid_type" &&
                    issue.input === undefined
                ) {
                    return t("validation.required");
                }

                if (issue.code === "too_small" && issue.origin === "string") {
                    return t("validation.required");
                }

                if (issue.code === "too_small" && issue.origin === "number") {
                    return t("validation.positive_number");
                }

                if (
                    issue.code === "invalid_type" &&
                    issue.expected === "number"
                ) {
                    return t("validation.number");
                }

                return undefined;
            },
        });
    },
});
