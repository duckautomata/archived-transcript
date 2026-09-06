import { test, expect } from "./custom-test";
import { readCopiedText, stubClipboard, takeScreenshots } from "./helper";

/**
 * @typedef {import("@playwright/test").Page} Page
 */

/**
 * Fill in the known-good query (Dokibird / Stream / "halo\uff1a combat") and press Search.
 * With `searchText` "hello guys" this returns the kr8goDVttJM stream with 3 matches.
 * @param {Page} page
 * @param {string} searchText
 */
async function searchHaloCombat(page, searchText) {
    await page.goto("search");
    await expect(page.getByTestId("search-transcript")).toBeVisible();
    await page.getByRole("textbox", { name: "Search Text" }).click();
    await page.getByRole("textbox", { name: "Search Text" }).fill(searchText);
    await page.getByRole("combobox", { name: "Streamer" }).click();
    await page.getByRole("option", { name: "Dokibird" }).click();
    await page.getByRole("combobox", { name: "Type" }).click();
    await page.getByRole("option", { name: "Stream" }).click();
    await page.getByRole("option", { name: "Stream" }).press("Escape");
    await page.getByRole("textbox", { name: "Stream Title" }).click();
    await page.getByRole("textbox", { name: "Stream Title" }).fill("halo\uff1a combat");
    await page.getByTestId("search-transcript").click();
    await expect(page.getByTestId("search-results")).toBeVisible({ timeout: 15000 });
}

