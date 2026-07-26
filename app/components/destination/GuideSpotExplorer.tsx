"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { NamedRecord } from "../../lib/destination-command-center";
import { buildOfficialSourceSearchUrl, resolveSourceHref, sanitizeExternalSourceUrl } from "../../lib/source-links";
import MissingDataState from "./MissingDataState";
import SourceVerificationBadge from "./SourceVerificationBadge";

function summarizeLens(row: NamedRecord) {
  const text = `${row.subtitle ?? ""} ${row.value1 ?? ""} ${row.value2 ?? ""} ${row.value3 ?? ""}`.toLowerCase();
  if (text.includes("market") || text.includes("produce") || text.includes("daily-food")) return "Daily-life essential";
  if (text.includes("remote") || text.includes("work") || text.includes("meeting")) return "Workable routine";
  if (text.includes("tourism") || text.includes("guide") || text.includes("directory")) return "Scouting shortcut";
  if (text.includes("parking") || text.includes("bus") || text.includes("transport")) return "Mobility planning";
  return "Lifestyle anchor";
}

function compactMapLabel(query: string) {
  return query.split(",").slice(0, 2).join(" • ");
}

function nearbySearch(query: string, term: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${term} near ${query}`)}`;
}

function spotBestFor(row: NamedRecord) {
  const text = `${row.subtitle ?? ""} ${row.value1 ?? ""} ${row.value2 ?? ""}`.toLowerCase();
  if (text.includes("market") || text.includes("produce")) return "Daily essentials";
  if (text.includes("remote") || text.includes("meeting") || text.includes("work")) return "Workday practicality";
  if (text.includes("dining") || text.includes("restaurant") || text.includes("tavern")) return "Food-and-routine scouting";
  if (text.includes("parking") || text.includes("bus") || text.includes("transport")) return "Logistics planning";
  return "On-the-ground validation";
}

function spotWatchFor(row: NamedRecord) {
  const text = `${row.value3 ?? ""} ${row.value2 ?? ""}`.toLowerCase();
  if (text.includes("tourist") || text.includes("peak")) return "Seasonality effect";
  if (text.includes("premium") || text.includes("price")) return "Price tradeoff";
  if (text.includes("proxy") || text.includes("deeper")) return "Needs deeper validation";
  return "Routine-fit check";
}

function hasReadableValue(value: string | null | undefined) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return !normalized.includes("no verified information currently available") && !normalized.includes("data pending");
}

