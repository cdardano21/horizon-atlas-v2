"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { NamedRecord } from "../../lib/destination-command-center";
import { buildOfficialSourceSearchUrl, resolveSourceHref, sanitizeExternalSourceUrl } from "../../lib/source-links";
import MissingDataState from "./MissingDataState";
import SourceVerificationBadge from "./SourceVerificationBadge";

function buildLens(row: NamedRecord) {
  const text = `${row.subtitle ?? ""} ${row.value1 ?? ""} ${row.value2 ?? ""} ${row.value3 ?? ""}`.toLowerCase();
  if (text.includes("walk") || text.includes("pedestrian") || text.includes("errand")) return "Walkable daily rhythm";
  if (text.includes("quiet") || text.includes("space") || text.includes("park")) return "Quieter long-stay feel";
  if (text.includes("waterfront") || text.includes("marina") || text.includes("beach")) return "Waterfront lifestyle";
  return "District scouting lens";
}

function compactMapLabel(query: string) {
  return query.split(",").slice(0, 2).join(" • ");
}

function nearbySearch(query: string, term: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${term} near ${query}`)}`;
}

function districtBestFor(row: NamedRecord) {
  const text = `${row.subtitle ?? ""} ${row.value1 ?? ""} ${row.value2 ?? ""}`.toLowerCase();
  if (text.includes("walk") || text.includes("pedestrian")) return "Walkable daily life";
  if (text.includes("waterfront") || text.includes("marina") || text.includes("beach")) return "Waterfront living";
  if (text.includes("quiet") || text.includes("park") || text.includes("space")) return "Quieter long-stay routine";
  return "District-level scouting";
}

function districtWatchFor(row: NamedRecord) {
  const text = `${row.value3 ?? ""} ${row.value2 ?? ""}`.toLowerCase();
  if (text.includes("tourism") || text.includes("noise")) return "Peak-season pressure";
  if (text.includes("premium") || text.includes("price")) return "Convenience premium";
  if (text.includes("drive") || text.includes("access")) return "Mobility tradeoff";
  return "Routine-fit check";
}

function hasReadableValue(value: string | null | undefined) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return !normalized.includes("no verified information currently available") && !normalized.includes("data pending");
}

export default function NeighborhoodExplorer({ rows, city, country }: { rows: NamedRecord[]; city: string; country: string }) {
  const [activeId, setActiveId] = useState(rows[0]?.id ?? null);

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeId) ?? rows[0] ?? null,
    [activeId, rows],
  );

  if (rows.length === 0 || !activeRow) {
    return <MissingDataState description="No verified neighborhood information is currently available." />;
  }

  const rawMapQuery = activeRow.mapQuery ?? `${activeRow.name}, ${city}, ${country}`;
  const activeMapQuery = encodeURIComponent(rawMapQuery);
  const activeMapZoom = activeRow.mapZoom ?? 13;
  const scoutActions = [
    { label: "Cafes nearby", href: nearbySearch(rawMapQuery, "cafes") },
    { label: "Groceries nearby", href: nearbySearch(rawMapQuery, "grocery store") },
    { label: "Pharmacies nearby", href: nearbySearch(rawMapQuery, "pharmacy") },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Choose a district lens</p>
        {rows.map((row) => {
          const isActive = row.id === activeRow.id;
          const rowMapQuery = encodeURIComponent(row.mapQuery ?? `${row.name}, ${city}, ${country}`);
          const listedSourceUrl = sanitizeExternalSourceUrl(row.url ?? row.verification.sourceUrl);
          const sourceHref = resolveSourceHref(row.url ?? row.verification.sourceUrl, [row.name, city, country, "neighborhood"]);
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
                <p className="mt-3 text-sm text-[var(--atlas-accent)]">{buildLens(row)}</p>
              </button>
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`https://www.google.com/maps/search/${rowMapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full border border-[rgba(31,95,99,0.35)] bg-[rgba(255,255,255,0.84)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.12)]"
                  >
                    Open neighborhood map
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
            </div>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.96),rgba(247,238,222,0.84))] p-6 shadow-xl shadow-[rgba(41,34,23,0.16)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Neighborhood profile</p>
            <h3 className="mt-2 text-3xl font-semibold text-[var(--atlas-ink)]">{activeRow.name}</h3>
            {activeRow.subtitle ? <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--atlas-muted)]">{activeRow.subtitle}</p> : null}
          </div>
          <SourceVerificationBadge verification={activeRow.verification} />
        </div>

        {hasReadableValue(activeRow.value1) || hasReadableValue(activeRow.value2) ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {hasReadableValue(activeRow.value1) ? (
              <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Why people choose it</p>
                <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{activeRow.value1}</p>
              </div>
            ) : null}
            {hasReadableValue(activeRow.value2) ? (
              <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Daily-life signal</p>
                <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{activeRow.value2}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasReadableValue(activeRow.value3) ? (
          <div className="mt-4 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">What to pressure-test</p>
            <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{activeRow.value3}</p>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">Best for</p>
            <p className="mt-2 text-sm font-semibold text-white">{districtBestFor(activeRow)}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">Watch for</p>
            <p className="mt-2 text-sm font-semibold text-white">{districtWatchFor(activeRow)}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">Scout route</p>
            <p className="mt-2 text-sm font-semibold text-white">Home candidate → coffee → groceries → pharmacy</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/55">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Mini map</p>
              <p className="text-sm text-slate-300">Place the district in the wider city before you scout it.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`https://www.google.com/maps/search/${activeMapQuery}`}
                target="_blank"
                className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:bg-emerald-500/20"
              >
                View on map
              </Link>
              <Link
                href={`https://earth.google.com/web/search/${activeMapQuery}`}
                target="_blank"
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100 transition hover:border-emerald-400/40 hover:text-emerald-100"
              >
                Google Earth
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Map focus: {compactMapLabel(rawMapQuery)}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Zoom {activeMapZoom}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{buildLens(activeRow)}</span>
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
              href={resolveSourceHref(activeRow.url ?? activeRow.verification.sourceUrl, [activeRow.name, city, country, "neighborhood"])}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:bg-emerald-500/20"
            >
              Open source
            </Link>
          ) : null}
          <Link
            href={buildOfficialSourceSearchUrl([activeRow.name, city, country, "neighborhood"])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-100"
          >
            Search official source
          </Link>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-200">
            {rows.length} verified neighborhoods loaded
          </span>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Scout this area next</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Use these nearby searches to test whether the district works for ordinary days, not just your idealized version of the move.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scoutActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                target="_blank"
                className="inline-flex rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100 transition hover:border-emerald-400/40 hover:text-emerald-100"
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