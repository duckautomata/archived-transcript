import { test, expect } from "./custom-test";
import { readCopiedText, stubClipboard, takeScreenshots } from "./helper";

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
        // "Jump to line" is a real link (openable in a new tab) that also clears the filter.
        await expect(page.getByTestId("jump-to-line")).toHaveAttribute("href", /#T02-23-32$/);
        await page.getByTestId("jump-to-line").click();
        await expect(page.getByText("[02:23:32] Hello, my")).toBeVisible();
        await expect(page.getByRole("textbox", { name: "Search Transcript" })).toHaveValue("");
    });

    test("clicking a timestamp keeps the filter and links to the line", async ({ page }) => {
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Transcript" }).fill("hello");
        await page.getByTestId("line-anchor-1456").click();
        await expect(page).toHaveURL(/#T02-23-32$/);
        await expect(page.getByRole("textbox", { name: "Search Transcript" })).toHaveValue("hello");
        await expect(page.getByTestId("line-1456")).toBeVisible();
    });

    test("open stream asks for confirmation and can copy the video link", async ({ page }) => {
        await stubClipboard(page);
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        await page.getByTestId("open-stream").click();
        const openLink = page.getByTestId("external-link-open");
        await expect(openLink).toHaveAttribute("href", "https://www.youtube.com/watch?v=J2YmJL0PX5M");
        await expect(openLink).toHaveAttribute("target", "_blank");
        await page.getByTestId("external-link-copy").click();
        await expect.poll(() => readCopiedText(page)).toBe("https://www.youtube.com/watch?v=J2YmJL0PX5M");
        await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("copies a link to the transcript", async ({ page }) => {
        await stubClipboard(page);
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        await page.getByTestId("copy-transcript-link").click();
        await expect(page.getByTestId("toast")).toBeVisible();
        await expect.poll(() => readCopiedText(page)).toMatch(/\/archived-transcript\/transcript\/J2YmJL0PX5M$/);
    });

    test("no transcript found", async ({ page }) => {
        await page.goto("transcript/R7dtuo6Sx04");
        await expect(page.getByTestId("404-transcript")).toBeVisible();
    });

    test("shows a back to top button when scrolled", async ({ page }) => {
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();

        const backToTop = page.getByRole("button", { name: "scroll back to top" });
        await expect(backToTop).not.toBeVisible();

        // The transcript list scrolls with the window, so scrolling the window reveals the button. The
        // virtualized list grows the document shortly after the first lines render, so keep scrolling
        // until the window has actually moved.
        await expect(page.getByTestId(/^line-\d+$/).first()).toBeVisible();
        await expect
            .poll(async () => {
                await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
                return page.evaluate(() => window.scrollY);
            })
            .toBeGreaterThan(300);
        await expect(backToTop).toBeVisible();

        await backToTop.click();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("copies a direct link to a line", async ({ page }) => {
        await stubClipboard(page);
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Transcript" }).click();
        await page.getByRole("textbox", { name: "Search Transcript" }).fill("hello");
        await page.getByTestId("line-button-1456").click();
        await page.getByTestId("copy-line-link").click();

        await expect(page.getByTestId("toast")).toBeVisible();
        await expect
            .poll(() => readCopiedText(page))
            .toMatch(/\/archived-transcript\/transcript\/J2YmJL0PX5M#T02-23-32$/);
    });

    test("timestamp is a link to the line", async ({ page }) => {
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        await page.getByRole("textbox", { name: "Search Transcript" }).click();
        await page.getByRole("textbox", { name: "Search Transcript" }).fill("hello");
        await expect(page.getByTestId("line-anchor-1456")).toHaveAttribute("href", /#T02-23-32$/);
    });

    test("deep link scrolls to the line", async ({ page }) => {
        await page.goto("transcript/J2YmJL0PX5M#T02-23-32");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        // The list is virtualized, so the line only exists once the page has scrolled to it.
        await expect(page.getByTestId("line-1456")).toBeVisible({ timeout: 15000 });
        await expect(page.getByTestId("line-1456")).toContainText("Hello, my");
    });

    test("links to the graph", async ({ page }) => {
        await page.goto("transcript/J2YmJL0PX5M");
        await expect(page.getByTestId("stream-title")).toBeVisible();
        await expect(page.getByTestId("graph-stream-link")).toHaveAttribute(
            "href",
            /\/archived-transcript\/graph\/J2YmJL0PX5M$/,
        );
    });
});
