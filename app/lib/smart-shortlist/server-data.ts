import { verifiedBeachAccessByDestination } from "../intelligence-v2/beach-access";
import { verifiedSkiAccessByDestination } from "../intelligence-v2/ski-access";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { EXPANSION_WORKBOOK_REGISTRY, type ExpansionWorkbookRegistryEntry } from "../expansion-workbook-registry";
import type { DeterministicV31CanonicalDestination, DeterministicV31CanonicalLifestyleFeature, DeterministicV31WorkbookImport } from "../workbook-v31-deterministic-core";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";
import { buildIntelligenceV2FactsFromWorkbookImport } from "../intelligence-v2/workbook-v32-adapter";
import { getSupabaseConfig, getSupabaseAuthHeaders, isSupabaseConfigured } from "../supabase";
import { smartShortlistCandidates } from "./cohort";
import type { PrototypeCandidate } from "./cohort";
import type { CoastalSetting, ShortlistFacts } from "./evaluator";
import type { OwnedAffordabilityRecord } from "./owned-affordability";
import { ownedAffordabilityRecords } from "./owned-affordability-records";

export type SmartShortlistIntelligence = Pick<
  ShortlistFacts,
  "beachEvidence" | "skiAccess" | "key" | "beachAccess" | "mountainAccess" | "oceanAccess" | "healthcareStandard" | "safetyStandard" | "lgbtqLegalProtectionStatus" | "entryAndStay" | "lifestyleDimensions"
>;

export type SmartShortlistData = {
  candidates: readonly PrototypeCandidate[];
  intelligence: readonly SmartShortlistIntelligence[];
  affordabilityRecords: readonly OwnedAffordabilityRecord[];
};

