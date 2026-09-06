import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SmartShortlistPrototype from "./SmartShortlistPrototype";

describe("Smart Shortlist prototype", () => {
  it("completes exactly six guided screens and shows unpadded results", () => {
    render(<SmartShortlistPrototype />);
    expect(screen.getByRole("heading", { name: "Where would you like to look?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "What kind of stay are you considering?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "What should affordability mean here?" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Total monthly budget in USD" }), { target: { value: "4500" } });
    expect(screen.getByRole("combobox", { name: "Supporting display currency" })).toHaveValue("USD");

    for (const heading of ["Which setting would you enjoy?", "Which details should open first?", "What must be met?"]) {
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));
    expect(screen.getByRole("heading", { name: "12 places shown from 36" })).toBeInTheDocument();
    expect(screen.getByText(/Nothing is added to fill a quota/)).toBeInTheDocument();
    expect(screen.queryByText(/match percentage/i)).toBeInTheDocument();
    expect(screen.getByText("Your decision budget: $4,500 USD")).toBeInTheDocument();
    expect(screen.getByText(/Supporting local-cost conversion uses one deterministic fixture/)).toBeInTheDocument();
    expect(screen.getByText(/Estimated comfortable monthly living cost in 2026 USD/)).toBeInTheDocument();
    expect(screen.getAllByText("Deterministic architecture fixture (not live)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Estimated total monthly living cost")).toHaveLength(12);
    expect(screen.queryByText(/range unavailable|insufficient information/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Within budget|Close to budget|Over budget/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/USD$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("USD conversion unavailable").length).toBeGreaterThan(0);
    expect(screen.getByText(/Stale rates retain their effective date/)).toBeInTheDocument();

    const compareBoxes = screen.getAllByRole("checkbox", { name: "Compare" }) as HTMLInputElement[];
    expect(compareBoxes.filter((box) => box.checked)).toHaveLength(3);
    fireEvent.click(compareBoxes.find((box) => !box.checked)!);
    expect(screen.getByRole("heading", { name: "4 places side by side" })).toBeInTheDocument();
    expect(compareBoxes.filter((box) => box.checked)).toHaveLength(4);
    expect(compareBoxes.filter((box) => !box.checked && box.disabled).length).toBeGreaterThan(0);
  });
});