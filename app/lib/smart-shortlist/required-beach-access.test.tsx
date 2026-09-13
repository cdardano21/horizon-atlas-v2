import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hasRequiredOceanBeach, verifiedBeachAccessByDestination as evidence } from "../intelligence-v2/beach-access";
import SmartShortlistPrototype from "../../components/smart-shortlist/SmartShortlistPrototype";
import { smartShortlistCandidates } from "./cohort";
import { evaluateShortlist } from "./evaluator";
import { evaluateShortlistWithOwnedAffordability } from "./owned-affordability-evaluator";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const keys = ["puerto-vallarta-mx", "hoi-an-vn", "queenstown-nz", "ascoli-piceno-it"];
const candidates = keys.map(key => ({ ...smartShortlistCandidates.find(c => c.key === key)!, beachEvidence: evidence[key] }));
const required = { beach: "OCEAN_COASTAL" as const, requireBeach: true };
afterEach(() => { cleanup(); sessionStorage.clear(); vi.useRealTimers(); });
describe("Required ocean beach contract", () => {
  it("loads the proof evidence through the actual registered workbook runtime", async () => {
    vi.resetModules();
    // The loader requires facts for every seed candidate. Scope its seed cohort too,
    // so this integration test covers only the selected real registry workbooks.
    vi.doMock("./cohort", async () => ({ ...await vi.importActual("./cohort"), smartShortlistCandidates: [] }));
    const { loadSmartShortlistData } = await import("./server-data");
    const { EXPANSION_WORKBOOK_REGISTRY } = await import("../expansion-workbook-registry");
    // Test real registered beach destinations without traversing unrelated legacy batches.
    const integrationKeys = ["alicante-spain", "gijon-spain"];
    const registry = EXPANSION_WORKBOOK_REGISTRY.filter(entry => integrationKeys.some(key => entry.expectedDestinationKeys.includes(key)));
    expect(registry).toHaveLength(2);
    const loaded = await loadSmartShortlistData(registry).finally(() => {
      vi.doUnmock("./cohort");
      vi.resetModules();
    });
    for (const key of integrationKeys) expect(loaded.intelligence.find(i => i.key === key)?.beachEvidence, key).toEqual(evidence[key]);
    const facts = loaded.candidates.map(c => ({ ...c, ...loaded.intelligence.find(i => i.key === c.key) }));
    expect(evaluateShortlist(facts, required).filter(r => r.group === "MEETS_FILTERS").map(r => r.destination.key).sort()).toEqual(["alicante-spain", "gijon-spain"].sort());
  }, 30000);
  it("admits the ocean destination and excludes lake, nearby and inland legacy categories", () => {
    const results = evaluateShortlistWithOwnedAffordability(candidates, required, undefined, new Map());
    expect(results.map(r => [r.destination.key, r.group])).toEqual([
      ["puerto-vallarta-mx", "MEETS_FILTERS"], ["ascoli-piceno-it", "EXCLUDED"],
      ["hoi-an-vn", "EXCLUDED"], ["queenstown-nz", "EXCLUDED"],
    ]);
  });
  it.each(["DIRECT_ACCESS", "NEARBY_OR_DIRECT", "OCEAN_COASTAL"] as const)("fails missing evidence closed for required %s", beach => {
    expect(evaluateShortlist([{ ...candidates[0], beachEvidence: undefined }], { beach, requireBeach: true })[0].group).toBe("EXCLUDED");
  });
  it.each(["LAKE_BEACH_ACCESS", "OCEAN_BEACH_ACCESS_NEARBY", "NO_QUALIFYING_BEACH_ACCESS", "UNKNOWN"] as const)("rejects %s even with a short drive", accessType => {
    expect(hasRequiredOceanBeach({ ...evidence["puerto-vallarta-mx"]!, accessType, driveMinutes: 1 })).toBe(false);
  });
  it.each([{ verified: false }, { beachName: "" }, { waterType: "FRESHWATER" as const }, { sourceUrl: "javascript:x" }, { sourceName: "" }, { verifiedAt: "" }])("rejects incomplete evidence %j", patch => {
    expect(hasRequiredOceanBeach({ ...evidence["puerto-vallarta-mx"]!, ...patch })).toBe(false);
  });
  it.each([0, 45, 46, null, undefined, -1, NaN, Infinity])("enforces the 45-minute road boundary: %s", minutes => {
    const nearby = { ...evidence["hoi-an-vn"]!, driveMinutes: minutes } as typeof evidence[string];
    expect(hasRequiredOceanBeach(nearby, true)).toBe(minutes === 0 || minutes === 45);
    expect(hasRequiredOceanBeach(nearby)).toBe(false);
  });
  it("keeps lake and unknown types excluded even when nearby is allowed", () => {
    for (const accessType of ["LAKE_BEACH_ACCESS", "UNKNOWN", "NO_QUALIFYING_BEACH_ACCESS"] as const)
      expect(hasRequiredOceanBeach({ ...evidence["puerto-vallarta-mx"]!, accessType, driveMinutes: 1 }, true)).toBe(false);
  });
  it("admits nearby evidence only with the nearby selection and never revives a failure through budget", () => {
    const nearby = { ...candidates[0], key: "merida-mexico", beachEvidence: evidence["merida-mexico"] };
    expect(evaluateShortlist([nearby], required)[0].group).toBe("EXCLUDED");
    expect(evaluateShortlist([nearby], { beach: "NEARBY_OR_DIRECT", requireBeach: true })[0].group).toBe("MEETS_FILTERS");
    expect(evaluateShortlistWithOwnedAffordability([nearby], required, { amountUsd: 100000, household: "single", require: true }, new Map())[0].group).toBe("EXCLUDED");
  });
  it("preserves soft beach scoring exactly with or without new evidence", () => {
    const soft = { beach: "NEARBY_OR_DIRECT" as const };
    const before = evaluateShortlist(candidates.map(c => ({ ...c, beachEvidence: undefined })), soft);
    const after = evaluateShortlist(candidates, soft);
    expect(after.map(r => [r.destination.key, r.group, r.lifestyleFit])).toEqual(before.map(r => [r.destination.key, r.group, r.lifestyleFit]));
  });
  it("submits the actual ocean question and excludes lake and nearby results", () => {
    render(<SmartShortlistPrototype intelligence={[]} candidates={candidates} />);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Ocean/sea beach destination", exact: true }));
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));
    expect(screen.getByRole("heading", { name: candidates[0].name, exact: true })).toBeInTheDocument();
    for (const c of candidates.slice(1)) expect(screen.queryByRole("heading", { name: c.name, exact: true })).not.toBeInTheDocument();
  });
  it.each([{ beach: "OCEAN_COASTAL", requireBeach: false }, { beach: "DIRECT_ACCESS", requireBeach: true }])("discards stale required results %j before a fresh submission", profile => {
    vi.useFakeTimers();
    sessionStorage.setItem("destinationfinder-smart-shortlist-return-v1", JSON.stringify({ version: 1, ...profile, comparison: [], results: evaluateShortlist(candidates, {}) }));
    render(<SmartShortlistPrototype intelligence={[]} candidates={candidates} />);
    act(() => vi.runAllTimers());
    expect(screen.getByRole("heading", { name: "Where would you like to look?" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: candidates[2].name, exact: true })).not.toBeInTheDocument();
    expect(sessionStorage.getItem("destinationfinder-smart-shortlist-return-v1")).toBeNull();
  });
});
