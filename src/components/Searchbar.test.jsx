import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Searchbar from "./Searchbar";
import { describe, it, expect } from "vitest";

describe("Searchbar Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <Searchbar />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
