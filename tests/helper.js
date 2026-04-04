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
