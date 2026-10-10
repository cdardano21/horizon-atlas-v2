import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { smartShortlistCandidates } from "../../lib/smart-shortlist/cohort";
import SmartShortlistPrototype from "./SmartShortlistPrototype";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe("Smart Shortlist population wording", () => {
  it.each([0, 1, 3])("shows lifestyle wording without population counts for %i supplied candidates", (count) => {
    render(<SmartShortlistPrototype candidates={smartShortlistCandidates.slice(0, count)} intelligence={[]} />);
    expect(screen.getByText("Discover destinations matched to your lifestyle, budget, and priorities.")).toBeInTheDocument();
    expect(screen.queryByText(/local prototype|deeply researched places|available for matching|evaluated in this session/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/evaluated in this session/)).not.toBeInTheDocument();
  });

  it.each([0, 1, 3])("uses timeless results wording for %i supplied candidates", (count) => {
    render(<SmartShortlistPrototype candidates={smartShortlistCandidates.slice(0, count)} intelligence={[]} />);
    for (let step = 0; step < 5; step += 1) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));
    expect(screen.getByRole("heading", { name: "Your matching destinations" })).toBeInTheDocument();
    expect(screen.queryByText(/places shown from|from 36/i)).not.toBeInTheDocument();
    expect(screen.getByText("Discover destinations matched to your lifestyle, budget, and priorities.")).toBeInTheDocument();
  });

  it("keeps the same wording after matching and candidate changes without exposing evaluated counts", () => {
    const { rerender } = render(<SmartShortlistPrototype candidates={smartShortlistCandidates.slice(0, 3)} intelligence={[]} />);
    for (let step = 0; step < 5; step += 1) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));
    expect(screen.getByText("Discover destinations matched to your lifestyle, budget, and priorities.")).toBeInTheDocument();
    expect(screen.queryByText(/available for matching|evaluated in this session/i)).not.toBeInTheDocument();
    rerender(<SmartShortlistPrototype candidates={smartShortlistCandidates.slice(0, 2)} intelligence={[]} />);
    expect(screen.getByText("Discover destinations matched to your lifestyle, budget, and priorities.")).toBeInTheDocument();
    expect(screen.queryByText(/available for matching|evaluated in this session/i)).not.toBeInTheDocument();
  });
});
