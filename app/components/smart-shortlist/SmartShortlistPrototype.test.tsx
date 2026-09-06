import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { smartShortlistCandidates } from "../../lib/smart-shortlist/cohort";
import SmartShortlistPrototype from "./SmartShortlistPrototype";

const intelligence = smartShortlistCandidates.map((candidate) => ({
  key: candidate.key,
  beachAccess: candidate.beachAccess,
  mountainAccess: candidate.mountainAccess,
  oceanAccess: "UNKNOWN" as const,
  healthcareStandard: "UNKNOWN" as const,
  safetyStandard: "UNKNOWN" as const,
  lgbtqLegalProtectionStatus: "UNKNOWN" as const,
  entryAndStay: {
    extendedStayOrLongStayVisaAvailable: "UNKNOWN" as const,
    permanentResidencyPathAvailable: "UNKNOWN" as const,
    retirementVisaProgramAvailable: "UNKNOWN" as const,
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN" as const,
  },
  lifestyleDimensions: {},
}));

describe("Smart Shortlist prototype", () => {
  it("completes exactly six effective screens and shows unpadded results", () => {
    render(<SmartShortlistPrototype intelligence={intelligence} />);
    expect(screen.getByRole("heading", { name: "Where would you like to look?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Which essentials should shape the shortlist?" })).toBeInTheDocument();
    expect(screen.getByText("2 of 6")).toBeInTheDocument();
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
    expect(screen.getByText(/Excluded places never enter this list/)).toBeInTheDocument();
    expect(screen.queryByText(/match percentage/i)).toBeInTheDocument();
    expect(screen.getByText("Your decision budget: $4,500 USD")).toBeInTheDocument();
    expect(screen.getByText(/Supporting local-cost conversion uses one deterministic fixture/)).toBeInTheDocument();
    expect(screen.getByText(/Estimated comfortable monthly living cost in 2026 USD/)).toBeInTheDocument();
    expect(screen.getAllByText("Deterministic architecture fixture (not live)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Estimated total monthly living cost")).toHaveLength(12);
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

  it("uses Details only to choose the first comparison section", () => {
    render(<SmartShortlistPrototype intelligence={intelligence} />);
    for (let index = 0; index < 4; index += 1) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Cost evidence" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));

    expect(document.querySelector("tbody tr")?.getAttribute("data-comparison-section")).toBe("Cost evidence");
  });

  it("lets essential must-haves move unknown evidence to Needs verification", () => {
    render(<SmartShortlistPrototype intelligence={intelligence} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    const healthcare = screen.getByRole("group", { name: "Healthcare" });
    fireEvent.click(within(healthcare).getByRole("button", { name: "Must have" }));
    for (let index = 0; index < 4; index += 1) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));

    expect(screen.getByRole("heading", { name: "Needs verification" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Meets your selected filters" })).not.toBeInTheDocument();
  });
});