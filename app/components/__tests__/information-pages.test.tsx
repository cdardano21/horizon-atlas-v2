import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HowItWorks from "../HowItWorks";
import ResourceLinks from "../ResourceLinks";

describe("How It Works", () => {
  it("presents the five-step journey with real product captures", () => {
    render(<HowItWorks />);

    expect(screen.getByRole("heading", { name: /From possibilities to the place that fits/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Tell us what matters/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Discover your strongest matches/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Explore destinations deeply/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Compare your finalists/i })).toBeInTheDocument();
    expect(screen.getByText(/Step 05 \/ Move forward with confidence/i)).toBeInTheDocument();
    expect(screen.getByAltText(/real DestinationFinderAI Life Match welcome screen/i)).toHaveAttribute("src", expect.stringContaining("life-match-crop.jpg"));
    expect(screen.getByAltText(/real DestinationFinderAI Lisbon destination guide/i)).toHaveAttribute("src", expect.stringContaining("lisbon-destination-crop.jpg"));
    expect(screen.getByAltText(/real DestinationFinderAI Compare experience/i)).toHaveAttribute("src", expect.stringContaining("compare-board-crop.jpg"));
  });
});

describe("Resources", () => {
  it("groups healthy existing sources and labels official sources explicitly", () => {
    render(<ResourceLinks />);

    expect(screen.getByRole("heading", { name: /Research the move, not just the view/i })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: /Visa & residency/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /Taxes, cost & housing/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Healthcare & safety/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Transportation & access/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Local & climate research/i })).toBeInTheDocument();
    expect(screen.getAllByText("Official source").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /AIMA migration authority/i })).toHaveAttribute("href", "https://aima.gov.pt/en");
    expect(screen.queryByRole("link", { name: /Visa for Italy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Aena airport network/i })).not.toBeInTheDocument();
  });
});