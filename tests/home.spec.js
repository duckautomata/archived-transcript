import { test, expect } from "./custom-test";
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
        // Once an id is typed the button becomes a real link (so it can be opened in a new tab).
        const viewButton = page.getByTestId("view-transcript-btn");
        await expect(viewButton).toHaveAttribute("href", /\/archived-transcript\/transcript\/J2YmJL0PX5M$/);
        await viewButton.click();
        await expect(page.getByText("【MY RETURN】I'm back everyone【Dokibird】")).toBeVisible();
    });

    test("can view graph", async ({ page }) => {
        await page.goto("");
        await page.getByRole("textbox", { name: "Graph Stream by ID" }).click();
        await page.getByRole("textbox", { name: "Graph Stream by ID" }).fill("J2YmJL0PX5M");
        const graphButton = page.getByTestId("graph-stream-btn");
        await expect(graphButton).toHaveAttribute("href", /\/archived-transcript\/graph\/J2YmJL0PX5M$/);
        await graphButton.click();
        await expect(page.getByText("【MY RETURN】I'm back everyone【Dokibird】")).toBeVisible();
    });

    test("direct access buttons are disabled until an id is typed", async ({ page }) => {
        await page.goto("");
        await expect(page.getByTestId("view-transcript-btn")).toBeDisabled();
        await expect(page.getByTestId("graph-stream-btn")).toBeDisabled();
        await page.getByRole("textbox", { name: "View Transcript by ID" }).fill("   ");
        await expect(page.getByTestId("view-transcript-btn")).toBeDisabled();
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

    test("cards are links", async ({ page }) => {
        await page.goto("");
        await expect(page.getByTestId("search-btn")).toBeVisible();
        await expect(page.getByTestId("search-btn")).toHaveAttribute("href", /\/archived-transcript\/search$/);
        await expect(page.getByTestId("graph-btn")).toHaveAttribute("href", /\/archived-transcript\/graph$/);
    });

    test("sidebar items are links", async ({ page, isMobile }) => {
        await page.goto("");
        await expect(page.getByTestId("search-btn")).toBeVisible();

        if (isMobile) {
            // The drawer is closed on small screens; open it with the floating menu button first.
            await page.getByRole("button", { name: "Open sidebar" }).click();
        }

        // Scope to the drawer so the home page cards (which also link to Search / Graph) are not matched.
        const drawer = page.locator(".MuiDrawer-root");
        await expect(drawer.getByRole("link", { name: "Search", exact: true })).toHaveAttribute(
            "href",
            /\/archived-transcript\/search$/,
        );
        await expect(drawer.getByRole("link", { name: "Graph", exact: true })).toHaveAttribute(
            "href",
            /\/archived-transcript\/graph$/,
        );
    });
});