function cellString(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

export function deriveRegisteredCandidate(destination: DeterministicV31CanonicalDestination): PrototypeCandidate {
  const key = destination.identity.destinationKey;
  const name = cellString(destination.identity.name) || cellString(destination.identity.city) || key;
  const country = cellString(destination.identity.country);
  return {
    key,
    name,
    slug: cellString(destination.identity.slug) || key,
    country,
    countryCode: cellString(destination.destinationRow.country_code).toUpperCase(),
    summary: cellString(destination.editorial.shortDescription) || `${name}, ${country}`,
    beachAccess: "UNKNOWN",
    mountainAccess: "UNKNOWN",
    oceanAccess: "UNKNOWN",
    healthcareStandard: "UNKNOWN",
    safetyStandard: "UNKNOWN",
    lgbtqLegalProtectionStatus: "UNKNOWN",
    entryAndStay: {
      extendedStayOrLongStayVisaAvailable: "UNKNOWN",
      permanentResidencyPathAvailable: "UNKNOWN",
      retirementVisaProgramAvailable: "UNKNOWN",
      remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    },
    affordability: {},
    affordabilityReadiness: "INSUFFICIENT_FOR_AFFORDABILITY",
    normalizedAffordability: { providerId: null, index: null, band: null },
    localTotals: {},
    costRows: [],
    costSources: [],
  };
}

export function deriveRegisteredAffordability(destination: DeterministicV31CanonicalDestination): OwnedAffordabilityRecord | null {
  const rowsByHousehold = new Map<string, DeterministicV31CanonicalDestination["costOfLiving"]>();
  for (const row of destination.costOfLiving) {
    const household = cellString(row.household_type).toLowerCase();
    rowsByHousehold.set(household, [...(rowsByHousehold.get(household) ?? []), row]);
  }
  const midpoint = (household: "single" | "couple") => {
    const householdRows = rowsByHousehold.get(household) ?? [];
    const totals = householdRows.filter((row) => cellString(row.category).toLowerCase() === "u3_r5_total_monthly_estimate");
    // Keep the historical one-row-per-household format only when no U3-R5 total is supplied.
    // Invalid or duplicate authored totals must never fall back to a category subtotal.
    const hasU3R5 = destination.costOfLiving.some((row) => cellString(row.category).toLowerCase() === "u3_r5_total_monthly_estimate");
    const rows = hasU3R5 ? totals : householdRows;
    if (totals.length && (totals.length !== 1
      || cellString(totals[0].lifestyle_tier).toLowerCase() !== "comfortable"
      || cellString(totals[0].stay_mode_key).toUpperCase() !== "RELOCATE")) return null;
    if (rows.length !== 1 || cellString(rows[0].currency).toUpperCase() !== "USD") return null;
    const low = Number(rows[0].monthly_low);
    const high = Number(rows[0].monthly_high);
    return Number.isFinite(low) && Number.isFinite(high) && low > 0 && high >= low ? (low + high) / 2 : null;
  };
  const singleMonthlyUsd = midpoint("single");
  const coupleMonthlyUsd = midpoint("couple");
  if (singleMonthlyUsd === null || coupleMonthlyUsd === null) return null;
  return { destinationKey: destination.identity.destinationKey, singleMonthlyUsd, coupleMonthlyUsd, estimateYear: 2026 };
}

export function buildRegisteredWorkbookContributions(
  entry: ExpansionWorkbookRegistryEntry,
  workbook: DeterministicV31WorkbookImport,
  existingKeys: ReadonlySet<string>,
): { candidates: PrototypeCandidate[]; affordabilityRecords: OwnedAffordabilityRecord[] } {
  const canonicalDestinations = workbook.canonicalDestinations;
  if (!canonicalDestinations) throw new Error(`${entry.registryId} did not produce canonical destinations`);
  const actualKeys = canonicalDestinations.map((destination) => destination.identity.destinationKey);
  if (new Set(actualKeys).size !== actualKeys.length
    || actualKeys.length !== entry.expectedDestinationKeys.length
    || actualKeys.some((key) => !entry.expectedDestinationKeys.includes(key))) {
    throw new Error(`${entry.registryId} destination keys do not match its approved registry ownership`);
  }
  const candidates: PrototypeCandidate[] = [];
  const affordabilityRecords: OwnedAffordabilityRecord[] = [];
  for (const destination of canonicalDestinations) {
    if (existingKeys.has(destination.identity.destinationKey)) continue;
    const affordability = deriveRegisteredAffordability(destination);
    candidates.push({
      ...deriveRegisteredCandidate(destination),
      affordabilityReadiness: affordability ? "LOCAL_EVIDENCE_READY" : "INSUFFICIENT_FOR_AFFORDABILITY",
    });
    if (affordability) affordabilityRecords.push(affordability);
  }
  return { candidates, affordabilityRecords };
}

function normalizedToken(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? "";
}

export function coastalSettingFromLifestyleFeatures(
  rows: readonly DeterministicV31CanonicalLifestyleFeature[],
): CoastalSetting {
  const coastalRows = rows.filter((row) => normalizedToken(row.feature_key) === "COASTAL_SETTING"
    && normalizedToken(row.matching_enabled) === "YES");
  if (coastalRows.length !== 1) return "UNKNOWN";

  const [row] = coastalRows;
  const featureValue = normalizedToken(row.feature_value);
  if (featureValue === "COASTAL" || featureValue === "INLAND" || featureValue === "HYBRID") {
    return featureValue;
  }

  const availability = normalizedToken(row.availability_level);
  const proximity = normalizedToken(row.proximity_band);
  if (availability === "STRONG" && proximity === "IN_DESTINATION") return "COASTAL";
  if (availability === "NONE") return "INLAND";
  return "UNKNOWN";
}

type PublishedCatalogIdentity = { id: string; destination_key: string; slug: string; status: string };

async function loadPublishedCatalogIdentities(keys: readonly string[]): Promise<PublishedCatalogIdentity[]> {
  if (!keys.length || !isSupabaseConfigured()) return [];
  const { url } = getSupabaseConfig();
  const query = new URLSearchParams({
    select: "id,destination_key,slug,status",
    destination_key: `in.(${keys.join(",")})`,
    status: "eq.published",
  });
  // Publication is checked afresh; a previously published result cannot bypass a later unpublish.
  try {
    const response = await fetch(`${url}/rest/v1/destinations_catalog?${query}`, {
      headers: getSupabaseAuthHeaders(), cache: "no-store",
    });
    if (!response.ok) return [];
    const rows: PublishedCatalogIdentity[] = await response.json();
    return Array.isArray(rows) ? rows : [];
  } catch {
    // Unavailable publication evidence excludes new identities without breaking legacy candidates.
    return [];
  }
}

export async function discoverRegisteredWorkbookContributions(
  entry: ExpansionWorkbookRegistryEntry,
  workbook: DeterministicV31WorkbookImport,
  existingKeys: ReadonlySet<string>,
) {
  const contributions = buildRegisteredWorkbookContributions(entry, workbook, existingKeys);
  if (entry.candidateDiscovery !== "published-catalog") {
    // Existing legacy registry discovery remains unchanged.
    return entry.environment === "preview" ? contributions : { candidates: [], affordabilityRecords: [] };
  }
  if (entry.environment !== "production") return { candidates: [], affordabilityRecords: [] };
  const rows = await loadPublishedCatalogIdentities(contributions.candidates.map((candidate) => candidate.key));
  const eligible = new Set(contributions.candidates.filter((candidate) => {
    const owners = rows.filter((row) => row.destination_key === candidate.key || row.slug === candidate.slug);
    return owners.length === 1 && owners[0].status === "published" && Boolean(owners[0].id)
      && owners[0].destination_key === candidate.key && owners[0].slug === candidate.slug;
  }).map((candidate) => candidate.key));
  return {
    candidates: contributions.candidates.filter((candidate) => eligible.has(candidate.key)),
    affordabilityRecords: contributions.affordabilityRecords.filter((record) => eligible.has(record.destinationKey)),
  };
}

export async function loadSmartShortlistData(
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<SmartShortlistData> {
  const candidates = [...smartShortlistCandidates];
  const affordabilityRecords = [...ownedAffordabilityRecords];
  const candidateByKey = new Map(candidates.map((candidate) => [candidate.key, candidate]));
  const loaded = new Map<string, SmartShortlistIntelligence>();

  for (const entry of registry) {
    const workbookPath = path.resolve(process.cwd(), entry.workbookPath);
    if (!entry.expectedSha256) throw new Error(`${entry.registryId} must pin expectedSha256 before Smart Shortlist activation`);
    const actualSha256 = createHash("sha256").update(readFileSync(workbookPath)).digest("hex");
    if (actualSha256 !== entry.expectedSha256) throw new Error(`${entry.registryId} failed SHA-256 validation`);
    const workbook = await loadFrozenWorkbookV31DeterministicImport(workbookPath);
    if (workbook.validationErrors?.length) {
      throw new Error(`${entry.registryId} failed validation: ${workbook.validationErrors.join("; ")}`);
    }
    {
      const contributions = await discoverRegisteredWorkbookContributions(entry, workbook, new Set(candidateByKey.keys()));
      for (const candidate of contributions.candidates) {
        candidateByKey.set(candidate.key, candidate);
        candidates.push(candidate);
      }
      affordabilityRecords.push(...contributions.affordabilityRecords);
    }

    for (const key of entry.expectedDestinationKeys) {
      if (!candidateByKey.has(key)) continue;
      if (loaded.has(key)) throw new Error(`Duplicate Smart Shortlist destination key: ${key}`);
      const canonical = workbook.canonicalDestinations.find((destination) => destination.identity.destinationKey === key);
      const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbook, key);
      if (!canonical || !adapted) throw new Error(`${entry.registryId} does not contain expected destination key: ${key}`);

      loaded.set(key, {
        key,
        beachEvidence: verifiedBeachAccessByDestination[key],
        skiAccess: verifiedSkiAccessByDestination[key],
        beachAccess: adapted.facts.hardGates.beachAccess,
        mountainAccess: adapted.facts.hardGates.mountainOrSkiAccess === "MOUNTAIN_SCENIC_ONLY"
          ? "MOUNTAIN_ACCESS"
          : adapted.facts.hardGates.mountainOrSkiAccess,
        oceanAccess: coastalSettingFromLifestyleFeatures(canonical.lifestyleFeatures),
        healthcareStandard: adapted.facts.hardGates.healthcareStandard,
        safetyStandard: adapted.facts.hardGates.safetyStandard,
        lgbtqLegalProtectionStatus: adapted.facts.hardGates.lgbtqLegalProtectionStatus,
        entryAndStay: {
          extendedStayOrLongStayVisaAvailable: adapted.facts.entryAndStay.extendedStayOrLongStayVisaAvailable,
          permanentResidencyPathAvailable: adapted.facts.entryAndStay.permanentResidencyPathAvailable,
          retirementVisaProgramAvailable: adapted.facts.entryAndStay.retirementVisaProgramAvailable,
          remoteWorkOrDigitalNomadVisaAvailable: adapted.facts.entryAndStay.remoteWorkOrDigitalNomadVisaAvailable,
        },
        lifestyleDimensions: adapted.facts.lifestyleDimensions.dimensionValues,
      });
    }
  }

  const missingKeys = candidates.map((candidate) => candidate.key).filter((key) => !loaded.has(key));
  if (missingKeys.length > 0) throw new Error(`Missing Smart Shortlist workbook facts: ${missingKeys.join(", ")}`);
  return {
    candidates,
    intelligence: candidates.map((candidate) => loaded.get(candidate.key)!),
    affordabilityRecords,
  };
}

export async function loadSmartShortlistIntelligence(): Promise<readonly SmartShortlistIntelligence[]> {
  return (await loadSmartShortlistData()).intelligence;
}
