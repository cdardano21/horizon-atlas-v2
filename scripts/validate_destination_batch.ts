import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXPANSION_WORKBOOK_REGISTRY } from "../app/lib/expansion-workbook-registry";
import { adaptWorkbookDestinationToIntelligenceV2Facts } from "../app/lib/intelligence-v2/workbook-v32-adapter";
import { loadFrozenWorkbookV31DeterministicImport } from "../app/lib/workbook-v31-deterministic-core";

type BatchContract = {
  contractId: string;
  contractVersion: string;
  sheetContract: {
    authoringSheetCount: number;
    parserCompatibilityRequiredSheets: string[];
    sheetOrder: string[];
  };
  headers: Record<string, string[]>;
  requiredMetadata: Record<string, string>;
  u3r5: {
    estimateYear: number;
    requiredHouseholds: string[];
    lifestyleTier: string;
    category: string;
    stayModeKey: string;
    currency: string;
  };
  climateFormulas: {
    expectedFormulasPerDestination: number;
  };
  authoringParity: {
    populationRequired: boolean;
    populationProvenanceRequired: boolean;
    minimumDisplayableLifestyleRowsPerDestination: number;
    lifestyleExceptionRequiresExplicitReview: boolean;
    lifestyleEvidenceRequired: boolean;
    lifestyleSourceUrlRequired: boolean;
    customerCopyMustDescribeDestinationNotPipeline: boolean;
    allowedLifestyleFeatureKeys: string[];
  };
};

type ClimateValidationRow = {
  destinationKey: string;
  month: unknown;
  // Direct values or cached formula results; formulas are never evaluated here.
  values: unknown[];
};

export function validateClimateRows(rows: readonly ClimateValidationRow[], expectedKeys: readonly string[]): string[] {
  const errors: string[] = [];
  const months = new Map(expectedKeys.map((key) => [key, new Set<number>()]));
  const fields = ["avg_high_c", "avg_low_c", "rainfall_mm", "humidity_pct"];
  for (const row of rows) {
    const label = `CLIMATE_MONTHLY ${row.destinationKey}/${String(row.month)}`;
    const ownedMonths = months.get(row.destinationKey);
    if (!ownedMonths) errors.push(`${label}: unexpected destination ownership.`);
    if (typeof row.month !== "number" || !Number.isInteger(row.month) || row.month < 1 || row.month > 12) {
      errors.push(`${label}: month must be an integer from 1 to 12.`);
    } else if (ownedMonths) {
      if (ownedMonths.has(row.month)) errors.push(`${label}: duplicate destination/month.`);
      ownedMonths.add(row.month);
    }
    fields.forEach((field, index) => {
      const value = row.values[index];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        errors.push(`${label}: ${field} requires a finite numeric direct value or cached formula result.`);
      }
    });
  }
  for (const [key, values] of months) {
    if (values.size !== 12) errors.push(`CLIMATE_MONTHLY ${key}: expected 12 distinct months; found ${values.size}.`);
  }
  return errors;
}

type WorkbookStructure = {
  sheetNames: string[];
  headers: Record<string, string[]>;
  metadata: Record<string, string>;
  manifestKeys: string[];
  climateRows: ClimateValidationRow[];
  excelErrorCells: string[];
  destinationRows: Array<{ destinationKey: string; population: unknown }>;
  sourceRows: Array<{ destinationKey: string; sourceKey: string; sourceName: string; sourceUrl: string; sourceType: string; notes: string }>;
  lifestyleRows: Array<{ recordKey: string; destinationKey: string; featureKey: string; displayName: string; displayOrder: unknown; evidenceSummary: string; sourceUrl: string }>;
  destinationScoreRowCount: number;
  customerCopyCells: Array<{ sheet: string; field: string; row: number; destinationKey: string; value: string }>;
};

