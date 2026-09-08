import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
    expect(screen.getByText(/excluded places remain separate/i)).toBeInTheDocument();
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

    const excludedSection = screen.getByRole("heading", { name: "Excluded by a hard requirement" }).closest("section");
    expect(excludedSection).not.toBeNull();
    for (const excludedCard of excludedSection!.querySelectorAll("article")) {
      expect(excludedCard.querySelector('[data-reason-state="FAIL"]')).not.toBeNull();
    }
  });

  it("makes every verification candidate accessible and restores the concise view", () => {
    render(<SmartShortlistPrototype intelligence={intelligence} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(within(screen.getByRole("group", { name: "Healthcare" })).getByRole("button", { name: "Must have" }));
    buildShortlist();

    expect(screen.getByText("12 of 36")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(12);
    const showAll = screen.getByRole("button", { name: "Show all places needing verification (24 more)" });
    expect(showAll).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(showAll);
    expect(screen.getByText("36 of 36")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(36);
    const showFewer = screen.getByRole("button", { name: "Show fewer" });
    expect(showFewer).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(showFewer);
    expect(screen.getByText("12 of 36")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(12);
  });

  it("does not silently hide recommendations beyond the concise view", () => {
    render(<SmartShortlistPrototype intelligence={intelligence} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    buildShortlist();

    expect(screen.getAllByRole("article")).toHaveLength(12);
    fireEvent.click(screen.getByRole("button", { name: "Show all places meeting required filters (24 more)" }));
    expect(screen.getAllByRole("article")).toHaveLength(36);
    fireEvent.click(screen.getByRole("button", { name: "Show fewer places meeting required filters" }));
    expect(screen.getAllByRole("article")).toHaveLength(12);
  });

  it("keeps a supplied Next-20 candidate in the one-result comparison", () => {
    const tivat = {
      ...smartShortlistCandidates[0],
      key: "tivat-montenegro",
      slug: "tivat-montenegro",
      name: "Tivat",
      country: "Montenegro",
      countryCode: "ME",
    };
    const tivatIntelligence = [{ ...intelligence[0], key: tivat.key }];

    render(<SmartShortlistPrototype candidates={[tivat]} intelligence={tivatIntelligence} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    buildShortlist();

    expect(cardFor("Tivat")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1 place side by side" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Tivat/ })).toBeInTheDocument();
  });

  it("restores a completed shortlist after opening a destination guide", async () => {
    const { unmount } = render(<SmartShortlistPrototype intelligence={intelligence} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    buildShortlist();
    const guideLink = screen.getAllByRole("link", { name: /Open destination guide/ })[0];
    guideLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(guideLink);
    unmount();

    render(<SmartShortlistPrototype intelligence={intelligence} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Edit choices" })).toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: "Where would you like to look?" })).not.toBeInTheDocument();
    expect(sessionStorage.getItem("destinationfinder-smart-shortlist-return-v1")).toBeNull();
  });

  it("explains a zero-survivor result and identifies requirements to review", () => {
    const onlyCandidate = smartShortlistCandidates[0];
    render(<SmartShortlistPrototype candidates={[onlyCandidate]} intelligence={[intelligence[0]]} />);
    fireEvent.click(screen.getByRole("button", { name: "Outside the United States" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    buildShortlist();

    expect(screen.getByRole("heading", { name: "No destinations satisfy every selected requirement." })).toBeInTheDocument();
    expect(screen.getByText("Requirements to review first")).toBeInTheDocument();
    expect(screen.getByText("Geography")).toBeInTheDocument();
    expect(screen.getByText("Rules out 1 destination")).toBeInTheDocument();
  });

  it("keeps important-preference failures eligible and labels them as tradeoffs", () => {
    const preferenceIntelligence = intelligence.map((item) => item.key === "san-ramon-costa-rica"
      ? { ...item, safetyStandard: "ELEVATED_RISK" as const }
      : item);
    render(<SmartShortlistPrototype intelligence={preferenceIntelligence} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(within(screen.getByRole("group", { name: "Safety" })).getByRole("button", { name: "Important preference" }));
    buildShortlist();

    expect(screen.getByRole("heading", { name: "Meets your required filters" })).toBeInTheDocument();
    expect(screen.getByText(/Important preferences affect ordering but do not exclude/)).toBeInTheDocument();
    const card = cardFor("San Ramón");
    expect(card).toHaveTextContent("Important-preference tradeoff — Safety · FAIL:");
    expect(card.closest("section")).toHaveTextContent("Meets your required filters");
  });
});
