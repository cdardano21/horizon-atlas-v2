import type { AffordabilityClassification, OwnedAffordabilityRecord } from "../../lib/smart-shortlist/owned-affordability";

type Props = {
  record?: OwnedAffordabilityRecord;
  household: "single" | "couple";
  decision?: AffordabilityClassification;
};

const stateLabel: Record<NonNullable<AffordabilityClassification>["state"], string> = {
  WITHIN_BUDGET: "Within budget",
  CLOSE_TO_BUDGET: "Close to budget",
  OVER_BUDGET: "Over budget",
};

function usd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function OwnedAffordabilityEvidence({ record, household, decision }: Props) {
  const estimate = record && (household === "single" ? record.singleMonthlyUsd : record.coupleMonthlyUsd);
  return (
    <div className="mt-5 border-l-4 border-[var(--atlas-accent)] bg-[#eef4ef] p-4 text-sm">
      <p className="text-xs font-bold uppercase text-[var(--atlas-accent)]">Estimated total monthly living cost</p>
      <p className="mt-1 text-lg font-semibold">{estimate ? `${usd(estimate)} USD` : "Estimate unavailable"}</p>
      <p className="mt-1 text-xs text-[var(--atlas-muted)]">2026 estimate · {household === "single" ? "one adult" : "two adults"}</p>
      {decision && <p className="mt-2 text-xs text-[var(--atlas-muted)]">Your budget: {usd(decision.budgetUsd)} USD</p>}
      {decision && <p className="mt-3 font-bold">{stateLabel[decision.state]}</p>}
      {decision && <p className="mt-1 text-xs text-[var(--atlas-muted)]">{decision.reason}</p>}
    </div>
  );
}