export type DestinationBatchValidationReport = {
  validator: "destinationfinder-read-only-v3.3";
  readOnly: true;
  workbookPath: string;
  sha256: string;
  contractId: string;
  registryId: string | null;
  expectedDestinationKeys: string[];
  parsedDestinationKeys: string[];
  sheetCount: number;
  destinationScoreRowCount: number;
  structuralStatus: "PASS" | "FAIL";
  parserStatus: "PASS" | "FAIL";
  batchIntegrityStatus: "PASS" | "FAIL";
  authoringParityStatus: "PASS" | "FAIL";
  authoringReadinessStatus: "AUTHORING_COMPLETE" | "REVIEW_REQUIRED";
  errors: string[];
  warnings: string[];
  authoringParityErrors: string[];
  authoringParityWarnings: string[];
  destinationSummaries: Array<{
    destinationKey: string;
    moduleCounts: Record<string, number>;
    unknownDecisionFacts: string[];
    populationPresent: boolean;
    populationProvenancePresent: boolean;
    displayableLifestyleRows: number;
  }>;
};

type ValidationOptions = {
  workbookPath: string;
  registryId?: string;
  expectedDestinationKeys?: string[];
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = path.join(repoRoot, "docs/destinationfinder/batch-contract-v3.3.json");

const PYTHON_INSPECTOR = String.raw`
import json, sys
from openpyxl import load_workbook

workbook = load_workbook(sys.argv[1], read_only=True, data_only=False)
headers = {}
for sheet in workbook.worksheets:
    iterator = sheet.iter_rows(values_only=True)
    first = next(iterator, ())
    headers[sheet.title] = [str(value) if value is not None else "" for value in first]

def records(sheet_name):
    sheet = workbook[sheet_name]
    iterator = sheet.iter_rows(values_only=True)
    names = [str(value) if value is not None else "" for value in next(iterator, ())]
    return [dict(zip(names, row)) for row in iterator if any(value is not None for value in row)]

metadata = {
    str(row.get("metadata_key")): str(row.get("value"))
    for row in records("WORKBOOK_METADATA")
    if row.get("metadata_key") is not None
}
manifest_keys = [
    str(row.get("destination_key"))
    for row in records("IMPORT_MANIFEST")
    if row.get("destination_key") is not None
]
cached_workbook = load_workbook(sys.argv[1], read_only=True, data_only=True)
climate_rows = []
for row in cached_workbook["CLIMATE_MONTHLY"].iter_rows(min_row=2):
  if not any(cell.value is not None for cell in row):
    continue
  climate_rows.append({
    "destinationKey": str(row[0].value or ""),
    "month": row[1].value,
    "values": [cell.value for cell in row[2:6]],
  })

excel_error_cells = []
for sheet in workbook.worksheets:
  for row in sheet.iter_rows():
    for cell in row:
      if cell.data_type == "e":
        excel_error_cells.append(f"{sheet.title}!{cell.coordinate}")

destination_rows = [{
  "destinationKey": str(row.get("destination_key") or ""),
  "population": row.get("population"),
} for row in records("DESTINATIONS")]
source_rows = [{
  "destinationKey": str(row.get("destination_key") or ""),
  "sourceKey": str(row.get("source_key") or ""),
  "sourceName": str(row.get("source_name") or ""),
  "sourceUrl": str(row.get("source_url") or ""),
  "sourceType": str(row.get("source_type") or ""),
  "notes": str(row.get("notes") or ""),
} for row in records("SOURCES")]
lifestyle_rows = [{
  "recordKey": str(row.get("record_key") or ""),
  "destinationKey": str(row.get("destination_key") or ""),
  "featureKey": str(row.get("feature_key") or ""),
  "displayName": str(row.get("display_name") or row.get("display_label") or ""),
  "displayOrder": row.get("display_order"),
  "evidenceSummary": str(row.get("evidence_summary") or ""),
  "sourceUrl": str(row.get("source_url") or ""),
} for row in records("LIFESTYLE_FEATURES")]

customer_visible_fields = {
  "DESTINATIONS": ["short_description", "long_description"],
  "DESTINATION_FACTS": ["value_text"],
  "NEIGHBORHOODS": ["best_for", "summary", "housing_character", "walkability_rating", "safety_rating", "transit_rating", "pros", "cons"],
  "PLACES": ["description", "best_for"],
  "RESOURCES": ["description"],
  "MEDIA": ["caption", "subject"],
  "HOUSING_PROPERTY": ["restrictions_summary", "buying_process_summary", "rental_rules_notes"],
  "HEALTHCARE_INSURANCE": ["system_summary", "public_access_foreigners", "international_insurance_notes", "pharmacy_notes"],
  "VISA_RESIDENCY": ["visa_type", "residency_option", "work_rights", "renewal_notes", "permanent_residency_path", "citizenship_path"],
  "TAXES_FINANCE": ["summary", "income_tax_notes", "retirement_income_notes", "capital_gains_notes", "property_tax_notes", "vat_sales_tax_notes", "inheritance_wealth_notes", "us_tax_treaty_notes", "bank_account_foreigner_notes", "currency_notes"],
  "LGBTQ_INCLUSIVITY": ["social_acceptance", "community_scene", "pride_events", "nightlife_social", "healthcare_access", "areas_resources", "safety_considerations", "evidence_summary"],
  "SAFETY_RISKS": ["summary", "mitigation_notes"],
  "TRANSPORT_AIRPORTS": ["name", "summary", "parking_notes", "rideshare_notes"],
  "CONNECTIVITY_REMOTE_WORK": ["coworking_summary", "us_time_zone_fit", "remote_work_notes"],
  "LANGUAGE_INTEGRATION": ["integration_notes", "language_resources"],
  "PETS": ["import_requirements", "quarantine_notes", "vaccination_notes", "pet_friendly_rentals", "vet_access", "emergency_vet_access", "dog_parks_summary", "airline_notes"],
  "FAMILY_EDUCATION": ["summary", "international_schools", "childcare_notes", "universities", "pediatric_care", "family_activities"],
  "COMMUNITY_SOCIAL": ["summary", "expat_presence", "clubs_groups", "volunteering", "ease_meeting_people", "age_mix", "transient_vs_rooted"],
  "ACCESSIBILITY": ["wheelchair_access", "sidewalk_quality", "hills_terrain", "accessible_transit", "elevator_access", "medical_equipment", "mobility_notes"],
  "BUREAUCRACY_SETUP": ["summary", "typical_documents", "estimated_timeline"],
  "WORK_BUSINESS": ["major_industries", "employment_notes", "work_authorization", "entrepreneurship", "business_formation", "coworking", "remote_work_suitability"],
  "RETIREMENT_AGING": ["medicare_notes", "social_security_notes", "senior_discounts", "assisted_living", "home_healthcare", "aging_in_place", "retirement_notes"],
  "LIFESTYLE_LAWS": ["summary", "important_rules"],
  "REALITY_CHECK": ["title", "detail"],
  "MOVE_CHECKLIST": ["task", "description"],
  "ENVIRONMENT_QUALITY": ["air_quality_summary", "water_quality_summary", "heat_humidity_comfort", "noise_summary", "light_pollution_summary", "mosquito_pest_pressure", "wildfire_smoke_exposure", "drought_water_stress", "environmental_notes"],
  "DAILY_LIFE_PRACTICALITY": ["car_need", "driving_difficulty", "parking_difficulty", "grocery_access", "pharmacy_access", "fitness_wellness_access", "banking_practicality", "card_payment_acceptance", "cash_usage", "mobile_payment_usage", "delivery_services", "emergency_services_summary", "senior_services_summary", "childcare_access", "newcomer_friction", "things_residents_wish_they_knew"],
  "EVENTS_SEASONALITY": ["name", "description", "weather_context", "best_for", "avoid_if"],
  "LIFESTYLE_FEATURES": ["display_name", "display_label", "evidence_summary"],
}
customer_copy_cells = []
for sheet_name, fields in customer_visible_fields.items():
  if sheet_name not in workbook.sheetnames:
    continue
  for row_number, row in enumerate(records(sheet_name), start=2):
    destination_key = str(row.get("destination_key") or "")
    for field in fields:
      value = row.get(field)
      if value is not None and str(value).strip():
        customer_copy_cells.append({"sheet": sheet_name, "field": field, "row": row_number, "destinationKey": destination_key, "value": str(value)})
print(json.dumps({
    "sheetNames": workbook.sheetnames,
    "headers": headers,
    "metadata": metadata,
    "manifestKeys": manifest_keys,
    "climateRows": climate_rows,
    "excelErrorCells": excel_error_cells,
    "destinationRows": destination_rows,
    "sourceRows": source_rows,
    "lifestyleRows": lifestyle_rows,
    "destinationScoreRowCount": len(records("DESTINATION_SCORES")),
    "customerCopyCells": customer_copy_cells,
}))
`;

function sameArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicateValues = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicateValues.add(value);
    seen.add(value);
  }
  return [...duplicateValues].sort();
}

