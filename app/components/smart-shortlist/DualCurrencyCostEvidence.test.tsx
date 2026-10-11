import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { smartShortlistCandidates } from "../../lib/smart-shortlist/cohort";
import { U3_R3_FIXTURE_SNAPSHOT, type ExchangeRateSnapshot } from "../../lib/smart-shortlist/exchange-rates";
import DualCurrencyCostEvidence from "./DualCurrencyCostEvidence";

const chiangMai = smartShortlistCandidates.find((candidate) => candidate.key === "chiang-mai-thailand")!;
const unavailableCandidate = smartShortlistCandidates.find((candidate) => candidate.costRows.some((row) => row.currency === "NZD"))!;

describe("DualCurrencyCostEvidence", () => {
  it("keeps original local evidence while suppressing fixture equivalents and rate provenance", () => {
    render(<DualCurrencyCostEvidence candidate={chiangMai} localRange={chiangMai.localTotals.single} displayCurrency="USD" snapshot={U3_R3_FIXTURE_SNAPSHOT} asOfDate="2026-09-06" household="single" />);
    expect(screen.getAllByText(/THB 25,000-THB 50,000/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/\$700-\$1,400/)).not.toBeInTheDocument();
    expect(screen.queryByText("Deterministic architecture fixture (not live)")).not.toBeInTheDocument();
    expect(screen.queryByText(/Effective September 4, 2026/)).not.toBeInTheDocument();
    expect(screen.getByText(/categories do not add ranking points/)).toBeInTheDocument();
  });

  it("preserves an unsupported local currency without advertising a fixture conversion", () => {
    const localRange = { monthlyLow: 2_000, monthlyHigh: 3_000, currency: "NZD", verifiedAt: "2026-08-31" };
    render(<DualCurrencyCostEvidence candidate={unavailableCandidate} localRange={localRange} displayCurrency="USD" snapshot={U3_R3_FIXTURE_SNAPSHOT} asOfDate="2026-09-06" household="single" />);
    expect(screen.queryByText(/USD equivalent|USD conversion unavailable/)).not.toBeInTheDocument();
    expect(screen.getByText(/NZ\$2,000-NZ\$3,000/)).toBeInTheDocument();
  });

  it("does not expose fixture rates even when their status becomes stale", () => {
    const staleSnapshot: ExchangeRateSnapshot = {
      ...U3_R3_FIXTURE_SNAPSHOT,
      rates: U3_R3_FIXTURE_SNAPSHOT.rates.map((rate) => rate.baseCurrency === "THB" ? { ...rate, status: "STALE" } : rate),
    };
    render(<DualCurrencyCostEvidence candidate={chiangMai} localRange={chiangMai.localTotals.single} displayCurrency="USD" snapshot={staleSnapshot} asOfDate="2026-09-06" household="single" />);
    expect(screen.queryByText("Stale USD estimate")).not.toBeInTheDocument();
    expect(screen.queryByText(/refresh before relying/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Effective September 4, 2026/)).not.toBeInTheDocument();
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