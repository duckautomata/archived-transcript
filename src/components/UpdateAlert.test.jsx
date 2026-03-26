import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UpdateAlert from "./UpdateAlert";
import { describe, it, expect } from "vitest";

describe("UpdateAlert Component", () => {
    it("renders correctly", () => {
        const { container } = render(
            <MemoryRouter>
                <UpdateAlert />
            </MemoryRouter>,
        );
        expect(container).toBeInTheDocument();
    });
});
