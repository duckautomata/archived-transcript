import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Maintenance from "./Maintenance";
import { describe, it, expect } from "vitest";

describe("Maintenance Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <Maintenance />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
