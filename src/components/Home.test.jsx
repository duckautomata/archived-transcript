import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import { describe, it, expect, vi } from "vitest";

// Mock matchMedia for useMediaQuery
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe("Home Component", () => {
    it("renders heading and subheadings", () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
        );
        expect(screen.getByText("Archived Transcripts")).toBeInTheDocument();
        expect(screen.getByText("Search past streams or view specific transcripts.")).toBeInTheDocument();
        expect(screen.getByText("Direct Access")).toBeInTheDocument();
    });

    it("renders search and graph buttons", () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
        );
        expect(screen.getByText("Search through all archived transcripts.")).toBeInTheDocument();
        expect(screen.getByText("View word count graphs for streams.")).toBeInTheDocument();
    });

    it("handles inputs correctly", async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
        );

        const viewInput = screen.getByLabelText("View Transcript by ID");
        const graphInput = screen.getByLabelText("Graph Stream by ID");

        await userEvent.type(viewInput, "1234");
        expect(viewInput).toHaveValue("1234");

        await userEvent.type(graphInput, "5678");
        expect(graphInput).toHaveValue("5678");
    });
});
