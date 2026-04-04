import { test, expect } from "@playwright/test";
import { takeScreenshots } from "./helper";

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
});