test.describe("Search Page", () => {
    test("can load results", async ({ page }, testInfo) => {
        await page.goto("search");
        await expect(page.getByTestId("search-transcript")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("combobox", { name: "Type" }).click();
        await page.getByRole("option", { name: "Stream" }).click();
        await page.getByRole("option", { name: "Stream" }).press("Escape");
        await page.getByRole("textbox", { name: "Stream Title" }).click();
        await page.getByRole("textbox", { name: "Stream Title" }).fill("halo");
        await page.getByTestId("search-transcript").click();
        await expect(page.getByTestId("search-results")).toBeVisible();
        await takeScreenshots(page, testInfo, "search");
    });

    test("shows no data error message", async ({ page }) => {
        await page.goto("search");
        await expect(page.getByTestId("search-transcript")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hhhheeeellllloooo");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("combobox", { name: "Type" }).click();
        await page.getByRole("option", { name: "Stream" }).click();
        await page.getByRole("option", { name: "Stream" }).press("Escape");
        await page.getByTestId("search-transcript").click();
        await expect(page.getByTestId("no-data-error")).toBeVisible();
    });

    test("shows basic results when no search text", async ({ page }) => {
        await page.goto("search");
        await expect(page.getByTestId("search-transcript")).toBeVisible();
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("combobox", { name: "Type" }).click();
        await page.getByRole("option", { name: "Stream" }).click();
        await page.getByRole("option", { name: "Stream" }).press("Escape");
        await page.getByRole("textbox", { name: "Stream Title" }).click();
        await page.getByRole("textbox", { name: "Stream Title" }).fill("halo\uff1a combat");
        await page.getByTestId("search-transcript").click();
        await expect(page.getByTestId("search-results")).toBeVisible();
        await expect(page.getByTestId("expandable-result-kr8goDVttJM").getByText("0 matches")).toBeVisible();
    });

    test("shows full results when using search text", async ({ page }) => {
        await page.goto("search");
        await expect(page.getByTestId("search-transcript")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello guys");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("combobox", { name: "Type" }).click();
        await page.getByRole("option", { name: "Stream" }).click();
        await page.getByRole("option", { name: "Stream" }).press("Escape");
        await page.getByRole("textbox", { name: "Stream Title" }).click();
        await page.getByRole("textbox", { name: "Stream Title" }).fill("halo\uff1a combat");
        await page.getByTestId("search-transcript").click();
        await expect(page.getByTestId("search-results")).toBeVisible();
        await expect(page.getByTestId("expandable-result-kr8goDVttJM").getByText("3 matches")).toBeVisible();
    });

    test("expanded results stays expanded when unmounted", async ({ page }) => {
        await page.goto("search");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("combobox", { name: "Type" }).click();
        await page.getByText("Stream", { exact: true }).click();
        await page.getByRole("option", { name: "Stream" }).press("Escape");
        await page.getByRole("textbox", { name: "To" }).fill("2026-01-01");
        await page.getByTestId("search-transcript").click();

        await page.getByTestId("expandable-result-oHzqYJpRfiY").getByTestId("expand-more").click();
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect(page.getByTestId("expandable-result-J2YmJL0PX5M")).toBeVisible();
        await page.getByRole("button", { name: "scroll back to top" }).click();
        await expect(page.getByTestId("expanded-result-oHzqYJpRfiY")).toBeVisible();
    });

    test("search updates the url", async ({ page }) => {
        await page.goto("search");
        await expect(page.getByTestId("search-transcript")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByTestId("search-transcript").click();
        await expect(page).toHaveURL(/[?&]q=hello/);
        await expect(page).toHaveURL(/[?&]streamer=Dokibird/);
    });

    test("loads a shared search from the url", async ({ page }, testInfo) => {
        await page.goto("search?q=hello&streamer=Dokibird&type=Stream&title=halo");
        // The search runs from the url without pressing Search.
        await expect(page.getByTestId("search-results")).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("hello");
        await expect(page.getByRole("combobox", { name: "Streamer" })).toContainText("Dokibird");
        await expect(page.getByRole("combobox", { name: "Type" })).toContainText("Stream");
        await expect(page.getByRole("textbox", { name: "Stream Title" })).toHaveValue("halo");
        await takeScreenshots(page, testInfo, "search-shared");
    });

    test("reset clears fields and url", async ({ page }) => {
        await searchHaloCombat(page, "hello");
        await expect(page).toHaveURL(/[?&]q=hello/);

        await page.getByTestId("reset-query").click();
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("");
        await expect(page.getByRole("textbox", { name: "Stream Title" })).toHaveValue("");
        await expect(page.getByRole("combobox", { name: "Streamer" })).not.toContainText("Dokibird");
        await expect(page.getByRole("combobox", { name: "Type" })).not.toContainText("Stream");
        await expect(page.getByTestId("active-filter-count")).not.toBeVisible();
        await expect(page).not.toHaveURL(/[?&]q=/);
        await expect(page).not.toHaveURL(/[?&]streamer=/);
        await expect(page).not.toHaveURL(/[?&]type=/);
        await expect(page.getByTestId("search-results")).not.toBeVisible();
        await expect(page.getByTestId("search-hint")).toBeVisible();
    });

    test("enter submits the search from any text field", async ({ page }) => {
        await page.goto("search");
        await expect(page.getByTestId("search-transcript")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("textbox", { name: "Stream Title" }).fill("halo");
        await page.getByRole("textbox", { name: "Stream Title" }).press("Enter");
        await expect(page).toHaveURL(/[?&]q=hello/);
        await expect(page.getByTestId("search-results").or(page.getByTestId("no-data-error"))).toBeVisible({
            timeout: 15000,
        });
    });

    test("ignores invalid url parameters", async ({ page }) => {
        await page.goto("search?q=hello&streamer=Nobody&type=Bogus,Stream&from=2025-13-40&to=notadate&whole=maybe");
        await expect(page.getByTestId("search-results").or(page.getByTestId("no-data-error"))).toBeVisible({
            timeout: 15000,
        });
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("hello");
        await expect(page.getByRole("combobox", { name: "Streamer" })).not.toContainText("Nobody");
        await expect(page.getByRole("combobox", { name: "Type" })).toContainText("Stream");
        await expect(page.getByRole("combobox", { name: "Type" })).not.toContainText("Bogus");
        await expect(page.getByTestId("start-date").locator("input")).toHaveValue("");
        await expect(page.getByTestId("end-date").locator("input")).toHaveValue("");
        await expect(page.getByTestId("match-whole-word-switch").locator("input")).not.toBeChecked();
    });

    test("a link with only invalid parameters does not run a search", async ({ page }) => {
        await page.goto("search?streamer=Nobody");
        await expect(page.getByTestId("search-hint")).toBeVisible();
        await expect(page.getByTestId("search-results")).not.toBeVisible();
        await expect(page.getByTestId("no-data-error")).not.toBeVisible();
    });

    test("copies a line link from a search result", async ({ page }) => {
        await stubClipboard(page);
        await searchHaloCombat(page, "hello guys");
        await page.getByTestId("expandable-result-kr8goDVttJM").getByTestId("expand-more").click();
        const expanded = page.getByTestId("expanded-result-kr8goDVttJM");
        const linePattern = /\/archived-transcript\/transcript\/kr8goDVttJM#T\d\d-\d\d-\d\d$/;
        await expect(expanded.getByTestId("context-timestamp").first()).toHaveAttribute("href", linePattern);

        await expanded.getByRole("button", { name: "Line actions" }).first().click();
        await expect(page.getByTestId("jump-to-line")).toHaveAttribute("href", linePattern);
        await page.getByTestId("copy-line-link").click();
        await expect(page.getByTestId("toast")).toBeVisible();
        await expect.poll(() => readCopiedText(page)).toMatch(/^http:\/\/localhost:4173/);
        expect(await readCopiedText(page)).toMatch(linePattern);
    });

    test("share copies the url", async ({ page }) => {
        await stubClipboard(page);
        await page.goto("search");
        await expect(page.getByTestId("search-transcript")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByTestId("share-query").click();

        await expect(page.getByTestId("toast")).toBeVisible();
        await expect.poll(() => readCopiedText(page)).toContain("/archived-transcript/search?");
        expect(await readCopiedText(page)).toContain("q=hello");
        await expect(page).toHaveURL(/[?&]q=hello/);
    });

    test("result links open in new tab", async ({ page, context, browserName, isMobile }) => {
        await searchHaloCombat(page, "hello guys");
        await expect(page.getByTestId("expandable-result-kr8goDVttJM").getByText("3 matches")).toBeVisible();
        await page.getByTestId("expandable-result-kr8goDVttJM").getByTestId("expand-more").click();

        const expanded = page.getByTestId("expanded-result-kr8goDVttJM");
        await expect(expanded).toBeVisible();
        const transcriptLink = expanded.getByTestId("full-transcript-link");
        await expect(transcriptLink).toHaveAttribute("href", /\/archived-transcript\/transcript\/kr8goDVttJM$/);
        await expect(expanded.getByTestId("graph-view-link")).toHaveAttribute("href", /\/graph\/kr8goDVttJM$/);

        // Only desktop Chromium reliably opens a new tab on Ctrl/Cmd+click under automation.
        if (browserName === "chromium" && !isMobile) {
            const [newPage] = await Promise.all([
                context.waitForEvent("page"),
                transcriptLink.click({ modifiers: ["ControlOrMeta"] }),
            ]);
            // A background tab starts at about:blank and navigates afterwards, so wait for the URL.
            await newPage.waitForURL(/transcript\/kr8goDVttJM/);
            await newPage.close();
            // The original page must not have navigated away.
            await expect(page).toHaveURL(/archived-transcript\/search/);
        }
    });
});