export default function GuideSpotExplorer({
  rows,
  sectionLabel,
  emptyDescription,
  city,
  country,
}: {
  rows: NamedRecord[];
  sectionLabel: string;
  emptyDescription: string;
  city: string;
  country: string;
}) {
  const [activeId, setActiveId] = useState(rows[0]?.id ?? null);

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeId) ?? rows[0] ?? null,
    [activeId, rows],
  );

  if (rows.length === 0 || !activeRow) {
    return <MissingDataState description={emptyDescription} />;
  }

  const rawMapQuery = activeRow.mapQuery ?? `${activeRow.name}, ${city}, ${country}`;
  const activeMapQuery = encodeURIComponent(rawMapQuery);
  const activeMapZoom = activeRow.mapZoom ?? 14;
  const lowerSection = sectionLabel.toLowerCase();
  const scoutActions = lowerSection.includes("food")
    ? [
        { label: "Breakfast nearby", href: nearbySearch(rawMapQuery, "breakfast") },
        { label: "Coffee nearby", href: nearbySearch(rawMapQuery, "coffee") },
        { label: "Groceries nearby", href: nearbySearch(rawMapQuery, "grocery store") },
      ]
    : lowerSection.includes("health")
      ? [
          { label: "Pharmacy nearby", href: nearbySearch(rawMapQuery, "pharmacy") },
          { label: "Urgent care nearby", href: nearbySearch(rawMapQuery, "urgent care") },
          { label: "Dentist nearby", href: nearbySearch(rawMapQuery, "dentist") },
        ]
      : lowerSection.includes("transport")
        ? [
            { label: "Transit nearby", href: nearbySearch(rawMapQuery, "bus station") },
            { label: "Parking nearby", href: nearbySearch(rawMapQuery, "parking") },
            { label: "Car rental nearby", href: nearbySearch(rawMapQuery, "car rental") },
          ]
    : [
        { label: "Pharmacy nearby", href: nearbySearch(rawMapQuery, "pharmacy") },
        { label: "Parking nearby", href: nearbySearch(rawMapQuery, "parking") },
        { label: "ATM nearby", href: nearbySearch(rawMapQuery, "ATM") },
      ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Choose a {sectionLabel.toLowerCase()} lens</p>
        {rows.map((row) => {
          const isActive = row.id === activeRow.id;
          const rowMapQuery = encodeURIComponent(row.mapQuery ?? `${row.name}, ${city}, ${country}`);
          const listedSourceUrl = sanitizeExternalSourceUrl(row.url ?? row.verification.sourceUrl);
          const sourceHref = resolveSourceHref(row.url ?? row.verification.sourceUrl, [row.name, city, country, sectionLabel]);
          return (
            <div
              key={row.id}
              className={`rounded-[1.5rem] border p-4 transition ${isActive ? "border-[rgba(31,95,99,0.45)] bg-[rgba(31,95,99,0.1)] shadow-lg shadow-[rgba(31,95,99,0.16)]" : "border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] hover:border-[rgba(31,95,99,0.4)]"}`}
            >
              <button
                type="button"
                onClick={() => setActiveId(row.id)}
                className="w-full text-left"
              >
                <p className="text-sm font-semibold text-[var(--atlas-ink)]">{row.name}</p>
                {row.subtitle ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--atlas-muted)]">{row.subtitle}</p> : null}
                <p className="mt-3 text-sm text-[var(--atlas-accent)]">{summarizeLens(row)}</p>
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`https://www.google.com/maps/search/${rowMapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-[rgba(31,95,99,0.35)] bg-[rgba(255,255,255,0.84)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.12)]"
                >
                  Open map
                </Link>
                <Link
                  href={sourceHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-[rgba(31,95,99,0.28)] bg-[rgba(255,255,255,0.78)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.35)] hover:text-[var(--atlas-accent)]"
                >
                  {listedSourceUrl ? "Open source" : "Search official source"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.96),rgba(247,238,222,0.84))] p-6 shadow-xl shadow-[rgba(41,34,23,0.16)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">{sectionLabel} profile</p>
            <h3 className="mt-2 text-3xl font-semibold text-[var(--atlas-ink)]">{activeRow.name}</h3>
            {activeRow.subtitle ? <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--atlas-muted)]">{activeRow.subtitle}</p> : null}
          </div>
          <SourceVerificationBadge verification={activeRow.verification} />
        </div>

        {hasReadableValue(activeRow.value1) || hasReadableValue(activeRow.value2) ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {hasReadableValue(activeRow.value1) ? (
              <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Why it matters</p>
                <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{activeRow.value1}</p>
              </div>
            ) : null}
            {hasReadableValue(activeRow.value2) ? (
              <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Use it for</p>
                <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{activeRow.value2}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasReadableValue(activeRow.value3) ? (
          <div className="mt-4 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Pressure-test note</p>
            <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{activeRow.value3}</p>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.68)] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">Best for</p>
            <p className="mt-2 text-sm font-semibold text-[var(--atlas-ink)]">{spotBestFor(activeRow)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.68)] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">Watch for</p>
            <p className="mt-2 text-sm font-semibold text-[var(--atlas-ink)]">{spotWatchFor(activeRow)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.68)] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">Scout route</p>
            <p className="mt-2 text-sm font-semibold text-[var(--atlas-ink)]">Map stop → nearby essentials → return at a second time of day</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--atlas-border)] px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Mini map</p>
              <p className="text-sm text-[var(--atlas-muted)]">Use location context to decide whether this belongs in your real routine.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`https://www.google.com/maps/search/${activeMapQuery}`}
                target="_blank"
                className="inline-flex rounded-full border border-[rgba(31,95,99,0.35)] bg-[rgba(31,95,99,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.16)]"
              >
                View on map
              </Link>
              <Link
                href={`https://earth.google.com/web/search/${activeMapQuery}`}
                target="_blank"
                className="inline-flex rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.35)] hover:text-[var(--atlas-accent)]"
              >
                Google Earth
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-[var(--atlas-border)] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-muted)]">
            <span className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.86)] px-3 py-1">Map focus: {compactMapLabel(rawMapQuery)}</span>
            <span className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.86)] px-3 py-1">Zoom {activeMapZoom}</span>
            <span className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.86)] px-3 py-1">{summarizeLens(activeRow)}</span>
          </div>
          <iframe
            src={`https://www.google.com/maps?q=${activeMapQuery}&z=${activeMapZoom}&output=embed`}
            title={`${activeRow.name} map`}
            className="h-64 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {sanitizeExternalSourceUrl(activeRow.url ?? activeRow.verification.sourceUrl) ? (
            <Link
              href={resolveSourceHref(activeRow.url ?? activeRow.verification.sourceUrl, [activeRow.name, city, country, sectionLabel])}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-rose-300/70 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-900 transition hover:bg-rose-100"
            >
              Open source
            </Link>
          ) : null}
          <Link
            href={buildOfficialSourceSearchUrl([activeRow.name, city, country, sectionLabel])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.78)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.35)] hover:text-[var(--atlas-accent)]"
          >
            Search official source
          </Link>
          <span className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.78)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--atlas-muted)]">
            {rows.length} verified entries loaded
          </span>
        </div>

        <div className="mt-6 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Scout this stop next</p>
          <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">
            Launch a few nearby searches directly from this location so you can judge whether it fits your actual weekly routine.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scoutActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                target="_blank"
                className="inline-flex rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.84)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.35)] hover:text-[var(--atlas-accent)]"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}