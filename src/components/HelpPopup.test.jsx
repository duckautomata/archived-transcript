import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HelpPopup from "./HelpPopup";
import { describe, it, expect } from "vitest";

describe("HelpPopup Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <HelpPopup open={true} onClose={() => {}} />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