function normalized(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function validAbsoluteUrl(value: unknown): boolean {
  try {
    const url = new URL(normalized(value));
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

type AuthoringParityInput = Pick<WorkbookStructure, "destinationRows" | "sourceRows" | "lifestyleRows" | "customerCopyCells">;

export type AuthoringParityResult = {
  errors: string[];
  warnings: string[];
  byDestination: ReadonlyMap<string, {
    populationPresent: boolean;
    populationProvenancePresent: boolean;
    displayableLifestyleRows: number;
  }>;
};

const CLEAR_INTERNAL_COPY_PATTERNS: readonly RegExp[] = [
  /\bIntelligence V2\b/i,
  /\b(?:parser|adapter|enum|source field|hard gate|preference fit|normalization|runtime|evidence row|schema row)\b/i,
  /\bcurrent (?:contract|engine)\b/i,
  /\bDESTINATIONS\.[A-Za-z_]+\b/,
  /\b(?:PLACES|RESOURCES)\b/,
];

const AMBIGUOUS_INTERNAL_COPY_PATTERNS: readonly RegExp[] = [
  /\b(?:workbook|canonical|database|imported?|token)\b/i,
];

export function validateAuthoringParity(
  input: AuthoringParityInput,
  expectedDestinationKeys: readonly string[],
  contract: BatchContract["authoringParity"],
): AuthoringParityResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const expectedKeys = new Set(expectedDestinationKeys);
  const allowedFeatureKeys = new Set(contract.allowedLifestyleFeatureKeys);
  const duplicateRecordKeys = duplicates(input.lifestyleRows.map((row) => row.recordKey).filter(Boolean));
  for (const recordKey of duplicateRecordKeys) {
    errors.push(`AUTHORING_PARITY_LIFESTYLE_RECORD_KEY_DUPLICATE: ${recordKey}.`);
  }

  for (const row of input.lifestyleRows) {
    const label = `${row.destinationKey || "missing-destination"}/${row.recordKey || "missing-record-key"}`;
    if (!row.recordKey) errors.push(`AUTHORING_PARITY_LIFESTYLE_RECORD_KEY_MISSING: ${label}.`);
    if (!expectedKeys.has(row.destinationKey)) errors.push(`AUTHORING_PARITY_LIFESTYLE_DESTINATION_SCOPE_INVALID: ${label}.`);
    if (!allowedFeatureKeys.has(row.featureKey)) errors.push(`AUTHORING_PARITY_LIFESTYLE_FEATURE_KEY_INVALID: ${label} uses ${row.featureKey || "blank"}.`);
    if (!row.displayName) errors.push(`AUTHORING_PARITY_LIFESTYLE_DISPLAY_NAME_MISSING: ${label}.`);
    const order = Number(row.displayOrder);
    if (!Number.isInteger(order) || order <= 0) errors.push(`AUTHORING_PARITY_LIFESTYLE_DISPLAY_ORDER_INVALID: ${label}.`);
    if (contract.lifestyleEvidenceRequired && !row.evidenceSummary) errors.push(`AUTHORING_PARITY_LIFESTYLE_EVIDENCE_MISSING: ${label}.`);
    if (contract.lifestyleSourceUrlRequired && !validAbsoluteUrl(row.sourceUrl)) errors.push(`AUTHORING_PARITY_LIFESTYLE_SOURCE_MISSING: ${label}.`);
  }

  const byDestination = new Map<string, {
    populationPresent: boolean;
    populationProvenancePresent: boolean;
    displayableLifestyleRows: number;
  }>();
  for (const destinationKey of expectedDestinationKeys) {
    const destinationRow = input.destinationRows.find((row) => row.destinationKey === destinationKey);
    const population = Number(destinationRow?.population);
    const populationPresent = normalized(destinationRow?.population).toUpperCase() !== "UNKNOWN"
      && Number.isFinite(population)
      && population > 0;
    const populationProvenancePresent = input.sourceRows.some((row) => row.destinationKey === destinationKey
      && /\bpopulation\b/i.test(`${row.sourceKey} ${row.sourceName} ${row.sourceType} ${row.notes}`)
      && validAbsoluteUrl(row.sourceUrl));
    const lifestyleRows = input.lifestyleRows.filter((row) => row.destinationKey === destinationKey);

    if (contract.populationRequired && !populationPresent) {
      errors.push(`AUTHORING_PARITY_POPULATION_MISSING: ${destinationKey} requires a positive numeric DESTINATIONS.population value.`);
    }
    if (contract.populationProvenanceRequired && !populationProvenancePresent) {
      errors.push(`AUTHORING_PARITY_POPULATION_SOURCE_MISSING: ${destinationKey} requires a destination-scoped population source URL and population-labeled provenance.`);
    }
    if (lifestyleRows.length < contract.minimumDisplayableLifestyleRowsPerDestination) {
      errors.push(`AUTHORING_PARITY_LIFESTYLE_TOO_THIN: ${destinationKey} has ${lifestyleRows.length} displayable rows; minimum target is ${contract.minimumDisplayableLifestyleRowsPerDestination}. Do not pad with irrelevant filler; document and explicitly review a legitimate exception.`);
    }

    const duplicateOrders = duplicates(lifestyleRows.map((row) => normalized(row.displayOrder)).filter(Boolean));
    if (duplicateOrders.length) {
      errors.push(`AUTHORING_PARITY_LIFESTYLE_DISPLAY_ORDER_DUPLICATE: ${destinationKey} repeats display order ${duplicateOrders.join(", ")}.`);
    }
    const evidenceCounts = new Map<string, number>();
    for (const row of lifestyleRows) {
      const evidence = row.evidenceSummary.toLowerCase().replace(/\s+/g, " ").trim();
      if (evidence) evidenceCounts.set(evidence, (evidenceCounts.get(evidence) ?? 0) + 1);
    }
    if ([...evidenceCounts.values()].some((count) => count > 1)) {
      warnings.push(`AUTHORING_PARITY_LIFESTYLE_SUSPICIOUS_DUPLICATION: ${destinationKey} repeats an identical evidence summary; review for filler.`);
    }

    byDestination.set(destinationKey, {
      populationPresent,
      populationProvenancePresent,
      displayableLifestyleRows: lifestyleRows.length,
    });
  }

  if (contract.customerCopyMustDescribeDestinationNotPipeline) {
    for (const cell of input.customerCopyCells) {
      const location = `${cell.sheet}.${cell.field} row ${cell.row}${cell.destinationKey ? ` (${cell.destinationKey})` : ""}`;
      if (CLEAR_INTERNAL_COPY_PATTERNS.some((pattern) => pattern.test(cell.value))) {
        errors.push(`CUSTOMER_COPY_INTERNAL_TECHNICAL_LANGUAGE: ${location} contains clearly internal implementation language.`);
      } else if (AMBIGUOUS_INTERNAL_COPY_PATTERNS.some((pattern) => pattern.test(cell.value))) {
        warnings.push(`CUSTOMER_COPY_TECHNICAL_LANGUAGE_REVIEW: ${location} may contain internal implementation language.`);
      }
    }
  }

  return { errors, warnings, byDestination };
}

function inspectWorkbook(workbookPath: string): WorkbookStructure {
  const output = execFileSync(process.env.PYTHON || "python3", ["-c", PYTHON_INSPECTOR, workbookPath], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(output) as WorkbookStructure;
}

function selectedRegistryEntry(workbookPath: string, requestedRegistryId?: string) {
  if (requestedRegistryId) {
    return EXPANSION_WORKBOOK_REGISTRY.find((entry) => entry.registryId === requestedRegistryId) ?? null;
  }
  const absoluteWorkbookPath = path.resolve(workbookPath);
  return EXPANSION_WORKBOOK_REGISTRY.find((entry) => path.resolve(repoRoot, entry.workbookPath) === absoluteWorkbookPath) ?? null;
}

export async function validateDestinationBatch(options: ValidationOptions): Promise<DestinationBatchValidationReport> {
  const workbookPath = path.resolve(repoRoot, options.workbookPath);
  const contract = JSON.parse(readFileSync(contractPath, "utf8")) as BatchContract;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(workbookPath)) {
    throw new Error(`Workbook does not exist: ${workbookPath}`);
  }

  const registryEntry = selectedRegistryEntry(workbookPath, options.registryId);
  if (options.registryId && !registryEntry) {
    errors.push(`Registry entry not found: ${options.registryId}`);
  }
  if (registryEntry && path.resolve(repoRoot, registryEntry.workbookPath) !== workbookPath) {
    errors.push(`Workbook path does not match registry entry ${registryEntry.registryId}.`);
  }

  const sha256 = createHash("sha256").update(readFileSync(workbookPath)).digest("hex");
  if (registryEntry?.expectedSha256 && registryEntry.expectedSha256 !== sha256) {
    errors.push(`SHA-256 mismatch: registry expects ${registryEntry.expectedSha256}, received ${sha256}.`);
  }

  let structure: WorkbookStructure;
  try {
    structure = inspectWorkbook(workbookPath);
  } catch (error) {
    throw new Error(`Could not inspect workbook structure: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!sameArray(structure.sheetNames, contract.sheetContract.sheetOrder)) {
    const missing = contract.sheetContract.sheetOrder.filter((sheet) => !structure.sheetNames.includes(sheet));
    const unexpected = structure.sheetNames.filter((sheet) => !contract.sheetContract.sheetOrder.includes(sheet));
    errors.push(`Full authoring contract requires exactly ${contract.sheetContract.authoringSheetCount} sheets in canonical order (found ${structure.sheetNames.length}; missing: ${missing.join(", ") || "none"}; unexpected: ${unexpected.join(", ") || "none"}).`);
  }
  for (const requiredSheet of contract.sheetContract.parserCompatibilityRequiredSheets) {
    if (!structure.sheetNames.includes(requiredSheet)) errors.push(`Parser-required sheet is missing: ${requiredSheet}.`);
  }
  for (const [sheetName, expectedHeaders] of Object.entries(contract.headers)) {
    const actualHeaders = structure.headers[sheetName] ?? [];
    if (!sameArray(actualHeaders, expectedHeaders)) {
      errors.push(`${sheetName} headers do not match the v3.3 contract.`);
    }
  }
  for (const [metadataKey, expectedValue] of Object.entries(contract.requiredMetadata)) {
    if (structure.metadata[metadataKey] !== expectedValue) {
      errors.push(`WORKBOOK_METADATA.${metadataKey} must be ${expectedValue}; received ${structure.metadata[metadataKey] ?? "missing"}.`);
    }
  }

  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(workbookPath);
  for (const parserError of workbookImport.validationErrors ?? []) errors.push(`Deterministic parser: ${parserError}`);
  if (workbookImport.contractVersion !== contract.contractVersion) {
    errors.push(`Deterministic parser resolved contract ${workbookImport.contractVersion}; expected ${contract.contractVersion}.`);
  }

  const destinations = workbookImport.canonicalDestinations ?? [];
  const parsedDestinationKeys = destinations.map((destination) => destination.identity.destinationKey);
  if (!registryEntry && !options.expectedDestinationKeys?.length) {
    errors.push("An unregistered workbook requires an independent --expected-keys list.");
  }
  const expectedDestinationKeys = options.expectedDestinationKeys?.length
    ? options.expectedDestinationKeys
    : registryEntry?.expectedDestinationKeys
      ? [...registryEntry.expectedDestinationKeys]
      : [...structure.manifestKeys];

  const duplicateDestinationKeys = duplicates(parsedDestinationKeys);
  if (duplicateDestinationKeys.length) errors.push(`Duplicate parsed destination keys: ${duplicateDestinationKeys.join(", ")}.`);
  if (!sameArray([...parsedDestinationKeys].sort(), [...expectedDestinationKeys].sort())) {
    errors.push("Parsed destination keys do not exactly match the expected key set.");
  }
  if (!sameArray([...structure.manifestKeys].sort(), [...parsedDestinationKeys].sort())) {
    errors.push("IMPORT_MANIFEST destination keys do not exactly match parsed DESTINATIONS keys.");
  }
  const duplicateManifestKeys = duplicates(structure.manifestKeys);
  if (duplicateManifestKeys.length) errors.push(`Duplicate IMPORT_MANIFEST keys: ${duplicateManifestKeys.join(", ")}.`);
  errors.push(...validateClimateRows(structure.climateRows, expectedDestinationKeys));
  if (structure.excelErrorCells.length) {
    errors.push(`Workbook contains ${structure.excelErrorCells.length} Excel error cells: ${structure.excelErrorCells.slice(0, 10).join(", ")}.`);
  }

  const authoringParity = validateAuthoringParity(structure, expectedDestinationKeys, contract.authoringParity);

  const destinationSummaries = destinations.map((destination) => {
    const destinationKey = destination.identity.destinationKey;
    const identityValues = [destination.identity.slug, destination.identity.name, destination.identity.country];
    if (identityValues.some((value) => !normalized(value))) errors.push(`${destinationKey}: required identity field is blank.`);

    const costRows = destination.costOfLiving.filter((row) => normalized(row.category) === contract.u3r5.category);
    for (const household of contract.u3r5.requiredHouseholds) {
      const rows = costRows.filter((row) => normalized(row.household_type).toLowerCase() === household);
      if (rows.length !== 1) {
        errors.push(`${destinationKey}: expected exactly one ${household} U3-R5 affordability row; found ${rows.length}.`);
        continue;
      }
      const [row] = rows;
      const low = Number(row.monthly_low);
      const high = Number(row.monthly_high);
      if (normalized(row.currency).toUpperCase() !== contract.u3r5.currency
        || normalized(row.lifestyle_tier).toLowerCase() !== contract.u3r5.lifestyleTier.toLowerCase()
        || normalized(row.stay_mode_key).toUpperCase() !== contract.u3r5.stayModeKey
        || !Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low) {
        errors.push(`${destinationKey}: ${household} U3-R5 affordability row is malformed.`);
      }
    }
    if (costRows.some((row) => normalized(row.verified).toLowerCase() !== "true" && normalized(row.verified) !== "1")) {
      warnings.push(`${destinationKey}: one or more U3-R5 rows are not marked verified.`);
    }

    const primaryMedia = destination.media.filter((row) => ["1", "true", "yes"].includes(normalized(row.primary_image).toLowerCase()));
    if (destination.media.length < 3) warnings.push(`${destinationKey}: fewer than three media rows.`);
    if (primaryMedia.length !== 1) warnings.push(`${destinationKey}: expected exactly one primary media row; found ${primaryMedia.length}.`);
    if (destination.climateMonthly.length !== 12) warnings.push(`${destinationKey}: expected 12 monthly climate rows; found ${destination.climateMonthly.length}.`);
    if (destination.neighborhoods.length < 5) warnings.push(`${destinationKey}: fewer than five neighborhood rows.`);
    if (destination.sources.length < 10) warnings.push(`${destinationKey}: fewer than ten source rows.`);

    const adapted = adaptWorkbookDestinationToIntelligenceV2Facts(destination);
    const decisionFacts: Record<string, unknown> = {
      beachAccess: adapted.facts.hardGates.beachAccess,
      mountainOrSkiAccess: adapted.facts.hardGates.mountainOrSkiAccess,
      healthcareStandard: adapted.facts.hardGates.healthcareStandard,
      safetyStandard: adapted.facts.hardGates.safetyStandard,
      lgbtqLegalProtectionStatus: adapted.facts.hardGates.lgbtqLegalProtectionStatus,
      touristEntryAllowed: adapted.facts.entryAndStay.touristEntryAllowed,
      permanentResidencyPathAvailable: adapted.facts.entryAndStay.permanentResidencyPathAvailable,
      retirementVisaProgramAvailable: adapted.facts.entryAndStay.retirementVisaProgramAvailable,
      remoteWorkOrDigitalNomadVisaAvailable: adapted.facts.entryAndStay.remoteWorkOrDigitalNomadVisaAvailable,
      remoteWorkLegalUnderTouristStatus: adapted.facts.entryAndStay.remoteWorkLegalUnderTouristStatus,
      spouseOrDependentInclusionSupported: adapted.facts.entryAndStay.spouseOrDependentInclusionSupported,
      foreignPropertyPurchaseAllowed: adapted.facts.entryAndStay.foreignPropertyPurchaseAllowed,
    };
    const unknownDecisionFacts = Object.entries(decisionFacts)
      .filter(([, value]) => value === "UNKNOWN" || value === null)
      .map(([key]) => key);
    if (unknownDecisionFacts.length) warnings.push(`${destinationKey}: unresolved decision facts: ${unknownDecisionFacts.join(", ")}.`);

    return {
      destinationKey,
      moduleCounts: Object.fromEntries(Object.entries(destination).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, value.length])),
      unknownDecisionFacts,
      ...(authoringParity.byDestination.get(destinationKey) ?? {
        populationPresent: false,
        populationProvenancePresent: false,
        displayableLifestyleRows: 0,
      }),
    };
  });

  const structuralErrors = errors.filter((error) => error.includes("sheet") || error.includes("headers") || error.includes("WORKBOOK_METADATA"));
  const parserErrors = errors.filter((error) => error.startsWith("Deterministic parser:") || error.includes("resolved contract"));

  return {
    validator: "destinationfinder-read-only-v3.3",
    readOnly: true,
    workbookPath: path.relative(repoRoot, workbookPath),
    sha256,
    contractId: contract.contractId,
    registryId: registryEntry?.registryId ?? options.registryId ?? null,
    expectedDestinationKeys,
    parsedDestinationKeys,
    sheetCount: structure.sheetNames.length,
    destinationScoreRowCount: structure.destinationScoreRowCount,
    structuralStatus: structuralErrors.length === 0 ? "PASS" : "FAIL",
    parserStatus: parserErrors.length === 0 ? "PASS" : "FAIL",
    batchIntegrityStatus: errors.length === 0 ? "PASS" : "FAIL",
    authoringParityStatus: authoringParity.errors.length === 0 ? "PASS" : "FAIL",
    authoringReadinessStatus: errors.length === 0 && authoringParity.errors.length === 0 ? "AUTHORING_COMPLETE" : "REVIEW_REQUIRED",
    errors,
    warnings,
    authoringParityErrors: authoringParity.errors,
    authoringParityWarnings: authoringParity.warnings,
    destinationSummaries,
  };
}

function argumentValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log("Usage: npm run validate:destination-batch -- --workbook <path> [--registry-id <id>] [--expected-keys <key,key>] [--json]");
    return;
  }
  const workbookPath = argumentValue(args, "--workbook")
    ?? "data/next-batch-20/DestinationFinderAI-Next-Batch-20-Visual-Parity-Enriched-v3.3.xlsx";
  const expectedKeys = argumentValue(args, "--expected-keys")?.split(",").map((value) => value.trim()).filter(Boolean);
  const report = await validateDestinationBatch({
    workbookPath,
    registryId: argumentValue(args, "--registry-id"),
    expectedDestinationKeys: expectedKeys,
  });

  if (args.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Destination batch validation: ${report.batchIntegrityStatus}`);
    console.log(`- Workbook: ${report.workbookPath}`);
    console.log(`- SHA-256: ${report.sha256}`);
    console.log(`- Sheets: ${report.sheetCount}/48 (${report.structuralStatus})`);
    console.log(`- Deterministic parser: ${report.parserStatus}`);
    console.log(`- Destination keys: ${report.parsedDestinationKeys.length}/${report.expectedDestinationKeys.length}`);
    console.log(`- Authoring parity: ${report.authoringParityStatus}`);
    console.log(`- Authoring readiness: ${report.authoringReadinessStatus}`);
    for (const error of report.errors) console.error(`ERROR: ${error}`);
    for (const warning of report.warnings) console.warn(`WARN: ${warning}`);
    for (const error of report.authoringParityErrors) console.error(`ERROR: ${error}`);
    for (const warning of report.authoringParityWarnings) console.warn(`WARN: ${warning}`);
  }
  if (report.errors.length || report.authoringParityErrors.length) process.exitCode = 1;
}

if (process.env.VITEST !== "true") {
  await main();
}