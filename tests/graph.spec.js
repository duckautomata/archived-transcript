import { test, expect } from "./custom-test";
import { readCopiedText, stubClipboard, takeScreenshots } from "./helper";

test.describe("Graph Page", () => {
    test("can load graph", async ({ page }, testInfo) => {
        await page.goto("graph");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("combobox", { name: "Type" }).click();
        await page.getByRole("option", { name: "Stream" }).click();
        await page.getByRole("option", { name: "Stream" }).press("Escape");
        await page.getByTestId("generate-graph").click();
        await expect(page.getByTestId("graph-chart")).toBeVisible();
        await takeScreenshots(page, testInfo, "graph");

        await page.getByRole("switch", { name: "Cumulative View" }).check();
        await takeScreenshots(page, testInfo, "graph-cumulative");
    });

    test("shows no data error message", async ({ page }) => {
        await page.goto("graph");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hhhheeeellllloooo");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("combobox", { name: "Type" }).click();
        await page.getByRole("option", { name: "Stream" }).click();
        await page.getByRole("option", { name: "Stream" }).press("Escape");
        await page.getByTestId("generate-graph").click();
        await expect(page.getByTestId("no-data-error")).toBeVisible();
    });

    test("shows input error message", async ({ page }) => {
        await page.goto("graph");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByTestId("generate-graph").click();
        await expect(page.getByTestId("input-error")).toBeVisible();
    });

    test("loads a shared graph from the url", async ({ page }) => {
        await page.goto("graph?q=hello&streamer=Dokibird&type=Stream");
        // The graph is generated from the url without pressing "Generate Graph".
        await expect(page.getByTestId("graph-chart")).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("hello");
        await expect(page.getByRole("combobox", { name: "Streamer" })).toContainText("Dokibird");
    });

    test("reset clears the graph", async ({ page }) => {
        await page.goto("graph");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("combobox", { name: "Type" }).click();
        await page.getByRole("option", { name: "Stream" }).click();
        await page.getByRole("option", { name: "Stream" }).press("Escape");
        await page.getByTestId("generate-graph").click();
        await expect(page.getByTestId("graph-chart")).toBeVisible({ timeout: 15000 });
        await expect(page).toHaveURL(/[?&]q=hello/);

        await page.getByTestId("reset-query").click();
        await expect(page.getByTestId("graph-chart")).not.toBeVisible();
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("");
        await expect(page.getByRole("combobox", { name: "Streamer" })).not.toContainText("Dokibird");
        await expect(page.getByRole("combobox", { name: "Type" })).not.toContainText("Stream");
        await expect(page.getByTestId("active-filter-count")).not.toBeVisible();
        await expect(page).not.toHaveURL(/[?&]q=/);
        await expect(page).not.toHaveURL(/[?&]type=/);
    });

    test("reset while generating does not show the stale graph", async ({ page }) => {
        await page.goto("graph");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByTestId("generate-graph").click();
        // Reset immediately, while the request is (most likely) still in flight.
        await page.getByTestId("reset-query").click();
        await expect(page.getByTestId("generate-graph")).toBeEnabled();
        await expect(page.getByRole("textbox", { name: "Search Text" })).toHaveValue("");
        // Give a slow response time to arrive: the chart must stay hidden.
        await page.waitForTimeout(4000);
        await expect(page.getByTestId("graph-chart")).not.toBeVisible();
        await expect(page.getByTestId("generate-graph")).toBeEnabled();
    });

    test("enter submits the graph query", async ({ page }) => {
        await page.goto("graph");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByRole("combobox", { name: "Streamer" }).click();
        await page.getByRole("option", { name: "Dokibird" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).press("Enter");
        await expect(page).toHaveURL(/[?&]q=hello/);
        await expect(page.getByTestId("graph-chart").or(page.getByTestId("no-data-error"))).toBeVisible({
            timeout: 15000,
        });
    });

    test("share copies the url", async ({ page }) => {
        await stubClipboard(page);
        await page.goto("graph");
        await expect(page.getByTestId("generate-graph")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Text" }).click();
        await page.getByRole("textbox", { name: "Search Text" }).fill("hello");
        await page.getByTestId("share-query").click();

        await expect(page.getByTestId("toast")).toBeVisible();
        await expect.poll(() => readCopiedText(page)).toContain("/archived-transcript/graph?");
        expect(await readCopiedText(page)).toContain("q=hello");
        await expect(page).toHaveURL(/[?&]q=hello/);
    });
});
