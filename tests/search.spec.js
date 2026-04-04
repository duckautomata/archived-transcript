import { test, expect } from "@playwright/test";
import { takeScreenshots } from "./helper";

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
});
