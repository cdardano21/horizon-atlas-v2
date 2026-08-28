"use client";

import { useState } from "react";
import type { CanonicalDestinationV31Modules } from "../../lib/canonical-destination-model";

type LifestyleFeatureRow = CanonicalDestinationV31Modules["lifestyleFeatures"][number];

interface LifestyleGroupDefinition {
  readonly key: string;
  readonly label: string;
  readonly description: string;
}

// Fixed, consumer-friendly presentation order - mirrors the LIFESTYLE_FEATURES sheet's
// feature_group taxonomy exactly (community_form, natural_setting, water_and_boating,
// outdoor_recreation, culture_and_daily_life), never re-derived or guessed at render time.
const GROUP_DEFINITIONS: readonly LifestyleGroupDefinition[] = [
  { key: "community_form", label: "Community & setting", description: "What kind of place this is day to day." },
  { key: "natural_setting", label: "Nature & surroundings", description: "The landscape around the destination." },
  { key: "water_and_boating", label: "Water & boating", description: "Access to lakes, rivers, marinas, and the coast." },
  { key: "outdoor_recreation", label: "Outdoor recreation", description: "Golf, trails, courts, and other ways to stay active." },
  { key: "culture_and_daily_life", label: "Culture & daily life", description: "Arts, dining, markets, and everyday texture." },
];

// These feature_keys intentionally mirror a destination-level fact already shown elsewhere on
// this page (beach access and mountain/ski access) - excluded here so the same fact is never
// shown twice under a different heading.
const SHOWN_ELSEWHERE_ON_PAGE = new Set(["beach_access", "mountain_access"]);

const AVAILABILITY_PHRASE: Record<string, string> = {
  STRONG: "A strong local feature",
  MODERATE: "Solidly available",
  LIMITED: "Available, but limited",
  NONE: "Not available here",
};

const PROXIMITY_PHRASE: Record<string, string> = {
  IN_DESTINATION: "right in town",
  WITHIN_30_MIN: "within about 30 minutes",
  WITHIN_60_MIN: "within about an hour",
};

function isHiddenStatus(value: string | null) {
  return !value || value === "UNKNOWN" || value === "NOT_APPLICABLE";
}

function describeAvailability(row: LifestyleFeatureRow): string | null {
  if (isHiddenStatus(row.availabilityLevel)) return null;
  const phrase = AVAILABILITY_PHRASE[row.availabilityLevel as string];
  if (!phrase) return null;
  const proximityPhrase = row.proximityBand ? PROXIMITY_PHRASE[row.proximityBand] : null;
  return proximityPhrase ? `${phrase} — ${proximityPhrase}` : phrase;
}

function isDisplayableRow(row: LifestyleFeatureRow): boolean {
  if (row.displayEnabled !== "YES") return false;
  if (row.featureKey && SHOWN_ELSEWHERE_ON_PAGE.has(row.featureKey)) return false;
  return describeAvailability(row) !== null;
}

function humanizeFeatureKey(featureKey: string | null): string {
  if (!featureKey) return "Lifestyle feature";
  return featureKey
    .split("_")
    .filter((word) => word !== "access")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function FeatureCard({ row }: { row: LifestyleFeatureRow }) {
  const title = row.displayLabel?.trim() || humanizeFeatureKey(row.featureKey);
  const availability = describeAvailability(row);
  const evidence = row.evidenceSummary?.trim();

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white">{title}</p>
        {availability ? (
          <span className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            {availability}
          </span>
        ) : null}
      </div>
      {evidence ? <p className="mt-3 text-sm leading-6 text-slate-300">{evidence}</p> : null}
    </div>
  );
}

function LifestyleGroupPanel({ group, rows }: { group: LifestyleGroupDefinition; rows: LifestyleFeatureRow[] }) {
  const VISIBLE_COUNT = 3;
  const visibleRows = rows.slice(0, VISIBLE_COUNT);
  const remainingRows = rows.slice(VISIBLE_COUNT);

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{group.label}</p>
      <p className="mt-1 text-xs text-slate-400">{group.description}</p>
      <div className="mt-4 grid gap-3">
        {visibleRows.map((row) => (
          <FeatureCard key={row.recordKey} row={row} />
        ))}
      </div>
      {remainingRows.length > 0 ? (
        <details className="group mt-3">
          <summary className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            See {remainingRows.length} more
            <span className="transition group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <div className="mt-3 grid gap-3">
            {remainingRows.map((row) => (
              <FeatureCard key={row.recordKey} row={row} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

export default function LifestyleRecreationSection({ lifestyleFeatures }: { lifestyleFeatures: CanonicalDestinationV31Modules["lifestyleFeatures"] }) {
  const [showAllGroups, setShowAllGroups] = useState(false);

  const displayableRows = lifestyleFeatures.filter(isDisplayableRow);
  if (displayableRows.length === 0) {
    return null;
  }

  const groupsWithRows = GROUP_DEFINITIONS.map((group) => ({
    group,
    rows: displayableRows.filter((row) => row.featureGroup === group.key),
  })).filter((entry) => entry.rows.length > 0);

  if (groupsWithRows.length === 0) {
    return null;
  }

  const INITIAL_GROUP_COUNT = 3;
  const visibleGroups = showAllGroups ? groupsWithRows : groupsWithRows.slice(0, INITIAL_GROUP_COUNT);
  const hiddenGroupCount = groupsWithRows.length - visibleGroups.length;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Real destination-level research</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Lifestyle & Recreation</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            What day-to-day life, the surrounding landscape, and recreation genuinely look like here - based on
            verified research, never a generic checklist.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleGroups.map(({ group, rows }) => (
          <LifestyleGroupPanel key={group.key} group={group} rows={rows} />
        ))}
      </div>
      {hiddenGroupCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAllGroups(true)}
          className="mt-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200 transition hover:bg-cyan-500/20"
        >
          Show {hiddenGroupCount} more {hiddenGroupCount === 1 ? "category" : "categories"}
        </button>
      ) : null}
    </section>
  );
}
