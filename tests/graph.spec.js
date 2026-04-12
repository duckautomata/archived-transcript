import { test, expect } from "./custom-test";
import { takeScreenshots } from "./helper";

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
});
