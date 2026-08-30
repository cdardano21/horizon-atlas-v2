"use client";

import { useState, type ReactNode } from "react";
import type { CanonicalDestinationV31Modules } from "../../lib/canonical-destination-model";
import { sanitizePublicText } from "../../lib/sanitize-public-text";

type LifestyleFeatureRow = CanonicalDestinationV31Modules["lifestyleFeatures"][number];
type StructuredPlace = CanonicalDestinationV31Modules["places"][number];

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
  // A simpler LIFESTYLE_FEATURES schema variant omits display_enabled entirely (null, not "YES"
  // or "NO") - absence of this gate is never treated as "hide it", only an explicit non-"YES"
  // value is.
  if (row.displayEnabled !== null && row.displayEnabled !== "YES") return false;
  if (row.featureKey && SHOWN_ELSEWHERE_ON_PAGE.has(row.featureKey)) return false;
  // Same reasoning for availability_level: when it's genuinely absent from the sheet, fall back to
  // showing the row on its real evidence_summary/display text alone, with no availability badge.
  if (row.availabilityLevel === null) return Boolean(row.evidenceSummary?.trim() || row.displayLabel?.trim());
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

function buildPlaceMapsSearchUrl(placeName: string, destinationCity: string, destinationCountry: string): string {
  const query = [placeName, destinationCity, destinationCountry].filter((part) => part && part.trim().length > 0).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// A deterministic, reviewable lookup from a structured LIFESTYLE_FEATURES feature_key to the
// structured PLACES.category values that are genuinely relevant to it - both sides are structured
// fields (never narrative prose). Feature keys not listed here (e.g. climate_comfort, walkability,
// internet) have no natural place category and simply contribute no "Named places" row. Covers
// both the rich Batch1/2 "*_access"/"*_strength" taxonomy and the simpler legacy taxonomy.
const FEATURE_KEY_PLACE_CATEGORIES: Record<string, readonly string[]> = {
  airport_access: ["airport", "transport", "transit_hub"],
  arts_culture_strength: ["museum", "theater", "arts", "performing_arts", "culture"],
  beach_access: ["beach"],
  boat_launch_access: ["marina", "water_recreation"],
  boating_marinas: ["marina", "water_recreation"],
  car_need: ["transport"],
  coastal_setting: ["beach"],
  coffee: ["coffee_shop", "coffee_farm", "coffee", "tea_shop"],
  college_town_character: ["university"],
  community: ["social"],
  community_energy: ["social"],
  countryside_access: ["nature", "park"],
  culture_museums: ["museum", "historic_site", "culture", "arts_district", "cinema", "shrine", "temple", "arts"],
  cycling: ["trail"],
  dining: ["restaurant", "food_shop", "dining", "bakery"],
  dining_strength: ["restaurant", "bakery", "dining", "food_shop"],
  education: ["university", "library"],
  expat_presence: ["social"],
  farmers_market_access: ["farmers_market", "market"],
  fishing: ["water_recreation"],
  fishing_access: ["water_recreation"],
  forest_access: ["park", "nature", "trail"],
  golf: ["golf"],
  golf_access: ["golf"],
  grocery: ["market", "food_shop", "grocery", "farmers_market"],
  healthcare: ["hospital", "healthcare", "urgent_care"],
  hiking: ["trail", "park"],
  hiking_access: ["trail", "park"],
  kayaking_access: ["water_recreation", "marina"],
  lake_access: ["water_recreation", "marina", "beach"],
  lakes_rivers: ["water_recreation", "marina"],
  marina_access: ["marina"],
  master_planned_or_gated_character: ["neighborhood_anchor"],
  mountain_access: ["trail", "park", "nature"],
  mountain_biking_access: ["trail"],
  natural_setting: ["park", "garden", "beach", "trail"],
  nightlife: ["nightlife", "live_music"],
  nightlife_strength: ["nightlife", "live_music"],
  paddleboarding_access: ["water_recreation", "marina"],
  parks_gardens: ["park", "garden"],
  parks_open_space_access: ["park", "garden", "nature"],
  performing_arts: ["performing_arts", "theater"],
  pickleball_access: ["recreation"],
  powerboating_access: ["marina", "water_recreation"],
  remote_work: ["coworking"],
  river_access: ["water_recreation", "marina"],
  road_cycling_access: ["trail"],
  sailing_access: ["marina", "water_recreation"],
  scuba_snorkeling_access: ["water_recreation", "beach"],
  shopping_markets: ["shopping", "market", "bookstore"],
  skiing: ["skiing", "skiing_winter"],
  skiing_snowboarding_access: ["skiing_winter", "skiing"],
  slip_or_mooring_access: ["marina"],
  snow_access: ["skiing_winter", "skiing"],
  surfing_access: ["beach", "water_recreation"],
  swimming: ["beach", "water_recreation"],
  swimming_access: ["beach", "water_recreation"],
  tennis_access: ["recreation"],
  trail_access: ["trail"],
  transit: ["transport", "transit_hub", "airport"],
};

// Structured places genuinely associated with this row's category, excluding any place already
// shown as an inline link within `visibleEvidenceText` (never displayed twice on the same card) -
// this never guesses a category from prose, only from the row's own structured feature_key.
function resolveCategoryPlacesForRow(row: LifestyleFeatureRow, places: readonly StructuredPlace[], visibleEvidenceText: string | null): StructuredPlace[] {
  const categories = row.featureKey ? FEATURE_KEY_PLACE_CATEGORIES[row.featureKey] : undefined;
  if (!categories || categories.length === 0) return [];
  const categorySet = new Set(categories);
  const seenNames = new Set<string>();
  return places.filter((place) => {
    if (!place.category || !categorySet.has(place.category)) return false;
    const name = (place.name ?? "").trim();
    if (!name || seenNames.has(name)) return false;
    if (visibleEvidenceText && visibleEvidenceText.includes(name)) return false;
    seenNames.add(name);
    return true;
  });
}

function NamedPlacesRow({ places, destinationCity, destinationCountry }: { places: readonly StructuredPlace[]; destinationCity: string; destinationCountry: string }) {
  if (places.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Named places</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {places.map((place) => {
          const name = (place.name ?? "").trim();
          const href = place.websiteUrl || place.googleMapsUrl || buildPlaceMapsSearchUrl(name, destinationCity, destinationCountry);
          return (
            <a
              key={place.placeKey}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-cyan-200 hover:bg-slate-950/60"
            >
              {name}
            </a>
          );
        })}
      </div>
    </div>
  );
}

// Wraps ONLY exact occurrences of a real, structured place_name in this evidence sentence with a
// link - never a place name guessed/extracted from prose. Priority for the link target: an
// existing stored website, then an existing stored Google Maps URL, then an existing stored
// source URL, and only as a last resort a freshly generated Google Maps search URL. A place with
// no usable name, or that simply never appears in this particular sentence, contributes no link.
function linkifyStructuredPlaceNames(text: string, places: readonly StructuredPlace[], destinationCity: string, destinationCountry: string): ReactNode {
  const candidateNames = Array.from(
    new Set(
      places
        .map((place) => (place.name ?? "").trim())
        .filter((name) => name.length > 2 && text.includes(name)),
    ),
  ).sort((left, right) => right.length - left.length);

  if (candidateNames.length === 0) return text;

  const matches: Array<{ start: number; end: number; name: string }> = [];
  const overlapsExistingMatch = (start: number, end: number) => matches.some((match) => start < match.end && end > match.start);
  for (const name of candidateNames) {
    let searchFrom = 0;
    while (searchFrom <= text.length) {
      const index = text.indexOf(name, searchFrom);
      if (index === -1) break;
      const end = index + name.length;
      if (!overlapsExistingMatch(index, end)) {
        matches.push({ start: index, end, name });
      }
      searchFrom = index + name.length;
    }
  }
  if (matches.length === 0) return text;
  matches.sort((left, right) => left.start - right.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((match, index) => {
    if (match.start > cursor) nodes.push(text.slice(cursor, match.start));
    const place = places.find((candidate) => (candidate.name ?? "").trim() === match.name);
    const href = place?.websiteUrl || place?.googleMapsUrl || place?.sourceUrl || buildPlaceMapsSearchUrl(match.name, destinationCity, destinationCountry);
    nodes.push(
      <a
        key={`${match.name}-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-cyan-400/50 underline-offset-2 hover:text-cyan-200"
      >
        {match.name}
      </a>,
    );
    cursor = match.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

// Detects a card whose full description either exactly duplicates the destination's editorial
// overview, or is already fully covered - verbatim - inside a different, earlier, already-visible
// card's description in the same panel. This is conservative exact/near-exact matching only (no
// fuzzy matching, no rewriting): a description is only suppressed when its normalized text is
// byte-for-byte identical to the overview, or is entirely contained within a prior card's
// normalized text. It never removes a card's title, badge, or a description that has any content
// beyond what's already visible.
function resolveSuppressedEvidenceKeys(rows: readonly LifestyleFeatureRow[], overviewText: string): Set<string> {
  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/^["'“”]+|["'“”.,;: ]+$/g, "");

  const normalizedOverview = normalize(overviewText || "");
  const suppressed = new Set<string>();
  const seenNormalizedText: string[] = [];

  for (const row of rows) {
    const sanitized = sanitizePublicText(row.evidenceSummary);
    if (!sanitized) continue;
    const normalized = normalize(sanitized);
    // Short phrases (e.g. "No evidence found.") are excluded from both sides of the comparison -
    // they're too generic for containment to mean genuine duplication, and would otherwise cause
    // unrelated cards to be suppressed against each other.
    if (normalized.length < 40) {
      seenNormalizedText.push(normalized);
      continue;
    }
    const duplicatesOverview = normalizedOverview.length >= 40 && normalized === normalizedOverview;
    const duplicatesEarlierCard = seenNormalizedText.some((priorText) => priorText.length >= 40 && priorText.includes(normalized));
    if (duplicatesOverview || duplicatesEarlierCard) {
      suppressed.add(row.recordKey);
    } else {
      seenNormalizedText.push(normalized);
    }
  }
  return suppressed;
}

function FeatureCard({
  row,
  places,
  destinationCity,
  destinationCountry,
  hideEvidence = false,
}: {
  row: LifestyleFeatureRow;
  places: readonly StructuredPlace[];
  destinationCity: string;
  destinationCountry: string;
  hideEvidence?: boolean;
}) {
  const title = row.displayLabel?.trim() || humanizeFeatureKey(row.featureKey);
  const availability = describeAvailability(row);
  const evidence = hideEvidence ? null : sanitizePublicText(row.evidenceSummary);
  const categoryPlaces = resolveCategoryPlacesForRow(row, places, evidence);

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
      {evidence ? <p className="mt-3 text-sm leading-6 text-slate-300">{linkifyStructuredPlaceNames(evidence, places, destinationCity, destinationCountry)}</p> : null}
      <NamedPlacesRow places={categoryPlaces} destinationCity={destinationCity} destinationCountry={destinationCountry} />
    </div>
  );
}

function LifestyleGroupPanel({ group, rows, places, destinationCity, destinationCountry }: { group: LifestyleGroupDefinition; rows: LifestyleFeatureRow[]; places: readonly StructuredPlace[]; destinationCity: string; destinationCountry: string }) {
  const VISIBLE_COUNT = 3;
  const visibleRows = rows.slice(0, VISIBLE_COUNT);
  const remainingRows = rows.slice(VISIBLE_COUNT);

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{group.label}</p>
      <p className="mt-1 text-xs text-slate-400">{group.description}</p>
      <div className="mt-4 grid gap-3">
        {visibleRows.map((row) => (
          <FeatureCard key={row.recordKey} row={row} places={places} destinationCity={destinationCity} destinationCountry={destinationCountry} />
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
              <FeatureCard key={row.recordKey} row={row} places={places} destinationCity={destinationCity} destinationCountry={destinationCountry} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

export default function LifestyleRecreationSection({
  lifestyleFeatures,
  places = [],
  destinationCity = "",
  destinationCountry = "",
  overviewText = "",
}: {
  lifestyleFeatures: CanonicalDestinationV31Modules["lifestyleFeatures"];
  places?: CanonicalDestinationV31Modules["places"];
  destinationCity?: string;
  destinationCountry?: string;
  overviewText?: string;
}) {
  const [showAllGroups, setShowAllGroups] = useState(false);

  const displayableRows = lifestyleFeatures.filter(isDisplayableRow);
  if (displayableRows.length === 0) {
    return null;
  }

  const groupsWithRows = GROUP_DEFINITIONS.map((group) => ({
    group,
    rows: displayableRows.filter((row) => row.featureGroup === group.key),
  })).filter((entry) => entry.rows.length > 0);

  // A simpler LIFESTYLE_FEATURES schema variant has no feature_group taxonomy at all - rather than
  // dropping 40+ real, evidence-backed rows because none match the fixed 5-group taxonomy, show
  // them in a single ungrouped panel instead of fabricating group assignments that aren't real.
  if (groupsWithRows.length === 0) {
    const ungroupedRows = displayableRows.filter((row) => !row.featureGroup);
    if (ungroupedRows.length === 0) {
      return null;
    }
    // Only this ungrouped/simple-schema rendering path (used exclusively by the legacy-rollover
    // destinations) applies duplicate-description suppression - the grouped rich-schema path
    // (Batch 1/2) is left untouched since its cards are independent, evidence-backed rows rather
    // than narrative text that repeats a broader description.
    const suppressedEvidenceKeys = resolveSuppressedEvidenceKeys(ungroupedRows, overviewText);
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
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ungroupedRows.map((row) => (
            <FeatureCard
              key={row.recordKey}
              row={row}
              places={places}
              destinationCity={destinationCity}
              destinationCountry={destinationCountry}
              hideEvidence={suppressedEvidenceKeys.has(row.recordKey)}
            />
          ))}
        </div>
      </section>
    );
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
          <LifestyleGroupPanel key={group.key} group={group} rows={rows} places={places} destinationCity={destinationCity} destinationCountry={destinationCountry} />
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
