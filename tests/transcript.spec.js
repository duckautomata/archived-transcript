import { test, expect } from "./custom-test";
import { takeScreenshots } from "./helper";

test.describe("Transcript Page", () => {
    test("can load", async ({ page }, testInfo) => {
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Transcript" }).click();
        await page.getByRole("textbox", { name: "Search Transcript" }).fill("hello");
        await takeScreenshots(page, testInfo, "home");
    });

    test("search and jump to line", async ({ page }) => {
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Transcript" }).click();
        await page.getByRole("textbox", { name: "Search Transcript" }).fill("hello");
        await page.getByTestId("line-button-1456").click();
        await page.getByRole("button", { name: "Jump to line" }).click();
        await expect(page.getByText("[02:23:32] Hello, my")).toBeVisible();
    });

    test("no transcript found", async ({ page }) => {
        await page.goto("transcript/R7dtuo6Sx04");
        await expect(page.getByTestId("404-transcript")).toBeVisible();
    });
});
