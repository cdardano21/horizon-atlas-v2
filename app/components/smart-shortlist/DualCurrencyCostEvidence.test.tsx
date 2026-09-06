import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { smartShortlistCandidates } from "../../lib/smart-shortlist/cohort";
import { U3_R3_FIXTURE_SNAPSHOT, type ExchangeRateSnapshot } from "../../lib/smart-shortlist/exchange-rates";
import DualCurrencyCostEvidence from "./DualCurrencyCostEvidence";

const chiangMai = smartShortlistCandidates.find((candidate) => candidate.key === "chiang-mai-thailand")!;
const unavailableCandidate = smartShortlistCandidates.find((candidate) => candidate.costRows.some((row) => row.currency === "NZD"))!;

describe("DualCurrencyCostEvidence", () => {
  it("keeps the original local amount visible beside a labeled fixture estimate", () => {
    render(<DualCurrencyCostEvidence candidate={chiangMai} localRange={chiangMai.localTotals.single} displayCurrency="USD" snapshot={U3_R3_FIXTURE_SNAPSHOT} asOfDate="2026-09-06" household="single" />);
    expect(screen.getAllByText(/THB 25,000-THB 50,000/).length).toBeGreaterThan(0);
    expect(screen.getByText(/\$700-\$1,400/)).toBeInTheDocument();
    expect(screen.getByText("Deterministic architecture fixture (not live)")).toBeInTheDocument();
    expect(screen.getByText(/Effective September 4, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/categories do not add ranking points/)).toBeInTheDocument();
  });

  it("shows an explicit unavailable state while preserving an unsupported local currency", () => {
    const localRange = { monthlyLow: 2_000, monthlyHigh: 3_000, currency: "NZD", verifiedAt: "2026-08-31" };
    render(<DualCurrencyCostEvidence candidate={unavailableCandidate} localRange={localRange} displayCurrency="USD" snapshot={U3_R3_FIXTURE_SNAPSHOT} asOfDate="2026-09-06" household="single" />);
    expect(screen.getByText("USD conversion unavailable")).toBeInTheDocument();
    expect(screen.getByText(/NZ\$2,000-NZ\$3,000/)).toBeInTheDocument();
  });

  it("labels stale rates and retains the effective date", () => {
    const staleSnapshot: ExchangeRateSnapshot = {
      ...U3_R3_FIXTURE_SNAPSHOT,
      rates: U3_R3_FIXTURE_SNAPSHOT.rates.map((rate) => rate.baseCurrency === "THB" ? { ...rate, status: "STALE" } : rate),
    };
    render(<DualCurrencyCostEvidence candidate={chiangMai} localRange={chiangMai.localTotals.single} displayCurrency="USD" snapshot={staleSnapshot} asOfDate="2026-09-06" household="single" />);
    expect(screen.getByText("Stale USD estimate")).toBeInTheDocument();
    expect(screen.getByText(/refresh before relying/)).toBeInTheDocument();
    expect(screen.getByText(/Effective September 4, 2026/)).toBeInTheDocument();
  });

  it("exposes research provenance, precision, proxy status, confidence, and detailed rows", () => {
    render(<DualCurrencyCostEvidence candidate={chiangMai} localRange={chiangMai.localTotals.single} displayCurrency="USD" snapshot={U3_R3_FIXTURE_SNAPSHOT} asOfDate="2026-09-06" household="single" />);
    expect(screen.getByText("Research source")).toBeInTheDocument();
    expect(screen.getByText("Research date")).toBeInTheDocument();
    expect(screen.getByText("Geographic precision")).toBeInTheDocument();
    expect(screen.getByText("Proxy status")).toBeInTheDocument();
    expect(screen.getByText("Confidence warning")).toBeInTheDocument();
    expect(screen.getByText(/detailed cost information/i)).toBeInTheDocument();
  });
});