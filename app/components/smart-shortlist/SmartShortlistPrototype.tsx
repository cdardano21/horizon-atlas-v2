"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { smartShortlistCandidates, type PrototypeCandidate } from "../../lib/smart-shortlist/cohort";
import { convertRangeForDisplay, U3_R3_FIXTURE_SNAPSHOT } from "../../lib/smart-shortlist/exchange-rates";
import type { EssentialRequirementMode, EvaluatedDestination, HardOnlyRequirementMode, ShortlistProfile } from "../../lib/smart-shortlist/evaluator";
import type { HealthcareMinimumStandard, SafetyMinimumStandard } from "../../lib/intelligence-v2/profile-types";
import { evaluateShortlistWithOwnedAffordability, type OwnedEvaluatedDestination } from "../../lib/smart-shortlist/owned-affordability-evaluator";
import { ownedAffordabilityByDestination } from "../../lib/smart-shortlist/owned-affordability-records";
import { AFFORDABILITY_ESTIMATE_DEFINITION } from "../../lib/smart-shortlist/owned-affordability";
import type { SmartShortlistIntelligence } from "../../lib/smart-shortlist/server-data";
import DualCurrencyCostEvidence from "./DualCurrencyCostEvidence";
import OwnedAffordabilityEvidence from "./OwnedAffordabilityEvidence";

const steps = ["Where", "Essentials", "Affordability", "Setting", "Details", "Review"] as const;
const detailTopics = ["Setting", "Affordability", "Cost evidence"] as const;
const countryPresets = {
  anywhere: {},
  us: { includedCountries: ["US"] },
  outsideUs: { excludedCountries: ["US"] },
  europe: { includedCountries: ["AL", "BG", "CY", "ES", "FR", "GR", "HR", "IT", "NL", "PT"] },
  latinAmerica: { includedCountries: ["BR", "CR", "DO", "EC", "MX", "PA", "UY"] },
  asiaPacific: { includedCountries: ["JP", "MY", "NZ", "PH", "TH", "VN"] },
} as const;

type CountryPreset = keyof typeof countryPresets;
type DetailTopic = typeof detailTopics[number];

const controlClass = "w-full border border-[var(--atlas-border)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--atlas-ink)] transition hover:border-[var(--atlas-accent)] disabled:cursor-not-allowed disabled:opacity-45";
const selectClass = "mt-2 w-full border border-[var(--atlas-border)] bg-white px-3 py-3";
const snapshot = U3_R3_FIXTURE_SNAPSHOT;
const snapshotAsOfDate = "2026-09-06";

function formatMoney(value: number | bigint, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function localTotal(candidate: PrototypeCandidate, household: "single" | "couple") {
  return candidate.localTotals[household];
}

function convertedTotal(candidate: PrototypeCandidate, household: "single" | "couple", displayCurrency: string) {
  const total = localTotal(candidate, household);
  if (!total) return null;
  return convertRangeForDisplay({
    low: total.monthlyLow,
    high: total.monthlyHigh,
    baseCurrency: total.currency,
    displayCurrency,
    snapshot,
    asOfDate: snapshotAsOfDate,
  });
}

function groupCopy(group: EvaluatedDestination["group"], noFilters: boolean) {
  if (group === "MEETS_FILTERS") return noFilters ? "Places to explore" : "Meets your required filters";
  if (group === "NEEDS_VERIFICATION") return "Needs verification";
  return "Excluded by a hard requirement";
}

const reasonLabels: Record<EvaluatedDestination["reasons"][number]["capability"], string> = {
  affordability: "Affordability",
  beach: "Beach access",
  country: "Geography",
  healthcare: "Healthcare",
  legalPath: "Residency or long-stay route",
  lgbtq: "LGBTQ legal protections",
  mountain: "Mountain access",
  ocean: "Ocean or coastal access",
  safety: "Safety",
};

function RequirementReasons({ reasons, preferenceCapabilities }: {
  reasons: EvaluatedDestination["reasons"];
  preferenceCapabilities: ReadonlySet<EvaluatedDestination["reasons"][number]["capability"]>;
}) {
  const decisiveReasons = reasons.filter((reason) => reason.state !== "PASS");
  const passingReasons = reasons.filter((reason) => reason.state === "PASS");
  const visiblePassingReasons = passingReasons.slice(0, Math.max(0, 4 - decisiveReasons.length));
  const additionalPassingReasons = passingReasons.slice(visiblePassingReasons.length);
  const renderReason = (reason: EvaluatedDestination["reasons"][number]) => {
    const preferenceTradeoff = reason.state === "FAIL" && preferenceCapabilities.has(reason.capability);
    return (
      <li key={reason.capability} data-reason-state={reason.state} data-preference-tradeoff={preferenceTradeoff || undefined}>
        <span className="font-bold text-[var(--atlas-ink)]">{preferenceTradeoff ? "Important-preference tradeoff — " : ""}{reasonLabels[reason.capability]} · {reason.state}:</span> {reason.explanation}
      </li>
    );
  };

  return (
    <div className="mt-4 text-xs text-[var(--atlas-muted)]">
      <ul aria-label="Requirement explanations" className="space-y-1">
        {[...decisiveReasons, ...visiblePassingReasons].map(renderReason)}
      </ul>
      {additionalPassingReasons.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer font-bold text-[var(--atlas-accent)]">More details ({additionalPassingReasons.length} passing)</summary>
          <ul className="mt-2 space-y-1 pl-3">{additionalPassingReasons.map(renderReason)}</ul>
        </details>
      )}
    </div>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`${controlClass} ${active ? "border-[var(--atlas-accent)] bg-[#e8f0eb] text-[var(--atlas-accent)]" : ""}`}>
      {children}
    </button>
  );
}

