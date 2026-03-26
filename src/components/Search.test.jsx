import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Search from "./Search";
import { describe, it, expect } from "vitest";

describe("Search Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
