import { test, expect } from "@playwright/test";
import { takeScreenshots } from "./helper";

test.describe("Home Page", () => {
    test("can load", async ({ page }, testInfo) => {
        await page.goto("");
        await expect(page.getByTestId("search-btn")).toBeVisible();
        await takeScreenshots(page, testInfo, "home");
    });

    test("can view transcript", async ({ page }) => {
        await page.goto("");
        await page.getByRole("textbox", { name: "View Transcript by ID" }).click();
        await page.getByRole("textbox", { name: "View Transcript by ID" }).fill("J2YmJL0PX5M");
        await page.getByRole("button", { name: "View", exact: true }).click();
        await expect(page.getByText("【MY RETURN】I'm back everyone【Dokibird】")).toBeVisible();
    });

    test("can view graph", async ({ page }) => {
        await page.goto("");
        await page.getByRole("textbox", { name: "Graph Stream by ID" }).click();
        await page.getByRole("textbox", { name: "Graph Stream by ID" }).fill("J2YmJL0PX5M");
        await page.getByRole("main").getByRole("button", { name: "Graph", exact: true }).click();
        await expect(page.getByText("【MY RETURN】I'm back everyone【Dokibird】")).toBeVisible();
    });

    test("redirects to Live site", async ({ page }) => {
        await page.goto("");

        const liveBtn = page.getByTestId("live-btn");
        await liveBtn.click();
        await expect(page).toHaveURL(/live-transcript\//);
    });

    test("handle redirecting with wrong url", async ({ page }) => {
        await page.goto("wrongvalue/");

        const searchBtn = page.getByTestId("search-btn");
        await searchBtn.click();
        await expect(page).toHaveURL(/archived-transcript\/search/);
    });
});
