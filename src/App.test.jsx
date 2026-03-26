import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { describe, it, expect } from "vitest";

describe("App Component", () => {
    it("renders the app", () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>,
        );
        expect(document.body).toBeInTheDocument();
    });
});
