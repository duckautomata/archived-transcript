import { test, expect } from "./custom-test";
import { readCopiedText, stubClipboard, takeScreenshots } from "./helper";

/**
 * Navigate inside the app (no page reload) so the store keeps its state, like clicking an in-app link.
 * @param {import("@playwright/test").Page} page
 * @param {string} path - Full path including the basename, e.g. "/archived-transcript/search"
 */
async function navigateInApp(page, path) {
    await page.evaluate((target) => {
        window.history.pushState({}, "", target);
        window.dispatchEvent(new PopStateEvent("popstate"));
    }, path);
}

test.describe("Graph Single Page", () => {
    test("can load graph", async ({ page }, testInfo) => {
        await page.goto("graph/J2YmJL0PX5M");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByTestId("generate-graph").click();
        await expect(page.getByTestId("graph-chart")).toBeVisible();
        await takeScreenshots(page, testInfo, "graph-J2YmJL0PX5M");
    });

    test("shows no data error message", async ({ page }) => {
        await page.goto("graph/J2YmJL0PX5M");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hhhheeeellllloooo");
        await page.getByTestId("generate-graph").click();
        await expect(page.getByTestId("no-data-error")).toBeVisible();
    });

    test("shows input error message", async ({ page }) => {
        await page.goto("graph/J2YmJL0PX5M");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByTestId("generate-graph").click();
        await expect(page.getByTestId("input-error")).toBeVisible();
    });

    test("no stream found", async ({ page }) => {
        await page.goto("graph/R7dtuo6Sx04");
        await expect(page.getByTestId("graph-single-error")).toBeVisible();
    });

    test("loads a shared single graph from the url", async ({ page }) => {
        await page.goto("graph/J2YmJL0PX5M?q=hello&whole=1");
        // The graph is generated from the url without pressing "Generate Graph".
        await expect(page.getByTestId("graph-chart")).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("hello");
        // MUI Switch renders a native checkbox input inside the element carrying the test id.
        await expect(page.getByTestId("match-whole-word-switch").locator("input")).toBeChecked();
    });

    test("links to the transcript", async ({ page }) => {
        await page.goto("graph/J2YmJL0PX5M");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await expect(page.getByTestId("view-transcript-link")).toHaveAttribute(
            "href",
            /\/archived-transcript\/transcript\/J2YmJL0PX5M$/,
            { timeout: 15000 },
        );
    });

    test("reset clears the search text and whole word", async ({ page }) => {
        await page.goto("graph/J2YmJL0PX5M");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByTestId("match-whole-word-switch").locator("input").check();
        await page.getByTestId("generate-graph").click();
        await expect(page.getByTestId("graph-chart")).toBeVisible({ timeout: 15000 });
        await expect(page).toHaveURL(/[?&]q=hello/);
        await expect(page).toHaveURL(/[?&]whole=1/);

        await page.getByTestId("reset-query").click();
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("");
        await expect(page.getByTestId("match-whole-word-switch").locator("input")).not.toBeChecked();
        await expect(page.getByTestId("graph-chart")).not.toBeVisible();
        await expect(page).not.toHaveURL(/[?&]q=/);
        await expect(page).not.toHaveURL(/[?&]whole=/);
    });

    test("share copies a single graph url without search filters", async ({ page }) => {
        await stubClipboard(page);
        await page.goto("graph/J2YmJL0PX5M");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByTestId("share-query").click();
        await expect(page.getByTestId("toast")).toBeVisible();
        await expect.poll(() => readCopiedText(page)).toMatch(/\/archived-transcript\/graph\/J2YmJL0PX5M\?q=hello$/);
    });

    test("keeps the search filters when opened from a shared url", async ({ page }) => {
        // Fill the Search page filters from a shared url, then move to a shared single-graph url in-app.
        await page.goto("search?streamer=Dokibird&type=Stream&title=halo");
        await expect(page.getByTestId("search-results")).toBeVisible({ timeout: 15000 });
        await navigateInApp(page, "/archived-transcript/graph/J2YmJL0PX5M?q=hello&whole=1");
        await expect(page.getByTestId("graph-chart")).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("hello");
        await expect(page.getByTestId("match-whole-word-switch").locator("input")).toBeChecked();

        // Reset on the single graph only clears its own fields...
        await page.getByTestId("reset-query").click();
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("");

        // ...so back on the Search page the filters chosen earlier are still there.
        await navigateInApp(page, "/archived-transcript/search");
        await expect(page.getByRole("combobox", { name: "Streamer" })).toContainText("Dokibird");
        await expect(page.getByRole("combobox", { name: "Type" })).toContainText("Stream");
        await expect(page.getByRole("textbox", { name: "Stream Title" })).toHaveValue("halo");
        await expect(page.getByTestId("match-whole-word-switch").locator("input")).not.toBeChecked();
    });
});
