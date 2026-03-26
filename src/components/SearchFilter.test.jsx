import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchFilter from "./SearchFilter";
import { describe, it, expect } from "vitest";

describe("SearchFilter Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <SearchFilter />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
