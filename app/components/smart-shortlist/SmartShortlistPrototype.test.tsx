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

function continueToReview() {
  for (let index = 0; index < 4; index += 1) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

function selectAllEssentialMustHaves() {
  for (const name of ["Healthcare", "Safety", "Residency or long-stay route", "LGBTQ legal protections"]) {
    fireEvent.click(within(screen.getByRole("group", { name })).getByRole("button", { name: "Must have" }));
  }
}

function buildShortlist() {
  continueToReview();
  fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));
}

function cardFor(name: string) {
  const card = screen.getByRole("heading", { name }).closest("article");
  if (!card) throw new Error(`Missing result card for ${name}`);
  return card;
}

describe("Smart Shortlist prototype", () => {
  it("completes exactly six effective screens and shows unpadded results", () => {
    render(<SmartShortlistPrototype intelligence={intelligence} />);
    expect(screen.getByRole("heading", { name: "Where would you like to look?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Which essentials should shape the shortlist?" })).toBeInTheDocument();
    expect(screen.getByText("2 of 6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "What should affordability mean here?" })).toBeInTheDocument();
    expect(screen.getByText(/Estimates above the target but no more than 10% over need verification/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Target monthly budget in USD" }), { target: { value: "4500" } });
    expect(screen.getByRole("combobox", { name: "Supporting display currency" })).toHaveValue("USD");

    for (const heading of ["Which setting would you enjoy?", "Which details should open first?", "What must be met?"]) {
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));
    expect(screen.getByRole("heading", { name: "12 places shown from 36" })).toBeInTheDocument();
    expect(screen.getByText(/Excluded places never enter this list/)).toBeInTheDocument();
    expect(screen.queryByText(/match percentage/i)).toBeInTheDocument();
    expect(screen.getByText("Your target monthly budget: $4,500 USD")).toBeInTheDocument();
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

  it("keeps the four Essentials controls separate and independent", () => {
    render(<SmartShortlistPrototype intelligence={intelligence} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const healthcare = screen.getByRole("group", { name: "Healthcare" });
    const safety = screen.getByRole("group", { name: "Safety" });
    const residency = screen.getByRole("group", { name: "Residency or long-stay route" });
    const lgbtq = screen.getByRole("group", { name: "LGBTQ legal protections" });

    fireEvent.click(within(healthcare).getByRole("button", { name: "Important preference" }));
    expect(within(healthcare).getByRole("button", { name: "Important preference" })).toHaveAttribute("aria-pressed", "true");
    expect(within(safety).getByRole("button", { name: "Not a factor" })).toHaveAttribute("aria-pressed", "true");
    expect(within(residency).getByRole("button", { name: "Not a factor" })).toHaveAttribute("aria-pressed", "true");
    expect(within(lgbtq).getByRole("button", { name: "Not a factor" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(within(safety).getByRole("button", { name: "Must have" }));
    fireEvent.click(within(residency).getByRole("button", { name: "Must have" }));
    fireEvent.click(within(lgbtq).getByRole("button", { name: "Must have" }));
    expect(within(healthcare).getByRole("button", { name: "Important preference" })).toHaveAttribute("aria-pressed", "true");
    expect(within(safety).getByRole("button", { name: "Must have" })).toHaveAttribute("aria-pressed", "true");
    expect(within(residency).getByRole("button", { name: "Must have" })).toHaveAttribute("aria-pressed", "true");
    expect(within(lgbtq).getByRole("button", { name: "Must have" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows The Villages unknown residency even when it is the fifth selected requirement", () => {
    render(<SmartShortlistPrototype intelligence={intelligence} />);
    fireEvent.click(screen.getByRole("button", { name: "United States only" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    selectAllEssentialMustHaves();
    buildShortlist();

    const card = cardFor("The Villages");
    expect(card).toHaveTextContent("Residency or long-stay route · UNKNOWN:");
    expect(within(card).getByText("A suitable long-stay or residency route is not yet verified.")).toBeVisible();

    const details = within(card).getByText(/More details \(1 passing\)/).closest("details");
    expect(details).not.toHaveAttribute("open");
    expect(details?.querySelectorAll('[data-reason-state="PASS"]')).toHaveLength(1);
    expect(details?.querySelector('[data-reason-state="FAIL"], [data-reason-state="UNKNOWN"]')).toBeNull();
    expect(card.querySelectorAll('details [data-reason-state="FAIL"], details [data-reason-state="UNKNOWN"]')).toHaveLength(0);
    expect(card.querySelectorAll(':scope > div [data-reason-state="UNKNOWN"]')).toHaveLength(4);
  });

  it("shows every FAIL and UNKNOWN immediately on excluded cards", () => {
    const intelligenceWithFailure = intelligence.map((item) => item.key === "the-villages-fl-us"
      ? { ...item, safetyStandard: "ELEVATED_RISK" as const }
      : item);
    render(<SmartShortlistPrototype intelligence={intelligenceWithFailure} />);
    fireEvent.click(screen.getByRole("button", { name: "United States only" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    selectAllEssentialMustHaves();
    buildShortlist();
    fireEvent.click(screen.getByRole("button", { name: /Show excluded places/ }));

    const card = cardFor("The Villages");
    expect(card).toHaveTextContent("Healthcare · UNKNOWN:");
    expect(card).toHaveTextContent("Safety · FAIL:");
    expect(card).toHaveTextContent("LGBTQ legal protections · UNKNOWN:");
    expect(card).toHaveTextContent("Residency or long-stay route · UNKNOWN:");
    expect(card.querySelectorAll('details [data-reason-state="FAIL"], details [data-reason-state="UNKNOWN"]')).toHaveLength(0);
  });
});