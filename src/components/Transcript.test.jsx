import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Transcript from "./Transcript";
import { describe, it, expect, vi } from "vitest";
import { VirtuosoMockContext } from "react-virtuoso";
import { ThemeProvider } from "@emotion/react";
import { darkTheme } from "../theme";

vi.mock("../logic/api", () => ({
    getTranscriptById: vi.fn(() =>
        Promise.resolve({
            date: "2024-01-01",
            streamTitle: "Test Title",
            streamType: "Video",
            streamer: "Test Streamer",
            transcriptLines: [
                { id: "line1", start: "00:01:23", text: "First line of the test transcript" },
                { id: "line2", start: "00:02:34", text: "Second line of the test transcript" },
            ],
        }),
    ),
}));

describe("Transcript Component", () => {
    it("renders the transcript", async () => {
        const { container } = render(
            <ThemeProvider theme={darkTheme}>
                <MemoryRouter>
                    <VirtuosoMockContext.Provider
                        value={{
                            viewportHeight: 500, // mock viewport height
                            itemHeight: 50, // mock each item height
                        }}
                    >
                        <Transcript />
                    </VirtuosoMockContext.Provider>
                </MemoryRouter>
            </ThemeProvider>,
        );
        expect(container).toBeInTheDocument();

        // Wait for the async fetch to complete to prevent act() warnings
        await waitFor(() => {
            expect(screen.queryByText("Loading Transcript...")).not.toBeInTheDocument();
            expect(screen.getByRole("heading", { name: "Test Title" })).toBeVisible();
            expect(screen.getByText(/.*First line of the test transcript.*/i)).toBeVisible();
            expect(screen.getByText(/.*Second line of the test transcript.*/i)).toBeVisible();
        });
    });
});
