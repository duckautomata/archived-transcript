import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";
import { describe, it, expect } from "vitest";

describe("Sidebar Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <Sidebar drawerOpen={true} toggleDrawer={() => {}} />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