function RequirementModeButtons({ value, onChange, allowPreference = true }: {
  value: EssentialRequirementMode;
  onChange: (value: EssentialRequirementMode | HardOnlyRequirementMode) => void;
  allowPreference?: boolean;
}) {
  return (
    <div className={`grid gap-2 ${allowPreference ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      <ChoiceButton active={value === "NOT_A_FACTOR"} onClick={() => onChange("NOT_A_FACTOR")}>Not a factor</ChoiceButton>
      {allowPreference && <ChoiceButton active={value === "IMPORTANT_PREFERENCE"} onClick={() => onChange("IMPORTANT_PREFERENCE")}>Important preference</ChoiceButton>}
      <ChoiceButton active={value === "MUST_HAVE"} onClick={() => onChange("MUST_HAVE")}>Must have</ChoiceButton>
    </div>
  );
}

export default function SmartShortlistPrototype({ intelligence }: { intelligence: readonly SmartShortlistIntelligence[] }) {
  const [step, setStep] = useState(0);
  const [countryPreset, setCountryPreset] = useState<CountryPreset>("anywhere");
  const [household, setHousehold] = useState<"single" | "couple">("single");
  const [budget, setBudget] = useState("");
  const [requireBudget, setRequireBudget] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [healthcareMode, setHealthcareMode] = useState<EssentialRequirementMode>("NOT_A_FACTOR");
  const [healthcareMinimum, setHealthcareMinimum] = useState<HealthcareMinimumStandard>("GOOD_PRIVATE_AVAILABLE");
  const [safetyMode, setSafetyMode] = useState<EssentialRequirementMode>("NOT_A_FACTOR");
  const [safetyMinimum, setSafetyMinimum] = useState<SafetyMinimumStandard>("MODERATE_OR_BETTER");
  const [lgbtqMode, setLgbtqMode] = useState<HardOnlyRequirementMode>("NOT_A_FACTOR");
  const [legalPathMode, setLegalPathMode] = useState<HardOnlyRequirementMode>("NOT_A_FACTOR");
  const [beach, setBeach] = useState<ShortlistProfile["beach"]>();
  const [mountain, setMountain] = useState<ShortlistProfile["mountain"]>();
  const [detailTopic, setDetailTopic] = useState<DetailTopic>("Setting");
  const [requireBeach, setRequireBeach] = useState(false);
  const [requireMountain, setRequireMountain] = useState(false);
  const [results, setResults] = useState<OwnedEvaluatedDestination[] | null>(null);
  const [comparison, setComparison] = useState<string[]>([]);
  const [showExcluded, setShowExcluded] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);
  const [showAllVerification, setShowAllVerification] = useState(false);

  const intelligenceByKey = new Map(intelligence.map((item) => [item.key, item]));
  const candidates = smartShortlistCandidates.map((candidate) => ({
    ...candidate,
    ...intelligenceByKey.get(candidate.key),
  }));
  const geography = countryPresets[countryPreset];

  const profile: ShortlistProfile = {
    includedCountries: "includedCountries" in geography ? [...geography.includedCountries] : undefined,
    excludedCountries: "excludedCountries" in geography ? [...geography.excludedCountries] : undefined,
    beach,
    requireBeach,
    mountain,
    requireMountain,
    healthcare: { mode: healthcareMode, minimum: healthcareMinimum },
    safety: { mode: safetyMode, minimum: safetyMinimum },
    lgbtqLegalSafety: { mode: lgbtqMode },
    documentedLongStayPath: { mode: legalPathMode },
  };

  const submit = () => {
    const evaluated = evaluateShortlistWithOwnedAffordability(
      candidates,
      profile,
      budget && Number(budget) > 0 ? {
        amountUsd: Number(budget),
        household,
        require: requireBudget,
      } : undefined,
    );
    setResults(evaluated);
    setComparison(evaluated.filter((item) => item.group === "MEETS_FILTERS").slice(0, 3).map((item) => item.destination.key));
  };

  const toggleComparison = (key: string) => {
    setComparison((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : current.length < 4 ? [...current, key] : current);
  };

  const allRecommendedResults = results?.filter((item) => item.group === "MEETS_FILTERS") ?? [];
  const initialRecommendedCount = Math.min(12, allRecommendedResults.length);
  const recommendedResults = showAllRecommended ? allRecommendedResults : allRecommendedResults.slice(0, initialRecommendedCount);
  const additionalRecommendedCount = allRecommendedResults.length - recommendedResults.length;
  const verificationResults = results?.filter((item) => item.group === "NEEDS_VERIFICATION") ?? [];
  const initialVerificationCount = Math.max(0, 12 - initialRecommendedCount);
  const visibleVerificationResults = showAllVerification
    ? verificationResults
    : verificationResults.slice(0, initialVerificationCount);
  const additionalVerificationCount = verificationResults.length - visibleVerificationResults.length;
  const displayedResults = [...recommendedResults, ...visibleVerificationResults];
  const excludedResults = results?.filter((item) => item.group === "EXCLUDED") ?? [];
  const preferenceCapabilities = new Set<EvaluatedDestination["reasons"][number]["capability"]>([
    ...(healthcareMode === "IMPORTANT_PREFERENCE" ? ["healthcare" as const] : []),
    ...(safetyMode === "IMPORTANT_PREFERENCE" ? ["safety" as const] : []),
  ]);
  const noFilters = !profile.includedCountries && !profile.excludedCountries && !beach && !mountain && !budget
    && healthcareMode === "NOT_A_FACTOR" && safetyMode === "NOT_A_FACTOR"
    && lgbtqMode === "NOT_A_FACTOR" && legalPathMode === "NOT_A_FACTOR";
  const comparisonRows = comparison
    .map((key) => smartShortlistCandidates.find((candidate) => candidate.key === key))
    .filter((candidate): candidate is PrototypeCandidate => Boolean(candidate));
  const comparisonTopicOrder = [detailTopic, ...detailTopics.filter((topic) => topic !== detailTopic)];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8f4ec_0%,#eef2ec_52%,#f4ead8_100%)] pb-20">
      <header className="border-b border-[var(--atlas-border)] bg-[rgba(255,253,247,0.9)]">
        <div className="atlas-section flex min-h-20 items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3" aria-label="DestinationFinderAI home">
            <Image src="/brand/destinationfinder-ai-logo.png" alt="" width={42} height={42} className="h-10 w-10 object-contain" />
            <span className="font-display text-xl font-semibold">Smart Shortlist</span>
          </Link>
          <span className="border border-[#bd7b36] bg-[#fff3df] px-3 py-1 text-xs font-bold uppercase text-[#774719]">Local prototype</span>
        </div>
      </header>

      <div className="atlas-section pt-10">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase text-[var(--atlas-accent)]">36 deeply researched places</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Find places worth a closer look.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--atlas-muted)]">Choose a few boundaries, then inspect the evidence and tradeoffs. Unknown facts stay visible. No overall match percentage.</p>
          </div>
          <Link href="/destinations" className="text-sm font-bold text-[var(--atlas-accent)] underline decoration-[var(--atlas-gold)] underline-offset-4">Browse the full catalog</Link>
        </div>

        {!results ? (
          <section className="border border-[var(--atlas-border)] bg-[rgba(255,253,247,0.88)] shadow-[var(--atlas-shadow)]">
            <div className="grid border-b border-[var(--atlas-border)] sm:grid-cols-6">
              {steps.map((label, index) => (
                <button key={label} type="button" onClick={() => index <= step && setStep(index)} disabled={index > step} className={`min-h-14 border-b border-[var(--atlas-border)] px-3 text-left text-xs font-bold uppercase sm:border-b-0 sm:border-r ${index === step ? "bg-[var(--atlas-accent)] text-white" : "bg-white/60 text-[var(--atlas-muted)]"}`}>
                  <span className="mr-2 opacity-60">{index + 1}</span>{label}
                </button>
              ))}
            </div>

            <div className="min-h-[440px] p-6 sm:p-10">
              {step === 0 && (
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">{step + 1} of {steps.length}</p>
                  <h2 className="mt-2 text-3xl font-semibold">Where would you like to look?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">This is geographic scope only. It does not establish citizenship, residency, tax, or work eligibility.</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <ChoiceButton active={countryPreset === "anywhere"} onClick={() => setCountryPreset("anywhere")}>Anywhere in the profiled set</ChoiceButton>
                    <ChoiceButton active={countryPreset === "us"} onClick={() => setCountryPreset("us")}>United States only</ChoiceButton>
                    <ChoiceButton active={countryPreset === "outsideUs"} onClick={() => setCountryPreset("outsideUs")}>Outside the United States</ChoiceButton>
                    <ChoiceButton active={countryPreset === "europe"} onClick={() => setCountryPreset("europe")}>Europe</ChoiceButton>
                    <ChoiceButton active={countryPreset === "latinAmerica"} onClick={() => setCountryPreset("latinAmerica")}>Latin America</ChoiceButton>
                    <ChoiceButton active={countryPreset === "asiaPacific"} onClick={() => setCountryPreset("asiaPacific")}>Asia Pacific</ChoiceButton>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="max-w-4xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">{step + 1} of {steps.length}</p>
                  <h2 className="mt-2 text-3xl font-semibold">Which essentials should shape the shortlist?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">Must-haves exclude explicit failures and send unknown evidence to Needs verification. Healthcare and safety can also use the existing V2 preference scores. Legal-path and LGBTQ evidence remain hard-only because no approved soft score exists.</p>
                  <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    <fieldset className="border border-[var(--atlas-border)] bg-white p-4">
                      <legend className="px-1 text-lg font-semibold">Healthcare</legend>
                      <RequirementModeButtons value={healthcareMode} onChange={(value) => setHealthcareMode(value as EssentialRequirementMode)} />
                      <label className="mt-4 block text-sm font-semibold">Minimum standard (must-have only)<select aria-label="Minimum healthcare standard" value={healthcareMinimum} onChange={(event) => setHealthcareMinimum(event.target.value as HealthcareMinimumStandard)} disabled={healthcareMode !== "MUST_HAVE"} className={selectClass}><option value="BASIC_ACCESS">Basic access</option><option value="GOOD_PRIVATE_AVAILABLE">Good private care available</option><option value="INTERNATIONAL_STANDARD">International standard</option></select></label>
                    </fieldset>
                    <fieldset className="border border-[var(--atlas-border)] bg-white p-4">
                      <legend className="px-1 text-lg font-semibold">Safety</legend>
                      <RequirementModeButtons value={safetyMode} onChange={(value) => setSafetyMode(value as EssentialRequirementMode)} />
                      <label className="mt-4 block text-sm font-semibold">Minimum standard (must-have only)<select aria-label="Minimum safety standard" value={safetyMinimum} onChange={(event) => setSafetyMinimum(event.target.value as SafetyMinimumStandard)} disabled={safetyMode !== "MUST_HAVE"} className={selectClass}><option value="MODERATE_OR_BETTER">Moderate or better</option><option value="HIGH_SAFETY_ONLY">High safety only</option></select></label>
                    </fieldset>
                    <fieldset className="border border-[var(--atlas-border)] bg-white p-4">
                      <legend className="px-1 text-lg font-semibold">Residency or long-stay route</legend>
                      <p className="mb-3 text-xs leading-5 text-[var(--atlas-muted)]">Checks whether a structured route is documented. It does not promise personal eligibility.</p>
                      <RequirementModeButtons value={legalPathMode} allowPreference={false} onChange={(value) => setLegalPathMode(value as HardOnlyRequirementMode)} />
                    </fieldset>
                    <fieldset className="border border-[var(--atlas-border)] bg-white p-4">
                      <legend className="px-1 text-lg font-semibold">LGBTQ legal protections</legend>
                      <p className="mb-3 text-xs leading-5 text-[var(--atlas-muted)]">Uses legal-protection status only, not a claim about every right or lived experience.</p>
                      <RequirementModeButtons value={lgbtqMode} allowPreference={false} onChange={(value) => setLgbtqMode(value as HardOnlyRequirementMode)} />
                    </fieldset>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="max-w-4xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">{step + 1} of {steps.length}</p>
                  <h2 className="mt-2 text-3xl font-semibold">What should affordability mean here?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">Enter one target monthly budget in USD. Estimates at or below the target are eligible. Estimates above the target but no more than 10% over need verification; estimates more than 10% over are excluded when budget is required. Local-currency costs remain supporting evidence.</p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <label className="text-sm font-semibold">Target monthly budget (USD)<input aria-label="Target monthly budget in USD" inputMode="numeric" value={budget} onChange={(event) => setBudget(event.target.value.replace(/[^0-9]/g, ""))} placeholder="Optional" className={selectClass} /></label>
                    <label className="text-sm font-semibold">Supporting display currency<select aria-label="Supporting display currency" value={displayCurrency} onChange={(event) => setDisplayCurrency(event.target.value)} className={selectClass}><option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option><option>MXN</option><option>THB</option><option>VND</option></select></label>
                    <label className="text-sm font-semibold">Household<select aria-label="Household" value={household} onChange={(event) => setHousehold(event.target.value as "single" | "couple")} className={selectClass}><option value="single">One adult</option><option value="couple">Two adults</option></select></label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">{step + 1} of {steps.length}</p>
                  <h2 className="mt-2 text-3xl font-semibold">Which setting would you enjoy?</h2>
                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div><h3 className="text-lg font-semibold">Beach access</h3><p className="mb-3 mt-1 text-xs text-[var(--atlas-muted)]">General beach access may include lakes. Ocean access requires explicit coastal evidence.</p><div className="grid gap-2"><ChoiceButton active={!beach} onClick={() => setBeach(undefined)}>No preference</ChoiceButton><ChoiceButton active={beach === "DIRECT_ACCESS"} onClick={() => setBeach("DIRECT_ACCESS")}>Direct beach access</ChoiceButton><ChoiceButton active={beach === "NEARBY_OR_DIRECT"} onClick={() => setBeach("NEARBY_OR_DIRECT")}>Nearby beach is enough</ChoiceButton><ChoiceButton active={beach === "OCEAN_COASTAL"} onClick={() => { setBeach("OCEAN_COASTAL"); setRequireBeach(true); }}>Ocean or coastal beach access</ChoiceButton></div></div>
                    <div><h3 className="text-lg font-semibold">Mountains</h3><p className="mb-3 mt-1 text-xs text-[var(--atlas-muted)]">Broad category, not a travel-time or snow promise.</p><div className="grid gap-2"><ChoiceButton active={!mountain} onClick={() => setMountain(undefined)}>No preference</ChoiceButton><ChoiceButton active={mountain === "MOUNTAIN_OR_SKI"} onClick={() => setMountain("MOUNTAIN_OR_SKI")}>Mountain scenery or ski access</ChoiceButton><ChoiceButton active={mountain === "SKI_RESORT_ACCESS"} onClick={() => setMountain("SKI_RESORT_ACCESS")}>Ski-resort access</ChoiceButton></div></div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">{step + 1} of {steps.length}</p>
                  <h2 className="mt-2 text-3xl font-semibold">Which details should open first?</h2>
                  <p className="mt-3 text-sm text-[var(--atlas-muted)]">Choose one verified comparison section. This changes presentation only, never eligibility or rank.</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {detailTopics.map((topic) => <ChoiceButton key={topic} active={detailTopic === topic} onClick={() => setDetailTopic(topic)}>{topic}</ChoiceButton>)}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">{step + 1} of {steps.length}</p>
                  <h2 className="mt-2 text-3xl font-semibold">What must be met?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">Only supported choices can become requirements. Unknown evidence moves a place to Needs verification, never to confirmed results.</p>
                  <div className="mt-8 grid gap-3">
                    {beach && beach !== "OCEAN_COASTAL" && <label className="flex items-center gap-3 border border-[var(--atlas-border)] bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={requireBeach} onChange={(event) => setRequireBeach(event.target.checked)} /> Require the selected beach category</label>}
                    {beach === "OCEAN_COASTAL" && <p className="border border-[var(--atlas-border)] bg-white p-4 text-sm font-semibold">Ocean or coastal beach access is a hard requirement. Missing evidence cannot produce a confirmed recommendation.</p>}
                    {mountain && <label className="flex items-center gap-3 border border-[var(--atlas-border)] bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={requireMountain} onChange={(event) => setRequireMountain(event.target.checked)} /> Require the selected mountain category</label>}
                    {budget && <label className="flex items-center gap-3 border border-[var(--atlas-border)] bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={requireBudget} onChange={(event) => setRequireBudget(event.target.checked)} /> Use the target monthly budget as a requirement (up to 10% above needs verification; more than 10% above is excluded)</label>}
                    {!beach && !mountain && !budget && healthcareMode === "NOT_A_FACTOR" && safetyMode === "NOT_A_FACTOR" && lgbtqMode === "NOT_A_FACTOR" && legalPathMode === "NOT_A_FACTOR" && <p className="border border-[var(--atlas-border)] bg-white p-5 text-sm">No requirements selected. Results will be a neutral, canonical list rather than a personal-fit ranking.</p>}
                  </div>
                  <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-bold">Geography</dt><dd className="text-[var(--atlas-muted)]">{countryPreset}</dd></div><div><dt className="font-bold">Compare first</dt><dd className="text-[var(--atlas-muted)]">{detailTopic}</dd></div></dl>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--atlas-border)] bg-white/60 p-5 sm:px-10">
              <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="px-4 py-3 text-sm font-bold text-[var(--atlas-muted)] disabled:opacity-30">Back</button>
              {step < steps.length - 1
                ? <button type="button" onClick={() => setStep((current) => current + 1)} className="bg-[var(--atlas-accent)] px-6 py-3 text-sm font-bold text-white">Continue</button>
                : <button type="button" onClick={submit} className="bg-[var(--atlas-accent)] px-6 py-3 text-sm font-bold text-white">Build shortlist</button>}
            </div>
          </section>
        ) : (
          <div className="space-y-10">
            <section className="flex flex-wrap items-end justify-between gap-4 border-y border-[var(--atlas-border)] bg-white/65 px-5 py-6">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--atlas-accent)]">Evidence-first results</p>
                <h2 className="mt-2 text-3xl font-semibold">{displayedResults.length} places shown from 36</h2>
                <p className="mt-2 text-sm text-[var(--atlas-muted)]">An initial set of places meeting required filters is shown, followed by places needing verification. Counted controls reveal every additional result; excluded places remain separate.</p>
                <p className="mt-1 text-xs text-[var(--atlas-muted)]">Lifestyle scores use only supported selected preferences. Equal scores remain equal; destination key is only the final deterministic tie-breaker.</p>
                <p className="mt-1 text-xs text-[var(--atlas-muted)]">Important preferences affect ordering but do not exclude a destination. Confirmed mismatches are labeled as tradeoffs.</p>
                <p className="mt-2 text-sm font-semibold">Your target monthly budget: {budget ? `${formatMoney(Number(budget), "USD")} USD` : "Not entered"}</p>
                <p className="mt-1 text-xs text-[var(--atlas-muted)]">{household === "single" ? "One adult" : "Two adults"}</p>
              </div>
              <button type="button" onClick={() => { setResults(null); setStep(0); setComparison([]); setShowExcluded(false); setShowAllRecommended(false); setShowAllVerification(false); }} className="border border-[var(--atlas-accent)] px-5 py-3 text-sm font-bold text-[var(--atlas-accent)]">Edit choices</button>
            </section>

            <section className="border border-[#bd7b36] bg-[#fff8ea] p-5 text-sm">
              <p className="font-bold text-[#774719]">About these estimates</p>
              <p className="mt-1 text-[var(--atlas-muted)]">{AFFORDABILITY_ESTIMATE_DEFINITION}</p>
              <p className="mt-2 text-xs text-[var(--atlas-muted)]">Supporting local-cost conversion uses one deterministic fixture for the session and does not change the USD affordability estimate.</p>
              <p className="mt-2 text-xs text-[var(--atlas-muted)]">Missing pairs show conversion unavailable. Stale rates retain their effective date and a visible warning. Weekends and declared market holidays do not consume freshness days.</p>
            </section>

            {(["MEETS_FILTERS", "NEEDS_VERIFICATION"] as const).map((group) => {
              const items = group === "MEETS_FILTERS" ? recommendedResults : visibleVerificationResults;
              if (group === "MEETS_FILTERS" ? !items.length : !verificationResults.length) return null;
              return (
                <section key={group}>
                  <div className="mb-4 flex items-baseline justify-between gap-4"><div><h2 className="text-2xl font-semibold">{groupCopy(group, noFilters)}</h2>{group === "MEETS_FILTERS" && !noFilters && <p className="mt-1 text-xs text-[var(--atlas-muted)]">These places passed every selected requirement. Important preferences affect their order and may still show tradeoffs.</p>}</div><span className="shrink-0 text-sm text-[var(--atlas-muted)]">{group === "NEEDS_VERIFICATION" ? `${items.length} of ${verificationResults.length}` : items.length}</span></div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => {
                      const candidate = item.destination as PrototypeCandidate;
                      return (
                        <article key={candidate.key} className="border border-[var(--atlas-border)] bg-[rgba(255,253,247,0.92)] p-5 shadow-[0_16px_45px_-35px_rgba(23,32,42,.55)]">
                          <div className="flex items-start justify-between gap-3">
                            <div><p className="text-xs font-bold uppercase text-[var(--atlas-accent)]">{candidate.country}</p><h3 className="mt-1 text-2xl font-semibold">{candidate.name}</h3></div>
                            <label className="text-xs font-bold"><input className="mr-2" type="checkbox" checked={comparison.includes(candidate.key)} disabled={!comparison.includes(candidate.key) && comparison.length >= 4} onChange={() => toggleComparison(candidate.key)} />Compare</label>
                          </div>
                          <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--atlas-muted)]">{candidate.summary}</p>
                          <OwnedAffordabilityEvidence record={ownedAffordabilityByDestination.get(candidate.key)} household={household} decision={item.affordabilityDecision} />
                          <DualCurrencyCostEvidence candidate={candidate} localRange={localTotal(candidate, household)} displayCurrency={displayCurrency} snapshot={snapshot} asOfDate={snapshotAsOfDate} household={household} />
                          <p className="mt-3 text-xs font-semibold text-[var(--atlas-ink)]">{item.lifestyleFit.scoreStatus === "SCORED" ? `Lifestyle fit ${item.lifestyleFit.totalScore}/100 · ${item.lifestyleFit.scoredDimensionCount}/${item.lifestyleFit.relevantDimensionCount} selected dimensions supported` : "No supported preference score; shown without a fabricated ranking"}</p>
                          <RequirementReasons reasons={item.reasons} preferenceCapabilities={preferenceCapabilities} />
                          <Link href={`/destinations/${candidate.slug}`} className="mt-5 inline-block text-sm font-bold text-[var(--atlas-accent)] underline underline-offset-4">Open destination guide</Link>
                        </article>
                      );
                    })}
                  </div>
                  {group === "MEETS_FILTERS" && allRecommendedResults.length > 12 && (
                    <button type="button" aria-expanded={showAllRecommended} onClick={() => setShowAllRecommended((current) => !current)} className="mt-5 border border-[var(--atlas-accent)] px-5 py-3 text-sm font-bold text-[var(--atlas-accent)]">
                      {showAllRecommended ? "Show fewer places meeting required filters" : `Show all places meeting required filters (${additionalRecommendedCount} more)`}
                    </button>
                  )}
                  {group === "NEEDS_VERIFICATION" && verificationResults.length > initialVerificationCount && (
                    <button type="button" aria-expanded={showAllVerification} onClick={() => setShowAllVerification((current) => !current)} className="mt-5 border border-[var(--atlas-accent)] px-5 py-3 text-sm font-bold text-[var(--atlas-accent)]">
                      {showAllVerification ? "Show fewer" : `Show all places needing verification (${additionalVerificationCount} more)`}
                    </button>
                  )}
                </section>
              );
            })}

            {excludedResults.length > 0 && (
              <section className="border-t border-[var(--atlas-border)] pt-6">
                <button type="button" aria-expanded={showExcluded} onClick={() => setShowExcluded((current) => !current)} className="border border-[#8a4b21] px-5 py-3 text-sm font-bold text-[#8a4b21]">
                  {showExcluded ? "Hide" : "Show"} excluded places ({excludedResults.length})
                </button>
                {showExcluded && (
                  <div className="mt-5">
                    <h2 className="text-2xl font-semibold">Excluded by a hard requirement</h2>
                    <p className="mt-2 text-sm text-[var(--atlas-muted)]">These places are explanations, not recommendations.</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {excludedResults.map((item) => (
                        <article key={item.destination.key} className="border border-[#caa98d] bg-[#fff8f1] p-4">
                          <h3 className="font-semibold">{item.destination.name}</h3>
                          <RequirementReasons reasons={item.reasons} preferenceCapabilities={preferenceCapabilities} />
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="border-t-4 border-[var(--atlas-accent)] bg-[#fffdf7] p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase text-[var(--atlas-accent)]">Comparison</p><h2 className="mt-2 text-3xl font-semibold">{comparisonRows.length ? `${comparisonRows.length} places side by side` : "Select places to compare"}</h2></div><span className="text-sm text-[var(--atlas-muted)]">Start with three, add one more</span></div>
              {comparisonRows.length > 0 && (
                <div className="mt-7 overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead><tr><th className="w-40 border-b border-[var(--atlas-border)] p-3">Evidence</th>{comparisonRows.map((candidate) => <th key={candidate.key} className="border-b border-[var(--atlas-border)] p-3 text-lg">{candidate.name}<button type="button" onClick={() => toggleComparison(candidate.key)} className="ml-3 text-xs font-normal text-[#8a4b21]">Remove</button></th>)}</tr></thead>
                    <tbody>{comparisonTopicOrder.map((topic) => topic === "Setting" ? (
                      <tr key={topic} data-comparison-section={topic}><th className="border-b border-[var(--atlas-border)] p-3">Setting</th>{comparisonRows.map((candidate) => <td key={candidate.key} className="border-b border-[var(--atlas-border)] p-3">{candidate.beachAccess.replaceAll("_", " ")}<br />{candidate.mountainAccess.replaceAll("_", " ")}</td>)}</tr>
                    ) : topic === "Affordability" ? (
                      <tr key={topic} data-comparison-section={topic}><th className="border-b border-[var(--atlas-border)] p-3">Estimated total monthly cost</th>{comparisonRows.map((candidate) => { const owned = ownedAffordabilityByDestination.get(candidate.key); const estimate = owned && (household === "single" ? owned.singleMonthlyUsd : owned.coupleMonthlyUsd); return <td key={candidate.key} className="border-b border-[var(--atlas-border)] p-3">{estimate ? `${formatMoney(estimate, "USD")} USD` : "Estimate unavailable"}<br /><span className="text-xs text-[var(--atlas-muted)]">2026 estimate · {household === "single" ? "one adult" : "two adults"}</span></td>; })}</tr>
                    ) : (
                      <tr key={topic} data-comparison-section={topic}><th className="p-3">Cost evidence</th>{comparisonRows.map((candidate) => { const total = localTotal(candidate, household); const converted = convertedTotal(candidate, household, displayCurrency); const available = Boolean(converted && converted.low.convertedAmount !== null && converted.high.convertedAmount !== null); return <td key={candidate.key} className="p-3">{total ? `${formatMoney(total.monthlyLow, total.currency)}-${formatMoney(total.monthlyHigh, total.currency)}` : "Original range unavailable"}<br />{available ? `${formatMoney(converted!.low.convertedAmount!, displayCurrency)}-${formatMoney(converted!.high.convertedAmount!, displayCurrency)}` : `${displayCurrency} conversion unavailable`}<br /><span className="text-xs text-[var(--atlas-muted)]">{candidate.costRows.length} detailed rows · {candidate.costSources.length} sources</span></td>; })}</tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
