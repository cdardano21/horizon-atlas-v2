"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { smartShortlistCandidates, type PrototypeCandidate } from "../../lib/smart-shortlist/cohort";
import { convertRangeForDisplay, U3_R3_FIXTURE_SNAPSHOT } from "../../lib/smart-shortlist/exchange-rates";
import type { EvaluatedDestination, ShortlistProfile } from "../../lib/smart-shortlist/evaluator";
import { evaluateShortlistWithOwnedAffordability, type OwnedEvaluatedDestination } from "../../lib/smart-shortlist/owned-affordability-evaluator";
import { ownedAffordabilityByDestination } from "../../lib/smart-shortlist/owned-affordability-records";
import { AFFORDABILITY_ESTIMATE_DEFINITION } from "../../lib/smart-shortlist/owned-affordability";
import DualCurrencyCostEvidence from "./DualCurrencyCostEvidence";
import OwnedAffordabilityEvidence from "./OwnedAffordabilityEvidence";

const steps = ["Where", "Stay", "Affordability", "Setting", "Details", "Review"] as const;
const detailTopics = ["Healthcare", "Housing", "Climate", "Safety", "Residency", "Transport", "Culture", "Family", "Language", "Pets"];
const countryPresets = {
  anywhere: undefined,
  us: ["US"],
  europe: ["AL", "BG", "CY", "ES", "FR", "GR", "HR", "IT", "NL", "PT"],
  latinAmerica: ["BR", "CR", "DO", "EC", "MX", "PA", "UY"],
  asiaPacific: ["JP", "MY", "NZ", "PH", "TH", "VN"],
} as const;

type CountryPreset = keyof typeof countryPresets;
type StayKind = "extended" | "seasonal" | "trial" | "permanent" | "unsure";

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
  if (group === "MEETS_FILTERS") return noFilters ? "Places to explore" : "Meets your selected filters";
  if (group === "NEEDS_VERIFICATION") return "Needs verification";
  if (group === "RELAX_ONE") return "If you relax one requirement";
  return "More than one conflict";
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`${controlClass} ${active ? "border-[var(--atlas-accent)] bg-[#e8f0eb] text-[var(--atlas-accent)]" : ""}`}>
      {children}
    </button>
  );
}

