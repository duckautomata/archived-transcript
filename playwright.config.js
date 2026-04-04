import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 1,
    workers: process.env.CI ? 1 : undefined,
    timeout: 30 * 1000,
    reporter: process.env.CI ? [["github"], ["html"], ["junit", { outputFile: "playwright-report.xml" }]] : "html",
    use: {
        baseURL: "http://localhost:4173/archived-transcript/",
        trace: "on-first-retry",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
        {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 7"] },
        },
    ].filter((project) => !process.env.CI || project.name === "chromium"),

    webServer: {
        command: "npm run preview",
        url: "http://localhost:4173/archived-transcript/",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
