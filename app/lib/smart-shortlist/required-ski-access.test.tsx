import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SmartShortlistPrototype from "../../components/smart-shortlist/SmartShortlistPrototype";
import { smartShortlistCandidates, type PrototypeCandidate } from "./cohort";
import { evaluateShortlist } from "./evaluator";
import { evaluateShortlistWithOwnedAffordability } from "./owned-affordability-evaluator";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const hoiAn = smartShortlistCandidates.find(d => d.key === "hoi-an-vn")!;
const queenstown = smartShortlistCandidates.find(d => d.key === "queenstown-nz")!;
const required = { mountain: "SKI_RESORT_ACCESS" as const, requireMountain: true };
afterEach(() => { cleanup(); sessionStorage.clear(); vi.useRealTimers(); });

describe("Required ski access through Smart Shortlist", () => {
  it.each(["NONE", "MOUNTAIN_ACCESS", "UNKNOWN", undefined, null, false, "YES"])("excludes non-affirmative access %s", access => {
    const candidate = { ...hoiAn, mountainAccess: access } as unknown as PrototypeCandidate;
    const [result] = evaluateShortlist([candidate], required);
    expect(result.group).toBe("EXCLUDED");
    expect(result.reasons).toContainEqual(expect.objectContaining({ capability: "mountain", state: "FAIL" }));
  });

  it("admits explicit resort access and excludes the real Hoi An catalog fixture", () => {
    expect(hoiAn.country).toBe("Vietnam");
    expect(queenstown.mountainAccess).toBe("SKI_RESORT_ACCESS");
    const results = evaluateShortlist([hoiAn, queenstown], required);
    expect(results.filter(r => r.group !== "EXCLUDED").map(r => r.destination.key)).toEqual([queenstown.key]);
  });

  it.each([undefined, 100_000])("cannot re-enter through scoring or budget fallback (%s)", amount => {
    const unknown = { ...hoiAn, mountainAccess: "UNKNOWN" as const, lifestyleDimensions: { mountainOutdoorLifestyle: 100 } };
    const results = evaluateShortlistWithOwnedAffordability([unknown, queenstown], required,
      amount ? { amountUsd: amount, household: "single", require: true } : undefined, new Map());
    expect(results.find(r => r.destination.key === hoiAn.key)?.group).toBe("EXCLUDED");
  });

  it("preserves optional ski scoring without excluding destinations", () => {
    const results = evaluateShortlist([hoiAn, queenstown], { ...required, requireMountain: false });
    expect(results.every(r => r.group === "MEETS_FILTERS")).toBe(true);
    expect(results[0].destination.key).toBe(queenstown.key);
    expect(results[0].lifestyleFit.totalScore).toBeGreaterThan(results[1].lifestyleFit.totalScore!);
  });

  it("does not override a failing existing country gate", () => {
    expect(evaluateShortlist([queenstown], { ...required, includedCountries: ["VN"] })[0].group).toBe("EXCLUDED");
  });

  it("submits the real question controls and never displays unknown ski access as a result", () => {
    render(<SmartShortlistPrototype intelligence={[]} candidates={[{ ...hoiAn, mountainAccess: "UNKNOWN" }, queenstown]} />);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Ski-resort access", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Require the selected mountain category" }));
    fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));
    expect(screen.getByRole("heading", { name: queenstown.name, exact: true })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: hoiAn.name, exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Needs verification", exact: true })).not.toBeInTheDocument();
  });

  it("rejects cached results from the old permissive ski policy", () => {
    vi.useFakeTimers();
    sessionStorage.setItem("destinationfinder-smart-shortlist-return-v1", JSON.stringify({
      version: 1, ...required, comparison: [],
      countryPreset: "anywhere", household: "single", budget: "", requireBudget: true, displayCurrency: "USD",
      healthcareMode: "NOT_A_FACTOR", healthcareMinimum: "GOOD_PRIVATE_AVAILABLE",
      safetyMode: "NOT_A_FACTOR", safetyMinimum: "MODERATE_OR_BETTER", lgbtqMode: "NOT_A_FACTOR", legalPathMode: "NOT_A_FACTOR",
      detailTopic: "Setting", requireBeach: false, showExcluded: false, showAllRecommended: false, showAllVerification: false,
      results: evaluateShortlist([{ ...hoiAn, mountainAccess: "UNKNOWN" }], { ...required, requireMountain: false })
        .map(result => ({ ...result, group: "NEEDS_VERIFICATION" })),
    }));
    render(<SmartShortlistPrototype intelligence={[]} candidates={[hoiAn, queenstown]} />);
    act(() => vi.runAllTimers());
    expect(screen.getByRole("heading", { name: "Where would you like to look?" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: hoiAn.name, exact: true })).not.toBeInTheDocument();
  });
});
