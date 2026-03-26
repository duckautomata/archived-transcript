import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GraphSingle from "./GraphSingle";
import { describe, it, expect } from "vitest";

describe("GraphSingle Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <GraphSingle />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
