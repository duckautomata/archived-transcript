import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingsPopup from "./SettingsPopup";
import { describe, it, expect } from "vitest";

describe("SettingsPopup Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <SettingsPopup open={true} onClose={() => {}} />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
