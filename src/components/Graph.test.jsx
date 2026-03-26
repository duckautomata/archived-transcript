import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Graph from "./Graph";
import { describe, it, expect } from "vitest";

describe("Graph Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <Graph />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
