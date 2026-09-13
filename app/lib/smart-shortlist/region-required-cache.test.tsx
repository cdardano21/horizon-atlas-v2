import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import SmartShortlistPrototype from "../../components/smart-shortlist/SmartShortlistPrototype";
import { countryPresets } from "./country-presets";
import { smartShortlistCandidates } from "./cohort";
import { evaluateShortlist } from "./evaluator";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
afterEach(() => { cleanup(); sessionStorage.clear(); vi.useRealTimers(); });
const base = smartShortlistCandidates[0];
it.each([
  ["Belfast", "GB", "europe"], ["Bogotá", "CO", "latinAmerica"], ["Brisbane", "AU", "asiaPacific"],
  ["Ascoli Piceno", "IT", "europe"], ["Puerto Vallarta", "MX", "latinAmerica"], ["Queenstown", "NZ", "asiaPacific"],
] as const)("includes %s by country only", (name, countryCode, region) => {
  expect(evaluateShortlist([{ ...base, name, countryCode }], { includedCountries: [...countryPresets[region].includedCountries] })[0].group).toBe("MEETS_FILTERS");
});
it("preserves US exclusion and cross-region exclusion", () => {
  expect(evaluateShortlist([{ ...base, countryCode: "US" }], { excludedCountries: [...countryPresets.outsideUs.excludedCountries] })[0].group).toBe("EXCLUDED");
  expect(evaluateShortlist([{ ...base, countryCode: "AU" }], { includedCountries: [...countryPresets.europe.includedCountries] })[0].group).toBe("EXCLUDED");
});
it.each([
  ["healthcare", { healthcareMode: "MUST_HAVE", healthcareMinimum: "INTERNATIONAL_STANDARD" }],
  ["safety", { safetyMode: "MUST_HAVE" }],
  ["budget", { budget: "1", requireBudget: true }],
  ["LGBTQ", { lgbtqMode: "MUST_HAVE" }],
  ["residency", { legalPathMode: "MUST_HAVE" }],
  ["mountains", { mountain: "MOUNTAIN_OR_SKI", requireMountain: true }],
  ["geography", { countryPreset: "outsideUs" }],
])("discards stale %s matches, restores answers, and evaluates current exclusions", (_name, patch) => {
  vi.useFakeTimers();
  const candidate = { ...base, healthcareStandard: "BASIC_ACCESS" as const, safetyStandard: "ELEVATED_RISK" as const,
    mountainAccess: "NONE" as const, countryCode: "US", lgbtqLegalProtectionStatus: "NO_LEGAL_PROTECTIONS" as const,
    entryAndStay: { extendedStayOrLongStayVisaAvailable: "NO" as const, permanentResidencyPathAvailable: "NO" as const,
      retirementVisaProgramAvailable: "NO" as const, remoteWorkOrDigitalNomadVisaAvailable: "NO" as const } };
  sessionStorage.setItem("destinationfinder-smart-shortlist-return-v1", JSON.stringify({
    version: 1, countryPreset: "anywhere", household: "single", budget: "", requireBudget: true, displayCurrency: "USD",
    healthcareMode: "NOT_A_FACTOR", healthcareMinimum: "GOOD_PRIVATE_AVAILABLE", safetyMode: "NOT_A_FACTOR",
    safetyMinimum: "MODERATE_OR_BETTER", lgbtqMode: "NOT_A_FACTOR", legalPathMode: "NOT_A_FACTOR",
    requireBeach: false, requireMountain: false, detailTopic: "Setting", showExcluded: false,
    showAllRecommended: false, showAllVerification: false, comparison: [candidate.key],
    results: evaluateShortlist([candidate], {}), ...patch,
  }));
  render(<SmartShortlistPrototype intelligence={[]} candidates={[candidate]} />);
  act(() => vi.runAllTimers());
  expect(screen.queryByRole("heading", { name: candidate.name, exact: true })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Build shortlist" }));
  expect(screen.getByRole("button", { name: "Show excluded places (1)" })).toBeInTheDocument();
  expect(document.querySelector(`article[data-destination-key="${candidate.key}"]`)).toBeNull();
  expect(sessionStorage.getItem("destinationfinder-smart-shortlist-return-v1")).toBeNull();
});
