import type { PrototypeCandidate } from "../../lib/smart-shortlist/cohort";
import { convertRangeForDisplay, type ExchangeRateSnapshot } from "../../lib/smart-shortlist/exchange-rates";

type LocalRange = {
  monthlyLow: number;
  monthlyHigh: number;
  currency: string;
  verifiedAt: string | null;
};

type Props = {
  candidate: PrototypeCandidate;
  localRange?: LocalRange;
  displayCurrency: string;
  snapshot: ExchangeRateSnapshot;
  asOfDate: string;
  household: "single" | "couple";
  compact?: boolean;
};

function formatMoney(value: number | bigint, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function displayDate(value: string | null) {
  if (!value) return "Not applicable (same currency)";
  const parsed = new Date(value.includes("T") ? value : `${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(parsed);
}

function evidenceDescription(candidate: PrototypeCandidate) {
  if (candidate.affordabilityReadiness === "PROXY_REQUIRED") {
    return { precision: "Proxy geography required", proxy: "Yes", confidence: "Do not treat as destination-specific without review." };
  }
  if (candidate.affordabilityReadiness === "INSUFFICIENT_FOR_AFFORDABILITY") {
    return { precision: "Insufficient comparable evidence", proxy: "Unresolved", confidence: "Not usable for an affordability conclusion." };
  }
  return { precision: "Destination-level planning evidence", proxy: "No", confidence: "Planning estimate; verify before a financial decision." };
}

export default function DualCurrencyCostEvidence({
  candidate,
  localRange,
  displayCurrency,
  snapshot,
  asOfDate,
  household,
  compact = false,
}: Props) {
  const evidence = evidenceDescription(candidate);
  const converted = localRange ? convertRangeForDisplay({
    low: localRange.monthlyLow,
    high: localRange.monthlyHigh,
    baseCurrency: localRange.currency,
    displayCurrency,
    snapshot,
    asOfDate,
  }) : null;
  const conversionAvailable = converted?.low.convertedAmount !== null && converted?.high.convertedAmount !== null;
  const conversionStatus = converted?.low.status;
  const source = candidate.costSources[0];

  return (
    <div className="mt-5 border-t border-[var(--atlas-border)] pt-4 text-sm">
      <p className="font-bold">Monthly cost evidence</p>
      <p className="mt-2 text-xs font-bold uppercase text-[var(--atlas-muted)]">Original local estimate</p>
      <p className="mt-1 text-base font-semibold text-[var(--atlas-ink)]">
        {localRange
          ? `${formatMoney(localRange.monthlyLow, localRange.currency)}-${formatMoney(localRange.monthlyHigh, localRange.currency)} / month (${household})`
          : "Comparable local household total unavailable"}
      </p>

      {localRange && conversionAvailable ? (
        <div className="mt-3 border-l-4 border-[#bd7b36] bg-[#fff8ea] p-3">
          <p className="text-xs font-bold uppercase text-[#774719]">
            {conversionStatus === "STALE" ? `Stale ${displayCurrency} estimate` : `Estimated ${displayCurrency} equivalent`}
          </p>
          <p className="mt-1 text-base font-semibold">
            {formatMoney(converted.low.convertedAmount!, displayCurrency)}-{formatMoney(converted.high.convertedAmount!, displayCurrency)} / month
          </p>
          <p className="mt-1 text-xs text-[var(--atlas-muted)]">
            {snapshot.provider.name} · Effective {displayDate(converted.low.effectiveDate)}
          </p>
          {conversionStatus === "STALE" && <p className="mt-2 text-xs font-bold text-[#8a4b21]">Stale rate shown with its date; refresh before relying on it.</p>}
        </div>
      ) : localRange ? (
        <div className="mt-3 border-l-4 border-[#8a4b21] bg-[#fff4ec] p-3">
          <p className="font-bold text-[#8a4b21]">{displayCurrency} conversion unavailable</p>
          <p className="mt-1 text-xs text-[var(--atlas-muted)]">No direct {localRange.currency}/{displayCurrency} pair exists in this session snapshot. The local amount remains available.</p>
        </div>
      ) : null}

      <p className="mt-3 text-xs text-[var(--atlas-muted)]">This local-currency evidence supports review only. Its categories do not add ranking points.</p>

      {!compact && (
        <details className="mt-4 border-t border-[var(--atlas-border)] pt-3">
          <summary className="cursor-pointer font-bold text-[var(--atlas-accent)]">Detailed cost information</summary>
          <dl className="mt-3 grid gap-2 text-xs text-[var(--atlas-muted)] sm:grid-cols-2">
            <div><dt className="font-bold text-[var(--atlas-ink)]">Exchange-rate source</dt><dd>{snapshot.provider.name}</dd></div>
            <div><dt className="font-bold text-[var(--atlas-ink)]">Rate effective date</dt><dd>{converted?.low.effectiveDate ? displayDate(converted.low.effectiveDate) : "Unavailable"}</dd></div>
            <div><dt className="font-bold text-[var(--atlas-ink)]">Research source</dt><dd>{source ? <a href={source.url} className="underline underline-offset-2">{source.name}</a> : "No retained cost source"}</dd></div>
            <div><dt className="font-bold text-[var(--atlas-ink)]">Research date</dt><dd>{localRange?.verifiedAt ? displayDate(localRange.verifiedAt) : "Unavailable"}</dd></div>
            <div><dt className="font-bold text-[var(--atlas-ink)]">Geographic precision</dt><dd>{evidence.precision}</dd></div>
            <div><dt className="font-bold text-[var(--atlas-ink)]">Proxy status</dt><dd>{evidence.proxy}</dd></div>
            <div className="sm:col-span-2"><dt className="font-bold text-[var(--atlas-ink)]">Confidence warning</dt><dd>{evidence.confidence}</dd></div>
          </dl>
          {candidate.costRows.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {candidate.costRows.map((row, index) => (
                <li key={`${row.category}-${row.household}-${index}`} className="border border-[var(--atlas-border)] bg-white/70 p-2 text-xs">
                  <span className="font-bold">{row.category.replaceAll("_", " ")}</span><br />
                  {formatMoney(row.low, row.currency)}-{formatMoney(row.high, row.currency)} · {row.household}
                </li>
              ))}
            </ul>
          )}
        </details>
      )}
    </div>
  );
}