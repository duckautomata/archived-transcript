import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ExpandableResult from "./ExpandableResult";
import { describe, it, expect } from "vitest";

describe("ExpandableResult Component", () => {
    it("renders correctly", () => {
        const mockStream = {
            id: "123",
            streamer: "Test Streamer",
            date: "2024-01-01",
            streamType: "Live",
            title: "Test Stream",
            contexts: ["Test context snippet..."],
        };
        const { container } = render(
            <MemoryRouter>
                <ExpandableResult stream={mockStream} expanded={false} toggleExpand={() => {}} />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
