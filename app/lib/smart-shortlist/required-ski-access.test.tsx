import { hasRequiredSkiAccess, verifiedSkiAccessByDestination } from "../intelligence-v2/ski-access";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SmartShortlistPrototype from "../../components/smart-shortlist/SmartShortlistPrototype";
import { smartShortlistCandidates, type PrototypeCandidate } from "./cohort";
import { evaluateShortlist } from "./evaluator";
import { evaluateShortlistWithOwnedAffordability } from "./owned-affordability-evaluator";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const hoiAn = smartShortlistCandidates.find(d => d.key === "hoi-an-vn")!;
const queenstown = { ...smartShortlistCandidates.find(d => d.key === "queenstown-nz")!, skiAccess: verifiedSkiAccessByDestination["queenstown-nz"]! };
const required = { mountain: "SKI_RESORT_ACCESS" as const, requireMountain: true };
afterEach(() => { cleanup(); sessionStorage.clear(); vi.useRealTimers(); });

describe("Required ski access through Smart Shortlist", () => {
  it.each([
    ["SKI_RESORT_TOWN", "MEETS_FILTERS"], ["SKI_ACCESS_WITHIN_60_MIN", "MEETS_FILTERS"],
    ["NO_QUALIFYING_SKI_ACCESS", "EXCLUDED"], ["UNKNOWN", "EXCLUDED"], [undefined, "EXCLUDED"],
  ])("enforces ski classification %s", (accessType, group) => {
    const candidate = { ...queenstown, skiAccess: { ...queenstown.skiAccess, accessType } } as PrototypeCandidate;
    expect(evaluateShortlist([candidate], required)[0].group).toBe(group);
  });

  it("requires separate official evidence for a resort-town classification", () => {
    expect(hasRequiredSkiAccess({ ...queenstown.skiAccess, resortTownSourceUrl: undefined })).toBe(false);
  });

  it("distinguishes a verified ski town from a metro with nearby skiing in result facts and reasons", () => {
    const sapporo = { ...queenstown, key: "sapporo-japan", skiAccess: verifiedSkiAccessByDestination["sapporo-japan"]! };
    const results = evaluateShortlist([queenstown, sapporo], required);
    expect(results.find(r => r.destination.key === queenstown.key)?.destination.skiAccess?.accessType).toBe("SKI_RESORT_TOWN");
    expect(results.find(r => r.destination.key === sapporo.key)?.destination.skiAccess?.accessType).toBe("SKI_ACCESS_WITHIN_60_MIN");
    expect(results.find(r => r.destination.key === queenstown.key)?.reasons).toContainEqual(expect.objectContaining({ explanation: expect.stringContaining("Ski resort town") }));
    expect(results.find(r => r.destination.key === sapporo.key)?.reasons).toContainEqual(expect.objectContaining({ explanation: expect.stringContaining("Nearby ski access") }));
  });

  it.each(Object.entries(verifiedSkiAccessByDestination))("qualifies verified seed %s", (key, evidence) => {
    expect(hasRequiredSkiAccess(evidence), key).toBe(true);
    expect(evaluateShortlist([{ ...queenstown, key, skiAccess: evidence }], required)[0].group).toBe("MEETS_FILTERS");
  });

  it.each(["NONE", "MOUNTAIN_ACCESS", "UNKNOWN", undefined, null, false, "YES"])("excludes non-affirmative access %s", access => {
    const candidate = { ...hoiAn, mountainAccess: access } as unknown as PrototypeCandidate;
    const [result] = evaluateShortlist([candidate], required);
    expect(result.group).toBe("EXCLUDED");
    expect(result.reasons).toContainEqual(expect.objectContaining({ capability: "mountain", state: "FAIL" }));
  });

  it.each([60, 61, null, undefined, -1, NaN, Infinity])("checks the drive-time boundary %s", minutes => {
    const candidate = { ...queenstown, skiAccess: { ...queenstown.skiAccess, skiResortDriveMinutes: minutes } } as PrototypeCandidate;
    expect(evaluateShortlist([candidate], required)[0].group).toBe(minutes === 60 ? "MEETS_FILTERS" : "EXCLUDED");
  });

  it.each([
    { skiAccessVerified: false }, { resortType: "CROSS_COUNTRY_ONLY" }, { resortType: "INDOOR_ARTIFICIAL" },
    { nearestSkiResortName: "" }, { sourceUrl: "" }, { sourceUrl: "javascript:alert(1)" }, { verifiedAt: "" },
  ])("rejects incomplete or ineligible evidence %j", patch => {
    const candidate = { ...queenstown, skiAccess: { ...queenstown.skiAccess, ...patch } } as PrototypeCandidate;
    expect(evaluateShortlist([candidate], required)[0].group).toBe("EXCLUDED");
  });

  it("does not accept an old affirmative enum without proximity evidence", () => {
    expect(evaluateShortlist([{ ...queenstown, skiAccess: undefined }], required)[0].group).toBe("EXCLUDED");
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
    fireEvent.click(screen.getByRole("button", { name: "Downhill ski resort within about 60 minutes", exact: true }));
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
      results: evaluateShortlist([{ ...queenstown, skiAccess: undefined }], { ...required, requireMountain: false })
        .map(result => ({ ...result, group: "NEEDS_VERIFICATION" })),
    }));
    render(<SmartShortlistPrototype intelligence={[]} candidates={[hoiAn, queenstown]} />);
    act(() => vi.runAllTimers());
    expect(screen.getByRole("heading", { name: "Where would you like to look?" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: hoiAn.name, exact: true })).not.toBeInTheDocument();
  });
});
