// oxlint-disable no-console
/* eslint-disable react-hooks/rules-of-hooks */

/**
 * This file is used to extend the test object with custom functionality.
 * This is useful for catching any console or page errors during testing.
 */

import { test as base } from "@playwright/test";
export * from "@playwright/test";

const locationToText = ({ url, lineNumber, columnNumber }) => {
    return `${url}:${lineNumber}:${columnNumber}`;
};

const argsToText = (args) => {
    return args.map((arg) => arg.toString()).join(", ");
};

const safeErrors = ["the server responded with a status of 404"];

export const test = base.extend({
    page: async ({ page }, use) => {
        const errorLogs = [];

        page.on("console", (msg) => {
            if (msg.type() === "error") {
                const text = `${msg.text()} ${locationToText(msg.location())} [${argsToText(msg.args())}]`;
                if (safeErrors.some((error) => text.includes(error))) {
                    return;
                }
                errorLogs.push(text);
                console.error(`[Browser Console Error] ${text}`);
            }
        });

        page.on("pageerror", (exception) => {
            errorLogs.push(String(exception));
            console.error(`[Browser Page Error] ${exception}`);
        });

        await use(page);

        if (errorLogs.length > 0) {
            throw new Error(`Test failed due to browser console errors:\n${errorLogs.join("\n")}`);
        }
    },
});
