import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TranscriptSkeleton from "./TranscriptSkeleton";
import { describe, it, expect } from "vitest";

describe("TranscriptSkeleton Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <TranscriptSkeleton />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