export default function SmartShortlistPrototype() {
  const [step, setStep] = useState(0);
  const [countryPreset, setCountryPreset] = useState<CountryPreset>("anywhere");
  const [stay, setStay] = useState<StayKind>("unsure");
  const [household, setHousehold] = useState<"single" | "couple">("single");
  const [budget, setBudget] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [beach, setBeach] = useState<ShortlistProfile["beach"]>();
  const [mountain, setMountain] = useState<ShortlistProfile["mountain"]>();
  const [topics, setTopics] = useState<string[]>(["Healthcare", "Housing", "Climate"]);
  const [requireBeach, setRequireBeach] = useState(false);
  const [requireMountain, setRequireMountain] = useState(false);
  const [results, setResults] = useState<OwnedEvaluatedDestination[] | null>(null);
  const [comparison, setComparison] = useState<string[]>([]);

  const profile: ShortlistProfile = {
    includedCountries: countryPresets[countryPreset] ? [...countryPresets[countryPreset]!] : undefined,
    beach,
    requireBeach,
    mountain,
    requireMountain,
  };

  const submit = () => {
    const evaluated = evaluateShortlistWithOwnedAffordability(
      smartShortlistCandidates,
      profile,
      budget && Number(budget) > 0 ? {
        amountUsd: Number(budget),
        household,
      } : undefined,
    );
    setResults(evaluated);
    setComparison(evaluated.filter((item) => item.group === "MEETS_FILTERS").slice(0, 3).map((item) => item.destination.key));
  };

  const toggleTopic = (topic: string) => {
    setTopics((current) => current.includes(topic)
      ? current.filter((item) => item !== topic)
      : current.length < 3 ? [...current, topic] : current);
  };

  const toggleComparison = (key: string) => {
    setComparison((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : current.length < 4 ? [...current, key] : current);
  };

  const displayedResults = results?.filter((item) => item.group !== "EXCLUDED").slice(0, 12) ?? [];
  const noFilters = !profile.includedCountries && !beach && !mountain && !budget;
  const comparisonRows = comparison
    .map((key) => smartShortlistCandidates.find((candidate) => candidate.key === key))
    .filter((candidate): candidate is PrototypeCandidate => Boolean(candidate));

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
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">1 of 6</p>
                  <h2 className="mt-2 text-3xl font-semibold">Where would you like to look?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">This is geographic scope only. It does not establish citizenship, residency, tax, or work eligibility.</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <ChoiceButton active={countryPreset === "anywhere"} onClick={() => setCountryPreset("anywhere")}>Anywhere in the profiled set</ChoiceButton>
                    <ChoiceButton active={countryPreset === "us"} onClick={() => setCountryPreset("us")}>United States only</ChoiceButton>
                    <ChoiceButton active={countryPreset === "europe"} onClick={() => setCountryPreset("europe")}>Europe</ChoiceButton>
                    <ChoiceButton active={countryPreset === "latinAmerica"} onClick={() => setCountryPreset("latinAmerica")}>Latin America</ChoiceButton>
                    <ChoiceButton active={countryPreset === "asiaPacific"} onClick={() => setCountryPreset("asiaPacific")}>Asia Pacific</ChoiceButton>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">2 of 6</p>
                  <h2 className="mt-2 text-3xl font-semibold">What kind of stay are you considering?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">This changes the context shown later. It does not claim legal eligibility.</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {(["extended", "seasonal", "trial", "permanent", "unsure"] as StayKind[]).map((value) => (
                      <ChoiceButton key={value} active={stay === value} onClick={() => setStay(value)}>{value === "unsure" ? "Not sure" : `${value[0].toUpperCase()}${value.slice(1)} ${value === "extended" ? "visit" : value === "trial" || value === "permanent" ? "move" : "living"}`}</ChoiceButton>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="max-w-4xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">3 of 6</p>
                  <h2 className="mt-2 text-3xl font-semibold">What should affordability mean here?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">Enter one total monthly spending budget in USD. This is the only budget-related shortlist signal. Local-currency costs remain visible as supporting evidence.</p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <label className="text-sm font-semibold">Total monthly budget (USD)<input aria-label="Total monthly budget in USD" inputMode="numeric" value={budget} onChange={(event) => setBudget(event.target.value.replace(/[^0-9]/g, ""))} placeholder="Optional" className={selectClass} /></label>
                    <label className="text-sm font-semibold">Supporting display currency<select aria-label="Supporting display currency" value={displayCurrency} onChange={(event) => setDisplayCurrency(event.target.value)} className={selectClass}><option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option><option>MXN</option><option>THB</option><option>VND</option></select></label>
                    <label className="text-sm font-semibold">Household<select aria-label="Household" value={household} onChange={(event) => setHousehold(event.target.value as "single" | "couple")} className={selectClass}><option value="single">One adult</option><option value="couple">Two adults</option></select></label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">4 of 6</p>
                  <h2 className="mt-2 text-3xl font-semibold">Which setting would you enjoy?</h2>
                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div><h3 className="text-lg font-semibold">Beach access</h3><p className="mb-3 mt-1 text-xs text-[var(--atlas-muted)]">Lake beaches count. Nearby has no distance promise.</p><div className="grid gap-2"><ChoiceButton active={!beach} onClick={() => setBeach(undefined)}>No preference</ChoiceButton><ChoiceButton active={beach === "DIRECT_ACCESS"} onClick={() => setBeach("DIRECT_ACCESS")}>Direct access</ChoiceButton><ChoiceButton active={beach === "NEARBY_OR_DIRECT"} onClick={() => setBeach("NEARBY_OR_DIRECT")}>Nearby is enough</ChoiceButton></div></div>
                    <div><h3 className="text-lg font-semibold">Mountains</h3><p className="mb-3 mt-1 text-xs text-[var(--atlas-muted)]">Broad category, not a travel-time or snow promise.</p><div className="grid gap-2"><ChoiceButton active={!mountain} onClick={() => setMountain(undefined)}>No preference</ChoiceButton><ChoiceButton active={mountain === "MOUNTAIN_OR_SKI"} onClick={() => setMountain("MOUNTAIN_OR_SKI")}>Mountain scenery or ski access</ChoiceButton><ChoiceButton active={mountain === "SKI_RESORT_ACCESS"} onClick={() => setMountain("SKI_RESORT_ACCESS")}>Ski-resort access</ChoiceButton></div></div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">5 of 6</p>
                  <h2 className="mt-2 text-3xl font-semibold">Which details should open first?</h2>
                  <p className="mt-3 text-sm text-[var(--atlas-muted)]">Choose up to three. These organize comparison; they do not create hidden ranking points.</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {detailTopics.map((topic) => <ChoiceButton key={topic} active={topics.includes(topic)} onClick={() => toggleTopic(topic)}>{topic}</ChoiceButton>)}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-[var(--atlas-accent)]">6 of 6</p>
                  <h2 className="mt-2 text-3xl font-semibold">What must be met?</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">Only supported choices can become requirements. Unknown evidence moves a place to Needs verification, never to confirmed results.</p>
                  <div className="mt-8 grid gap-3">
                    {beach && <label className="flex items-center gap-3 border border-[var(--atlas-border)] bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={requireBeach} onChange={(event) => setRequireBeach(event.target.checked)} /> Require the selected beach category</label>}
                    {mountain && <label className="flex items-center gap-3 border border-[var(--atlas-border)] bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={requireMountain} onChange={(event) => setRequireMountain(event.target.checked)} /> Require the selected mountain category</label>}
                    {budget && <p className="border border-[var(--atlas-border)] bg-white p-5 text-sm">Your USD budget is compared directly with the 2026 estimate for your selected household.</p>}
                    {!beach && !mountain && !budget && <p className="border border-[var(--atlas-border)] bg-white p-5 text-sm">No requirements selected. Results will be a neutral, canonical list rather than a personal-fit ranking.</p>}
                  </div>
                  <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="font-bold">Geography</dt><dd className="text-[var(--atlas-muted)]">{countryPreset}</dd></div><div><dt className="font-bold">Stay context</dt><dd className="text-[var(--atlas-muted)]">{stay}</dd></div><div><dt className="font-bold">Compare first</dt><dd className="text-[var(--atlas-muted)]">{topics.join(", ")}</dd></div></dl>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--atlas-border)] bg-white/60 p-5 sm:px-10">
              <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="px-4 py-3 text-sm font-bold text-[var(--atlas-muted)] disabled:opacity-30">Back</button>
              {step < 5
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
                <p className="mt-2 text-sm text-[var(--atlas-muted)]">Up to 12 are shown. Nothing is added to fill a quota.</p>
                <p className="mt-2 text-sm font-semibold">Your decision budget: {budget ? `${formatMoney(Number(budget), "USD")} USD` : "Not entered"}</p>
                <p className="mt-1 text-xs text-[var(--atlas-muted)]">{household === "single" ? "One adult" : "Two adults"}</p>
              </div>
              <button type="button" onClick={() => { setResults(null); setStep(0); setComparison([]); }} className="border border-[var(--atlas-accent)] px-5 py-3 text-sm font-bold text-[var(--atlas-accent)]">Edit choices</button>
            </section>

            <section className="border border-[#bd7b36] bg-[#fff8ea] p-5 text-sm">
              <p className="font-bold text-[#774719]">About these estimates</p>
              <p className="mt-1 text-[var(--atlas-muted)]">{AFFORDABILITY_ESTIMATE_DEFINITION}</p>
              <p className="mt-2 text-xs text-[var(--atlas-muted)]">Supporting local-cost conversion uses one deterministic fixture for the session and does not change the USD affordability estimate.</p>
              <p className="mt-2 text-xs text-[var(--atlas-muted)]">Missing pairs show conversion unavailable. Stale rates retain their effective date and a visible warning. Weekends and declared market holidays do not consume freshness days.</p>
            </section>

            {(["MEETS_FILTERS", "NEEDS_VERIFICATION", "RELAX_ONE"] as const).map((group) => {
              const items = displayedResults.filter((item) => item.group === group);
              if (!items.length) return null;
              return (
                <section key={group}>
                  <div className="mb-4 flex items-baseline justify-between"><h2 className="text-2xl font-semibold">{groupCopy(group, noFilters)}</h2><span className="text-sm text-[var(--atlas-muted)]">{items.length}</span></div>
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
                          <ul className="mt-4 space-y-1 text-xs text-[var(--atlas-muted)]">{item.reasons.slice(0, 4).map((reason) => <li key={reason.capability}><span className="font-bold text-[var(--atlas-ink)]">{reason.state}:</span> {reason.explanation}</li>)}</ul>
                          <Link href={`/destinations/${candidate.slug}`} className="mt-5 inline-block text-sm font-bold text-[var(--atlas-accent)] underline underline-offset-4">Open destination guide</Link>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <section className="border-t-4 border-[var(--atlas-accent)] bg-[#fffdf7] p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase text-[var(--atlas-accent)]">Comparison</p><h2 className="mt-2 text-3xl font-semibold">{comparisonRows.length ? `${comparisonRows.length} places side by side` : "Select places to compare"}</h2></div><span className="text-sm text-[var(--atlas-muted)]">Start with three, add one more</span></div>
              {comparisonRows.length > 0 && (
                <div className="mt-7 overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead><tr><th className="w-40 border-b border-[var(--atlas-border)] p-3">Evidence</th>{comparisonRows.map((candidate) => <th key={candidate.key} className="border-b border-[var(--atlas-border)] p-3 text-lg">{candidate.name}<button type="button" onClick={() => toggleComparison(candidate.key)} className="ml-3 text-xs font-normal text-[#8a4b21]">Remove</button></th>)}</tr></thead>
                    <tbody>
                      <tr><th className="border-b border-[var(--atlas-border)] p-3">Setting</th>{comparisonRows.map((candidate) => <td key={candidate.key} className="border-b border-[var(--atlas-border)] p-3">{candidate.beachAccess.replaceAll("_", " ")}<br />{candidate.mountainAccess.replaceAll("_", " ")}</td>)}</tr>
                      <tr><th className="border-b border-[var(--atlas-border)] p-3">Estimated total monthly cost</th>{comparisonRows.map((candidate) => { const owned = ownedAffordabilityByDestination.get(candidate.key); const estimate = owned && (household === "single" ? owned.singleMonthlyUsd : owned.coupleMonthlyUsd); return <td key={candidate.key} className="border-b border-[var(--atlas-border)] p-3">{estimate ? `${formatMoney(estimate, "USD")} USD` : "Estimate unavailable"}<br /><span className="text-xs text-[var(--atlas-muted)]">2026 estimate · {household === "single" ? "one adult" : "two adults"}</span></td>; })}</tr>
                      <tr><th className="border-b border-[var(--atlas-border)] p-3">Original local range</th>{comparisonRows.map((candidate) => { const total = localTotal(candidate, household); return <td key={candidate.key} className="border-b border-[var(--atlas-border)] p-3">{total ? `${formatMoney(total.monthlyLow, total.currency)}-${formatMoney(total.monthlyHigh, total.currency)}` : "Not comparable"}<br /><span className="text-xs text-[var(--atlas-muted)]">{total?.verifiedAt ? `Research date ${total.verifiedAt}` : candidate.affordabilityReadiness.replaceAll("_", " ")}</span></td>; })}</tr>
                      <tr><th className="border-b border-[var(--atlas-border)] p-3">Supporting display estimate</th>{comparisonRows.map((candidate) => { const converted = convertedTotal(candidate, household, displayCurrency); const available = Boolean(converted && converted.low.convertedAmount !== null && converted.high.convertedAmount !== null); return <td key={candidate.key} className="border-b border-[var(--atlas-border)] p-3">{available ? `${formatMoney(converted!.low.convertedAmount!, displayCurrency)}-${formatMoney(converted!.high.convertedAmount!, displayCurrency)}` : `${displayCurrency} conversion unavailable`}<br /><span className="text-xs text-[var(--atlas-muted)]">{available ? `${snapshot.provider.name}; effective ${converted!.low.effectiveDate}` : "Original amount retained"}</span></td>; })}</tr>
                      <tr><th className="p-3">Evidence depth</th>{comparisonRows.map((candidate) => <td key={candidate.key} className="p-3">{candidate.costRows.length} detailed cost rows<br /><span className="text-xs text-[var(--atlas-muted)]">{candidate.costSources.length} cost-related sources</span></td>)}</tr>
                    </tbody>
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
