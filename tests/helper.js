/**
 * @typedef {import("@playwright/test").Page} Page
 * @typedef {import("@playwright/test").TestInfo} TestInfo
 */

/**
 * Take screenshots of the page in both light and dark mode
 * @param {Page} page
 * @param {TestInfo} testInfo
 * @param {string} name
 */
export async function takeScreenshots(page, testInfo, name) {
    if (process.env.CI) return;

    // Light Mode. We need to wait for the page to update to the color scheme.
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForTimeout(500);
    await testInfo.attach(`${name}-light`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
    });

    // Dark Mode
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(500);
    await testInfo.attach(`${name}-dark`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
    });
}

/**
 * Replace `navigator.clipboard.writeText` with a stub that records the copied text in `window.__copiedText`.
 * Headless browsers do not grant clipboard access, so this is the only reliable way to assert what was copied.
 * Must be called BEFORE `page.goto` so the stub is installed on every document the page loads.
 * @param {Page} page
 */
export async function stubClipboard(page) {
    await page.addInitScript(() => {
        const writeText = (text) => {
            window.__copiedText = String(text);
            return Promise.resolve();
        };
        Object.defineProperty(navigator, "clipboard", {
            value: { writeText },
            configurable: true,
            writable: true,
        });
    });
}

/**
 * Read back the text captured by `stubClipboard`. Resolves to `undefined` when nothing was copied yet.
 * @param {Page} page
 * @returns {Promise<string | undefined>}
 */
export async function readCopiedText(page) {
    return page.evaluate(() => window.__copiedText);
}
