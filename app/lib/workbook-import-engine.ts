export type WorkbookImportMode = "CREATE_ONLY" | "FILL_BLANKS_ONLY" | "UPDATE_SUPPLIED_FIELDS" | "FULL_REPLACE";

export type WorkbookColumn = {
  rawName: string;
  canonicalName: string;
  sourceType: "sheet" | "derived";
};

export type WorkbookSchema = {
  sheetName: string;
  columns: WorkbookColumn[];
};

export type WorkbookImportFieldUpdate = {
  field: string;
  changeType: "set" | "clear" | "skip";
  currentValue?: string;
  newValue?: string;
};

export type WorkbookExistingDestination = {
  id: string;
  slug?: string;
  city?: string;
  country?: string;
  name?: string | null;
  state?: string | null;
  province?: string | null;
  region?: string | null;
  destination_name?: string | null;
  destination_key?: string | null;
  description?: string | null;
};

export type WorkbookImportPlanEntry = {
  rowNumber: number;
  action: "create" | "update" | "reject";
  reason?: string;
  slug: string;
  fieldUpdates?: WorkbookImportFieldUpdate[];
};

export type PremiumV2WorkbookImportPlanEntry = {
  rowNumber: number;
  action: "create" | "update" | "reject";
  reason?: string;
  slug: string;
  entityType: "destination" | "neighborhood" | "neighborhood_place" | "resource" | "media";
  destinationSlug?: string;
  fieldUpdates?: WorkbookImportFieldUpdate[];
};

export type PremiumV2WorkbookImportPlan = {
  destinations: PremiumV2WorkbookImportPlanEntry[];
  neighborhoods: PremiumV2WorkbookImportPlanEntry[];
  neighborhoodPlaces: PremiumV2WorkbookImportPlanEntry[];
  resources: PremiumV2WorkbookImportPlanEntry[];
  media: PremiumV2WorkbookImportPlanEntry[];
  previewSummary: {
    destinationCount: number;
    neighborhoodCount: number;
    placeCount: number;
    resourceCount: number;
    mediaCount: number;
    rejectedCount: number;
  };
  compatibilityNotes?: Array<{
    sheetName: string;
    unsupportedColumns: string[];
    note: string;
  }>;
};

export type PremiumV2WorkbookImportInput = {
  destinationRows: Array<Record<string, unknown>>;
  neighborhoodRows: Array<Record<string, unknown>>;
  neighborhoodPlaceRows: Array<Record<string, unknown>>;
  resourceRows: Array<Record<string, unknown>>;
  mediaRows: Array<Record<string, unknown>>;
  compatibilityNotes?: Array<{
    sheetName: string;
    unsupportedColumns: string[];
    note: string;
  }>;
};

export type PremiumV2WorkbookModuleContract = {
  key: string;
  label: string;
  sheetCandidates: string[];
  kind: "runtime" | "structural";
  entityType?: string;
  destinationRelationship: string;
  storageTarget?: string;
  description: string;
  columns: Array<{
    name: string;
    required?: boolean;
    validation: string[];
  }>;
  validationRules: string[];
};

export type PremiumV2WorkbookContractModulePreview = {
  key: string;
  label: string;
  kind: "runtime" | "structural";
  detected: boolean;
  sheetName?: string;
  rowCount: number;
  columns: string[];
  validationErrors: string[];
  warnings: string[];
  entityType?: string;
  destinationRelationship: string;
  storageTarget?: string;
};

export type PremiumV2WorkbookContractPreview = {
  recognized: boolean;
  runtimeModules: PremiumV2WorkbookContractModulePreview[];
  structuralSheets: PremiumV2WorkbookContractModulePreview[];
  errors: string[];
  warnings: string[];
  destinationResolution?: {
    resolvedDestinations: Array<{
      slug: string;
      name: string;
      matchedExisting: boolean;
      source: "existing" | "workbook";
    }>;
    unresolvedRows: Array<{
      moduleKey: string;
      rowNumber: number;
      reason: string;
    }>;
  };
};

export const SUPPORTED_PLACE_CATEGORIES = [
  "Restaurant",
  "Coffee Shop",
  "Bakery",
  "Park",
  "Green Space",
  "Shopping",
  "Grocery",
  "Market",
  "Healthcare",
  "Hospital",
  "Clinic",
  "Pharmacy",
  "Transit",
  "Gym",
  "Fitness",
  "Golf Course",
  "Nightlife",
  "Bar",
  "Live Music",
  "Museum",
  "Attraction",
  "Family Friendly",
  "Pet Friendly",
  "Remote Work",
  "School",
  "Library",
  "Community Resource",
  "Beach",
  "River Access",
  "Trail",
  "Marina",
  "Recreation",
  "Signature Street",
] as const;

export const normalizeWorkbookImportMode = (mode: string): WorkbookImportMode => {
  switch (mode.toUpperCase()) {
    case "CREATE_ONLY":
      return "CREATE_ONLY";
    case "FILL_BLANKS_ONLY":
      return "FILL_BLANKS_ONLY";
    case "UPDATE_SUPPLIED_FIELDS":
      return "UPDATE_SUPPLIED_FIELDS";
    case "FULL_REPLACE":
      return "FULL_REPLACE";
    default:
      return "UPDATE_SUPPLIED_FIELDS";
  }
};

export const buildWorkbookSchema = (sheetName: string, headers: string[]): WorkbookSchema => ({
  sheetName,
  columns: headers.map((header, index) => ({
    rawName: header,
    canonicalName: header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    sourceType: index < 3 ? "sheet" : "sheet",
  })),
});

const normalizeText = (value: unknown) => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
};

const getCellValue = (row: Record<string, unknown>, field: string) => normalizeText(row[field] ?? row[field.toLowerCase()] ?? row[field.toUpperCase()]);

const getFirstCellValue = (row: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    const value = getCellValue(row, field);
    if (value) {
      return value;
    }
  }

  return "";
};

const getRowCityValue = (row: Record<string, unknown>) => normalizeText(
  getCellValue(row, "city")
  || getCellValue(row, "destination_name")
  || getCellValue(row, "name")
  || getCellValue(row, "location_city")
  || getCellValue(row, "destination")
);

const isDeleteMarker = (value: unknown) => normalizeText(value).toLowerCase() === "[delete]";

const hasIdentityFields = (row: Record<string, unknown>) => {
  const slug = normalizeText(getCellValue(row, "slug") || getCellValue(row, "destination_slug"));
  const name = normalizeText(getCellValue(row, "name") || getCellValue(row, "destination_name") || getCellValue(row, "city"));
  const state = normalizeText(getCellValue(row, "state") || getCellValue(row, "province") || getCellValue(row, "region"));
  const city = getRowCityValue(row);
  const country = normalizeText(getCellValue(row, "country"));

  return Boolean(slug || (city && country) || (name && country) || (name && state && country));
};

const findExistingDestinationMatches = (row: Record<string, unknown>, existingDestinations: WorkbookExistingDestination[]) => {
  const rowSlug = normalizeText(getCellValue(row, "slug") || getCellValue(row, "destination_slug"));
  const rowDestinationKey = normalizeText(getCellValue(row, "destination_key") || getCellValue(row, "destinationid") || getCellValue(row, "destination_id"));
  const rowName = normalizeText(getCellValue(row, "name") || getCellValue(row, "destination_name") || getCellValue(row, "city"));
  const rowState = normalizeText(getCellValue(row, "state") || getCellValue(row, "province") || getCellValue(row, "region"));
  const rowCity = getRowCityValue(row);
  const rowCountry = normalizeText(getCellValue(row, "country"));

  return existingDestinations.filter((destination) => {
    const existingDestinationKey = normalizeText(destination.destination_key ?? "");
    const existingSlug = normalizeText(destination.slug);

    if (rowDestinationKey) {
      if (existingDestinationKey && existingDestinationKey.toLowerCase() === rowDestinationKey.toLowerCase()) {
        return true;
      }

      if (existingSlug && existingSlug.toLowerCase() === rowDestinationKey.toLowerCase()) {
        return true;
      }
    }

    if (rowSlug) {
      if (existingSlug && existingSlug.toLowerCase() === rowSlug.toLowerCase()) {
        return true;
      }
    }

    const existingName = normalizeText(destination.name ?? destination.destination_name ?? destination.city);
    const existingCity = normalizeText(destination.city);
    const existingCountry = normalizeText(destination.country);

    if (rowName && !rowCountry) {
      if (existingName && existingName.toLowerCase() === rowName.toLowerCase()) {
        return true;
      }
    }

    if (rowCity && !rowCountry) {
      if (existingCity && existingCity.toLowerCase() === rowCity.toLowerCase()) {
        return true;
      }
    }

    if (rowName && rowCountry) {
      if (existingName && existingName.toLowerCase() === rowName.toLowerCase() && existingCountry.toLowerCase() === rowCountry.toLowerCase()) {
        return true;
      }
    }

    if (rowCity && rowCountry) {
      if (existingCity && existingCity.toLowerCase() === rowCity.toLowerCase() && existingCountry.toLowerCase() === rowCountry.toLowerCase()) {
        return true;
      }
    }

    if (rowName && rowState && rowCountry) {
      const existingState = normalizeText(destination.state ?? destination.province ?? destination.region);
      if (existingName && existingName.toLowerCase() === rowName.toLowerCase() && existingState.toLowerCase() === rowState.toLowerCase() && existingCountry.toLowerCase() === rowCountry.toLowerCase()) {
        return true;
      }
    }

    return false;
  });
};

const findExistingDestination = (row: Record<string, unknown>, existingDestinations: WorkbookExistingDestination[]) => {
  const matches = findExistingDestinationMatches(row, existingDestinations);
  return matches[0];
};

const findDestinationMatchesForWorkbookRow = (
  row: Record<string, unknown>,
  existingDestinations: WorkbookExistingDestination[],
  workbookDestinationCandidates: WorkbookExistingDestination[],
) => {
  const existingMatches = findExistingDestinationMatches(row, existingDestinations);
  if (existingMatches.length > 0) {
    return existingMatches;
  }

  return findExistingDestinationMatches(row, workbookDestinationCandidates);
};

const isMeaningfulNeighborhoodPlace = (row: Record<string, unknown>) => {
  const placeName = normalizeText(getCellValue(row, "real_place_name") || getCellValue(row, "place_name") || getCellValue(row, "name"));
  const address = normalizeText(getCellValue(row, "address") || getCellValue(row, "street_address"));
  const googleMapsUrl = normalizeText(getCellValue(row, "google_maps_url") || getCellValue(row, "google_maps"));
  const websiteUrl = normalizeText(getCellValue(row, "website_url") || getCellValue(row, "url"));
  const phone = normalizeText(getCellValue(row, "phone"));
  const description = normalizeText(getCellValue(row, "description") || getCellValue(row, "summary"));

  return Boolean(placeName && (address || googleMapsUrl || websiteUrl || phone || description));
};

export const buildWorkbookImportPlan = (
  rows: Array<Record<string, unknown>>,
  existingDestinations: WorkbookExistingDestination[],
  schema: WorkbookSchema,
  mode: WorkbookImportMode,
): WorkbookImportPlanEntry[] => {
  return rows.map((row, index) => {
    const slug = getCellValue(row, "slug") || getCellValue(row, "destination_slug");
    const city = getRowCityValue(row);
    const country = getCellValue(row, "country");
    const description = getCellValue(row, "description");
    const existing = findExistingDestination(row, existingDestinations);

    if (!hasIdentityFields(row)) {
      return { rowNumber: index + 2, action: "reject", reason: "Missing identity fields.", slug };
    }

    if (mode === "CREATE_ONLY" && existing) {
      return { rowNumber: index + 2, action: "reject", reason: "Destination already exists.", slug };
    }

    const destinationMatches = findExistingDestinationMatches(row, existingDestinations);
    if (destinationMatches.length > 1) {
      return { rowNumber: index + 2, action: "reject", reason: "ambiguous destination match; flagged for review.", slug };
    }

    const fieldUpdates: WorkbookImportFieldUpdate[] = [];
    const descriptionValue = getCellValue(row, "description");

    if (existing) {
      if (mode === "FILL_BLANKS_ONLY") {
        const currentDescription = normalizeText(existing.description ?? "");
        if (isDeleteMarker(descriptionValue)) {
          fieldUpdates.push({ field: "description", changeType: "clear", currentValue: currentDescription, newValue: "" });
        } else if (!currentDescription && descriptionValue) {
          fieldUpdates.push({ field: "description", changeType: "set", currentValue: currentDescription, newValue: descriptionValue });
        } else {
          fieldUpdates.push({ field: "description", changeType: "skip", currentValue: currentDescription, newValue: descriptionValue });
        }
      } else if (mode === "FULL_REPLACE") {
        fieldUpdates.push({ field: "description", changeType: isDeleteMarker(descriptionValue) ? "clear" : "set", currentValue: normalizeText(existing.description ?? ""), newValue: isDeleteMarker(descriptionValue) ? "" : descriptionValue });
      } else {
        const hasExplicitValue = Boolean(descriptionValue) && !isDeleteMarker(descriptionValue);
        if (hasExplicitValue) {
          fieldUpdates.push({ field: "description", changeType: "set", currentValue: normalizeText(existing.description ?? ""), newValue: descriptionValue });
        } else {
          fieldUpdates.push({ field: "description", changeType: "skip", currentValue: normalizeText(existing.description ?? ""), newValue: descriptionValue });
        }
      }
    }

    if (!existing && mode === "CREATE_ONLY") {
      return { rowNumber: index + 2, action: "create", slug, fieldUpdates: [] };
    }

    if (existing) {
      return { rowNumber: index + 2, action: "update", slug, fieldUpdates };
    }

    return { rowNumber: index + 2, action: "create", slug, fieldUpdates: [] };
  });
};

const normalizeSlug = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

const PLACE_CATEGORY_ALIASES: Record<string, string> = {
  restaurant: "Restaurant",
  restaurants: "Restaurant",
  "coffee shop": "Coffee Shop",
  "coffee shops": "Coffee Shop",
  coffee_shop: "Coffee Shop",
  coffee_shops: "Coffee Shop",
  bakery: "Bakery",
  bakeries: "Bakery",
  park: "Park",
  parks: "Park",
  "green space": "Green Space",
  "green spaces": "Green Space",
  shopping: "Shopping",
  grocery: "Grocery",
  groceries: "Grocery",
  market: "Market",
  markets: "Market",
  healthcare: "Healthcare",
  hospital: "Hospital",
  hospitals: "Hospital",
  clinic: "Clinic",
  clinics: "Clinic",
  pharmacy: "Pharmacy",
  pharmacies: "Pharmacy",
  transit: "Transit",
  gym: "Gym",
  gyms: "Gym",
  fitness: "Fitness",
  "golf course": "Golf Course",
  "golf courses": "Golf Course",
  golf: "Golf Course",
  nightlife: "Nightlife",
  bar: "Bar",
  bars: "Bar",
  "live music": "Live Music",
  live_music: "Live Music",
  museum: "Museum",
  museums: "Museum",
  attraction: "Attraction",
  attractions: "Attraction",
  "family friendly": "Family Friendly",
  "pet friendly": "Pet Friendly",
  "remote work": "Remote Work",
  school: "School",
  schools: "School",
  library: "Library",
  libraries: "Library",
  "community resource": "Community Resource",
  "community resources": "Community Resource",
  beach: "Beach",
  beaches: "Beach",
  "river access": "River Access",
  trail: "Trail",
  trails: "Trail",
  marina: "Marina",
  marinas: "Marina",
  recreation: "Recreation",
  "signature street": "Signature Street",
  "signature streets": "Signature Street",
};

const normalizePlaceCategory = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "";
  }

  const normalized = trimmedValue.toLowerCase();
  const aliasMatch = PLACE_CATEGORY_ALIASES[normalized];
  if (aliasMatch) {
    return aliasMatch;
  }

  const match = SUPPORTED_PLACE_CATEGORIES.find((category) => category.toLowerCase() === normalized);
  return match ?? trimmedValue;
};

const isSupportedPlaceCategory = (value: string) => {
  if (!value.trim()) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  if (PLACE_CATEGORY_ALIASES[normalized]) {
    return true;
  }

  return SUPPORTED_PLACE_CATEGORIES.some((category) => category.toLowerCase() === normalized);
};

const getWorkbookHeaderSet = (headers: string[] = []) => new Set(headers.map((header) => header.trim().toLowerCase()).filter(Boolean));

const SUPPORTED_DESTINATION_COLUMNS = new Set([
  "slug",
  "city",
  "country",
  "destination_name",
  "name",
  "description",
  "overview",
  "status",
  "tier",
  "emoji",
  "match",
  "climate",
  "lifestyle",
  "transportation",
  "research_sources",
  "google_style_relocation_profile",
  "monthly_living_cost_single_excl_rent_usd",
  "monthly_living_cost_couple_excl_rent_usd",
  "monthly_living_cost_family4_excl_rent_usd",
  "rent_1br_center_usd",
  "rent_1br_outside_center_usd",
  "rent_3br_center_usd",
  "rent_3br_outside_center_usd",
  "estimated_total_single_center_usd",
  "estimated_total_couple_center_usd",
  "estimated_total_family4_center_usd",
  "utilities_monthly_usd",
  "internet_monthly_usd",
  "groceries_monthly_single_usd",
  "local_transport_monthly_usd",
  "cost_estimate_basis",
]);

const DESTINATION_COLUMN_ALIASES: Record<string, string> = {
  destination_slug: "slug",
  destination_city: "city",
  destination_country: "country",
  destination: "destination_name",
  hero_description: "description",
  hero_description_text: "description",
  destination_summary: "overview",
};

const normalizeHeaderKey = (key: string) => {
  const trimmed = key.trim().toLowerCase();
  if (!trimmed) {
    return "";
  }

  return DESTINATION_COLUMN_ALIASES[trimmed] ?? trimmed.replace(/[^a-z0-9]+/g, "_");
};

const buildNormalizedDestinationRow = (row: Record<string, unknown>, headers: string[] = []) => {
  const normalizedRow: Record<string, unknown> = {};
  const headerSet = getWorkbookHeaderSet(headers);

  Object.entries(row).forEach(([rawKey, value]) => {
    const normalizedKey = normalizeHeaderKey(rawKey);
    normalizedRow[normalizedKey] = value;
  });

  if (headers.length > 0) {
    headers.forEach((header) => {
      const normalizedKey = normalizeHeaderKey(header);
      if (!(normalizedKey in normalizedRow) && headerSet.has(normalizeHeaderKey(header))) {
        normalizedRow[normalizedKey] = "";
      }
    });
  }

  return normalizedRow;
};

const normalizeSheetName = (sheetName: string) => sheetName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const findMatchingSheetName = (workbookSheets: string[], candidates: string[]) => {
  const normalizedTargets = candidates.map((candidate) => normalizeSheetName(candidate));
  return workbookSheets.find((sheetName) => normalizedTargets.includes(normalizeSheetName(sheetName)));
};

const getSheetRows = ({
  workbookSheets,
  workbookRowsBySheet,
  sheetName,
}: {
  workbookSheets: string[];
  workbookRowsBySheet: Record<string, Array<Record<string, unknown>>>;
  sheetName?: string;
}) => {
  if (!sheetName) {
    return [] as Array<Record<string, unknown>>;
  }

  const matchingSheetName = workbookSheets.find((candidateSheetName) => normalizeSheetName(candidateSheetName) === normalizeSheetName(sheetName));
  return matchingSheetName ? (workbookRowsBySheet[matchingSheetName] ?? []) : [];
};

const getSheetHeaders = ({
  workbookSheets,
  workbookHeadersBySheet,
  sheetName,
}: {
  workbookSheets: string[];
  workbookHeadersBySheet: Record<string, string[]>;
  sheetName?: string;
}) => {
  if (!sheetName) {
    return [] as string[];
  }

  const matchingSheetName = workbookSheets.find((candidateSheetName) => normalizeSheetName(candidateSheetName) === normalizeSheetName(sheetName));
  return matchingSheetName ? (workbookHeadersBySheet[matchingSheetName] ?? []) : [];
};

const findWorkbookSheetRows = ({
  workbookSheets,
  workbookRowsBySheet,
  candidates,
}: {
  workbookSheets: string[];
  workbookRowsBySheet: Record<string, Array<Record<string, unknown>>>;
  candidates: string[];
}) => {
  const normalizedTargets = candidates.map((candidate) => normalizeSheetName(candidate));
  const matchingSheetName = workbookSheets.find((sheetName) => normalizedTargets.includes(normalizeSheetName(sheetName)));

  if (!matchingSheetName) {
    return [] as Array<Record<string, unknown>>;
  }

  return workbookRowsBySheet[matchingSheetName] ?? [];
};

const PREMIUM_V2_WORKBOOK_MODULE_CONTRACTS: PremiumV2WorkbookModuleContract[] = [
  {
    key: "destinations",
    label: "Destinations",
    sheetCandidates: ["destinations", "master destinations"],
    kind: "runtime",
    entityType: "destination",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destinations_catalog",
    description: "Core destination catalog rows for each destination.",
    columns: [
      { name: "destination_name", required: true, validation: ["required unless slug or destination_key is present"] },
      { name: "slug", required: false, validation: ["used for stable destination resolution"] },
      { name: "country", required: true, validation: ["required for geographic disambiguation"] },
    ],
    validationRules: ["Destination rows must resolve to a stable destination identifier.", "Rows without a destination name, slug, or destination_key are rejected."],
  },
  {
    key: "destination_facts",
    label: "Destination Facts",
    sheetCandidates: ["destination facts"],
    kind: "runtime",
    entityType: "destination_fact",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destination_facts",
    description: "Flexible fact rows for destination-specific metrics and notes.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for module row resolution"] },
      { name: "fact_key", required: true, validation: ["required for row identity"] },
      { name: "fact_group", required: false, validation: ["used to group related facts"] },
    ],
    validationRules: ["Fact rows must point at a resolvable destination.", "Fact rows without a fact_key are rejected."],
  },
  {
    key: "destination_scores",
    label: "Destination Scores",
    sheetCandidates: ["destination scores"],
    kind: "runtime",
    entityType: "destination_score",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destination_scores",
    description: "Score rows for modular scoring dimensions.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for module row resolution"] },
      { name: "score_key", required: true, validation: ["required for row identity"] },
    ],
    validationRules: ["Score rows must point at a resolvable destination.", "Score rows without a score_key are rejected."],
  },
  {
    key: "neighborhoods",
    label: "Neighborhoods",
    sheetCandidates: ["neighborhoods"],
    kind: "runtime",
    entityType: "neighborhood",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "neighborhoods",
    description: "Named neighborhoods and neighborhood-level summaries.",
    columns: [
      { name: "neighborhood_name", required: true, validation: ["required for neighborhood identity"] },
      { name: "destination_name", required: true, validation: ["required for destination resolution"] },
    ],
    validationRules: ["Neighborhood rows must resolve to a destination and contain a neighborhood name."],
  },
  {
    key: "places",
    label: "Places",
    sheetCandidates: ["places", "neighborhood places", "neighborhoodplaces"],
    kind: "runtime",
    entityType: "place",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destination_places",
    description: "Named places for restaurants, parks, attractions, healthcare, shopping, and more.",
    columns: [
      { name: "real_place_name", required: true, validation: ["required for place identity"] },
      { name: "category", required: false, validation: ["must remain a supported category when present"] },
    ],
    validationRules: ["Place rows must resolve to a destination and contain a place name.", "Place rows with unsupported categories are rejected."],
  },
  {
    key: "resources",
    label: "Resources",
    sheetCandidates: ["resources"],
    kind: "runtime",
    entityType: "resource",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destination_resource_links",
    description: "Official and authoritative resources for the destination.",
    columns: [
      { name: "resource_name", required: true, validation: ["required for resource identity"] },
      { name: "url", required: false, validation: ["must be a valid URL when present"] },
    ],
    validationRules: ["Resource rows must resolve to a destination and contain a resource name."],
  },
  {
    key: "media",
    label: "Media",
    sheetCandidates: ["media"],
    kind: "runtime",
    entityType: "media",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destination_media_assets",
    description: "Hero and gallery media assets.",
    columns: [
      { name: "image_url", required: true, validation: ["required for media identity"] },
      { name: "media_type", required: false, validation: ["used to distinguish image, video, and other media"] },
    ],
    validationRules: ["Media rows must resolve to a destination and contain a media URL."],
  },
  {
    key: "cost_of_living",
    label: "Cost of Living",
    sheetCandidates: ["cost of living"],
    kind: "runtime",
    entityType: "cost_of_living_item",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "cost_of_living_items",
    description: "Structured cost rows for housing, groceries, utilities, transport, healthcare, and lifestyle.",
    columns: [
      { name: "category", required: true, validation: ["required to preserve structured cost categories"] },
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
    ],
    validationRules: ["Cost rows must resolve to a destination and contain a cost category."],
  },
  {
    key: "climate_monthly",
    label: "Climate Monthly",
    sheetCandidates: ["climate monthly"],
    kind: "runtime",
    entityType: "climate_month",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "monthly_climate",
    description: "Monthly climate rows for future rendering.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "month", required: true, validation: ["required for row identity"] },
    ],
    validationRules: ["Climate rows must resolve to a destination and contain a month."],
  },
  {
    key: "housing_property",
    label: "Housing Property",
    sheetCandidates: ["housing property"],
    kind: "runtime",
    entityType: "housing_property",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "housing_market_metrics",
    description: "Property and housing rules for relocation and premium modules.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "housing_topic", required: false, validation: ["used to distinguish buy/rent/ownership topics"] },
    ],
    validationRules: ["Housing rows must resolve to a destination."],
  },
  {
    key: "property_resources",
    label: "Property Resources",
    sheetCandidates: ["property resources"],
    kind: "runtime",
    entityType: "property_resource",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destination_resources",
    description: "Resources tied to property transactions and housing research.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "resource_name", required: true, validation: ["required for resource identity"] },
    ],
    validationRules: ["Property resource rows must resolve to a destination."],
  },
  {
    key: "healthcare_insurance",
    label: "Healthcare Insurance",
    sheetCandidates: ["healthcare insurance"],
    kind: "runtime",
    entityType: "healthcare_insurance",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "healthcare_facilities",
    description: "Healthcare and insurance information for relocation planning.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "topic", required: false, validation: ["used to separate healthcare and insurance topics"] },
    ],
    validationRules: ["Healthcare rows must resolve to a destination."],
  },
  {
    key: "visa_residency",
    label: "Visa Residency",
    sheetCandidates: ["visa residency"],
    kind: "runtime",
    entityType: "visa_residency",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "visa_programs",
    description: "Visa and residency guidance rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "visa_type", required: false, validation: ["used to distinguish visa pathways"] },
    ],
    validationRules: ["Visa rows must resolve to a destination."],
  },
  {
    key: "taxes_finance",
    label: "Taxes Finance",
    sheetCandidates: ["taxes finance"],
    kind: "runtime",
    entityType: "tax_rule",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "tax_rules",
    description: "Tax and finance guidance rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "topic", required: false, validation: ["used to group finance topics"] },
    ],
    validationRules: ["Tax rows must resolve to a destination."],
  },
  {
    key: "lgbtq_inclusivity",
    label: "LGBTQ Inclusivity",
    sheetCandidates: ["lgbtq inclusivity"],
    kind: "runtime",
    entityType: "lgbtq_inclusivity",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "lgbtq_inclusivity",
    description: "Community and inclusivity guidance rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "overall_rating", required: false, validation: ["kept as qualitative evidence rather than a hard numeric score"] },
    ],
    validationRules: ["LGBTQ rows must resolve to a destination."],
  },
  {
    key: "safety_risks",
    label: "Safety Risks",
    sheetCandidates: ["safety risks"],
    kind: "runtime",
    entityType: "safety_risk",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "safety_metrics",
    description: "Risk and safety notes for relocation planning.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "risk_type", required: false, validation: ["used to distinguish risk categories"] },
    ],
    validationRules: ["Safety rows must resolve to a destination."],
  },
  {
    key: "transport_airports",
    label: "Transport Airports",
    sheetCandidates: ["transport airports"],
    kind: "runtime",
    entityType: "transport_option",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "transportation_options",
    description: "Airports and transport options.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "topic", required: false, validation: ["used to distinguish airport and transport topics"] },
    ],
    validationRules: ["Transport rows must resolve to a destination."],
  },
  {
    key: "connectivity_remote_work",
    label: "Connectivity Remote Work",
    sheetCandidates: ["connectivity remote work"],
    kind: "runtime",
    entityType: "remote_work_metric",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "internet_metrics",
    description: "Connectivity and remote-work suitability rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "avg_download_mbps", required: false, validation: ["must be numeric when present"] },
    ],
    validationRules: ["Remote-work rows must resolve to a destination."],
  },
  {
    key: "language_integration",
    label: "Language Integration",
    sheetCandidates: ["language integration"],
    kind: "runtime",
    entityType: "language_integration",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "language_integration",
    description: "Language entry and integration rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "primary_language", required: false, validation: ["used to describe the local language context"] },
    ],
    validationRules: ["Language rows must resolve to a destination."],
  },
  {
    key: "pets",
    label: "Pets",
    sheetCandidates: ["pets"],
    kind: "runtime",
    entityType: "pet_policy",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "pets",
    description: "Pet-related relocation rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "vet_access", required: false, validation: ["used to describe pet care accessibility"] },
    ],
    validationRules: ["Pet rows must resolve to a destination."],
  },
  {
    key: "family_education",
    label: "Family Education",
    sheetCandidates: ["family education"],
    kind: "runtime",
    entityType: "family_education",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "family_education",
    description: "Family and education rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "topic", required: false, validation: ["used to group family and school topics"] },
    ],
    validationRules: ["Family rows must resolve to a destination."],
  },
  {
    key: "community_social",
    label: "Community Social",
    sheetCandidates: ["community social"],
    kind: "runtime",
    entityType: "community_social",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "community_social",
    description: "Community and social life rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "topic", required: false, validation: ["used to separate community themes"] },
    ],
    validationRules: ["Community rows must resolve to a destination."],
  },
  {
    key: "accessibility",
    label: "Accessibility",
    sheetCandidates: ["accessibility"],
    kind: "runtime",
    entityType: "accessibility",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "accessibility",
    description: "Accessibility and mobility rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "wheelchair_access", required: false, validation: ["used to preserve accessibility detail"] },
    ],
    validationRules: ["Accessibility rows must resolve to a destination."],
  },
  {
    key: "bureaucracy_setup",
    label: "Bureaucracy Setup",
    sheetCandidates: ["bureaucracy setup"],
    kind: "runtime",
    entityType: "bureaucracy_setup",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "bureaucracy_setup",
    description: "Bureaucracy and setup guidance rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "topic", required: false, validation: ["used to separate setup topics"] },
    ],
    validationRules: ["Bureaucracy rows must resolve to a destination."],
  },
  {
    key: "work_business",
    label: "Work Business",
    sheetCandidates: ["work business"],
    kind: "runtime",
    entityType: "work_business",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "work_business",
    description: "Work and business rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "major_industries", required: false, validation: ["used to describe the local economy"] },
    ],
    validationRules: ["Work rows must resolve to a destination."],
  },
  {
    key: "retirement_aging",
    label: "Retirement Aging",
    sheetCandidates: ["retirement aging"],
    kind: "runtime",
    entityType: "retirement_aging",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "retirement_aging",
    description: "Retirement and aging-in-place rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "retirement_notes", required: false, validation: ["used to capture older-adult suitability"] },
    ],
    validationRules: ["Retirement rows must resolve to a destination."],
  },
  {
    key: "lifestyle_laws",
    label: "Lifestyle Laws",
    sheetCandidates: ["lifestyle laws"],
    kind: "runtime",
    entityType: "lifestyle_law",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "lifestyle_laws",
    description: "Lifestyle and local legal guidance rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "topic", required: false, validation: ["used to distinguish policy topics"] },
    ],
    validationRules: ["Lifestyle-law rows must resolve to a destination."],
  },
  {
    key: "reality_check",
    label: "Reality Check",
    sheetCandidates: ["reality check"],
    kind: "runtime",
    entityType: "reality_check",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destination_reality_checks",
    description: "Reality-check cautions and watch-outs.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "title", required: false, validation: ["used to preserve the watch-out title"] },
    ],
    validationRules: ["Reality-check rows must resolve to a destination."],
  },
  {
    key: "move_checklist",
    label: "Move Checklist",
    sheetCandidates: ["move checklist"],
    kind: "runtime",
    entityType: "move_checklist",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "move_checklist",
    description: "Move-planning checklist rows.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "task", required: false, validation: ["used to preserve checklist task names"] },
    ],
    validationRules: ["Move-checklist rows must resolve to a destination."],
  },
  {
    key: "sources",
    label: "Sources",
    sheetCandidates: ["sources"],
    kind: "runtime",
    entityType: "source",
    destinationRelationship: "destination_id / destination_key",
    storageTarget: "destination_sources",
    description: "Source and evidence rows associated with the destination.",
    columns: [
      { name: "destination_key", required: true, validation: ["required for destination resolution"] },
      { name: "source_name", required: false, validation: ["used to preserve source attribution"] },
    ],
    validationRules: ["Source rows must resolve to a destination."],
  },
  {
    key: "schema_index",
    label: "Schema Index",
    sheetCandidates: ["schema index"],
    kind: "structural",
    destinationRelationship: "reference_only",
    description: "Structural workbook index for sheet relationships and extensibility.",
    columns: [],
    validationRules: [],
  },
  {
    key: "premium_requirements",
    label: "Premium Requirements",
    sheetCandidates: ["premium requirements"],
    kind: "structural",
    destinationRelationship: "reference_only",
    description: "Control and quality-assurance sheet for Premium requirements.",
    columns: [],
    validationRules: [],
  },
  {
    key: "changelog",
    label: "Changelog",
    sheetCandidates: ["changelog"],
    kind: "structural",
    destinationRelationship: "reference_only",
    description: "Historical workbook change log.",
    columns: [],
    validationRules: [],
  },
  {
    key: "pilot_status",
    label: "Pilot Status",
    sheetCandidates: ["pilot status"],
    kind: "structural",
    destinationRelationship: "reference_only",
    description: "Pilot tracking metadata for workbook governance.",
    columns: [],
    validationRules: [],
  },
  {
    key: "readme",
    label: "README",
    sheetCandidates: ["readme"],
    kind: "structural",
    destinationRelationship: "reference_only",
    description: "Workbook documentation and overview sheet.",
    columns: [],
    validationRules: [],
  },
  {
    key: "categories",
    label: "Categories",
    sheetCandidates: ["categories"],
    kind: "structural",
    destinationRelationship: "reference_only",
    description: "Reference taxonomy for categories, scoring dimensions, and stay modes.",
    columns: [],
    validationRules: [],
  },
  {
    key: "scoring_dimensions",
    label: "Scoring Dimensions",
    sheetCandidates: ["scoring dimensions"],
    kind: "structural",
    destinationRelationship: "reference_only",
    description: "Reference scoring dimensions for advanced premium logic.",
    columns: [],
    validationRules: [],
  },
  {
    key: "stay_modes",
    label: "Stay Modes",
    sheetCandidates: ["stay modes"],
    kind: "structural",
    destinationRelationship: "reference_only",
    description: "Reference stay-mode definitions for future modules.",
    columns: [],
    validationRules: [],
  },
];

export const normalizeWorkbookPayloadToPremiumV2ImportInput = ({
  workbookSheets = [],
  workbookRowsBySheet = {},
  workbookHeadersBySheet = {},
}: {
  workbookSheets?: string[];
  workbookRowsBySheet?: Record<string, Array<Record<string, unknown>>>;
  workbookHeadersBySheet?: Record<string, string[]>;
}): PremiumV2WorkbookImportInput => {
  const compatibilityNotes: PremiumV2WorkbookImportInput["compatibilityNotes"] = [];

  const destinationSheetName = workbookSheets.find((sheetName) => ["master destinations", "destinations"].includes(normalizeSheetName(sheetName))) ?? workbookSheets[0] ?? "Master Destinations";
  const destinationRows = (workbookRowsBySheet[destinationSheetName] ?? []).map((row) => buildNormalizedDestinationRow(row, workbookHeadersBySheet[destinationSheetName] ?? []));

  const destinationHeaders = getWorkbookHeaderSet(workbookHeadersBySheet[destinationSheetName] ?? []);
  const unsupportedDestinationColumns = Array.from(destinationHeaders).filter((header) => !SUPPORTED_DESTINATION_COLUMNS.has(header));

  if (unsupportedDestinationColumns.length > 0) {
    compatibilityNotes.push({
      sheetName: destinationSheetName,
      unsupportedColumns: unsupportedDestinationColumns,
      note: "The current importer preserves supported fields and surfaces unsupported columns for review.",
    });
  }

  return {
    destinationRows,
    neighborhoodRows: findWorkbookSheetRows({ workbookSheets, workbookRowsBySheet, candidates: ["Neighborhoods"] }).map((row) => buildNormalizedDestinationRow(row, workbookHeadersBySheet[workbookSheets.find((sheetName) => normalizeSheetName(sheetName) === normalizeSheetName("Neighborhoods")) ?? ""] ?? [])),
    neighborhoodPlaceRows: findWorkbookSheetRows({ workbookSheets, workbookRowsBySheet, candidates: ["Neighborhood Places", "NeighborhoodPlaces"] }).map((row) => buildNormalizedDestinationRow(row, workbookHeadersBySheet[workbookSheets.find((sheetName) => ["neighborhood places", "neighborhoodplaces"].includes(normalizeSheetName(sheetName))) ?? ""] ?? [])),
    resourceRows: findWorkbookSheetRows({ workbookSheets, workbookRowsBySheet, candidates: ["Resources"] }).map((row) => buildNormalizedDestinationRow(row, workbookHeadersBySheet[workbookSheets.find((sheetName) => normalizeSheetName(sheetName) === normalizeSheetName("Resources")) ?? ""] ?? [])),
    mediaRows: findWorkbookSheetRows({ workbookSheets, workbookRowsBySheet, candidates: ["Media"] }).map((row) => buildNormalizedDestinationRow(row, workbookHeadersBySheet[workbookSheets.find((sheetName) => normalizeSheetName(sheetName) === normalizeSheetName("Media")) ?? ""] ?? [])),
    compatibilityNotes,
  };
};

export const buildPremiumV2WorkbookContractPreview = ({
  workbookSheets = [],
  workbookRowsBySheet = {},
  workbookHeadersBySheet = {},
  existingDestinations = [],
}: {
  workbookSheets?: string[];
  workbookRowsBySheet?: Record<string, Array<Record<string, unknown>>>;
  workbookHeadersBySheet?: Record<string, string[]>;
  existingDestinations?: WorkbookExistingDestination[];
}): PremiumV2WorkbookContractPreview => {
  const runtimeModules = PREMIUM_V2_WORKBOOK_MODULE_CONTRACTS.filter((contract) => contract.kind === "runtime").map((contract) => {
    const sheetName = findMatchingSheetName(workbookSheets, contract.sheetCandidates);
    const rows = getSheetRows({ workbookSheets, workbookRowsBySheet, sheetName });
    const headers = getSheetHeaders({ workbookSheets, workbookHeadersBySheet, sheetName });

    const validationErrors: string[] = [];
    const warnings: string[] = [];

    if (sheetName) {
      if (contract.key === "destinations") {
        const destinationRows = rows.map((row) => buildNormalizedDestinationRow(row, headers));
        const hasDestinationIdentity = destinationRows.some((row) => Boolean(normalizeText(getCellValue(row, "slug") || getCellValue(row, "destination_slug") || getCellValue(row, "destination_key") || getCellValue(row, "destination_name") || getCellValue(row, "city") || getCellValue(row, "name"))));
        if (!hasDestinationIdentity) {
          validationErrors.push("Destination sheet rows do not include a recognizable destination identity.");
        }
      }

      if (contract.key === "neighborhoods") {
        rows.forEach((row, rowIndex) => {
          const destinationName = normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "destination") || getCellValue(row, "destination_key"));
          const neighborhoodName = normalizeText(getCellValue(row, "neighborhood_name") || getCellValue(row, "neighborhood"));
          if (!destinationName || !neighborhoodName) {
            validationErrors.push(`Neighborhood row ${rowIndex + 2} is missing a destination or neighborhood name.`);
          }
        });
      }

      if (contract.key === "places") {
        rows.forEach((row, rowIndex) => {
          const destinationName = getFirstCellValue(row, ["destination_name", "destination", "destination_city", "destination_key"]);
          const placeName = normalizeText(getCellValue(row, "real_place_name") || getCellValue(row, "place_name") || getCellValue(row, "name"));
          const categoryValue = getFirstCellValue(row, ["category", "category_key"]);
          if (!destinationName || !placeName) {
            validationErrors.push(`Place row ${rowIndex + 2} is missing a destination or place name.`);
          }
          if (categoryValue && !isSupportedPlaceCategory(categoryValue)) {
            validationErrors.push(`Place row ${rowIndex + 2} uses an unsupported category: ${categoryValue}`);
          }
        });
      }

      if (contract.key === "resources") {
        rows.forEach((row, rowIndex) => {
          const destinationName = normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "destination") || getCellValue(row, "destination_key"));
          const resourceName = normalizeText(getCellValue(row, "resource_name") || getCellValue(row, "name"));
          const urlValue = normalizeText(getCellValue(row, "url") || getCellValue(row, "website_url"));
          if (!destinationName || !resourceName) {
            validationErrors.push(`Resource row ${rowIndex + 2} is missing a destination or resource name.`);
          }
          if (urlValue && !/^https?:\/\//i.test(urlValue)) {
            warnings.push(`Resource row ${rowIndex + 2} contains a malformed URL.`);
          }
        });
      }

      if (contract.key === "media") {
        rows.forEach((row, rowIndex) => {
          const destinationName = normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "destination") || getCellValue(row, "destination_key"));
          const mediaUrl = normalizeText(getCellValue(row, "image_url") || getCellValue(row, "media_url") || getCellValue(row, "url"));
          if (!destinationName || !mediaUrl) {
            validationErrors.push(`Media row ${rowIndex + 2} is missing a destination or media URL.`);
          }
        });
      }

      if (contract.key === "cost_of_living") {
        rows.forEach((row, rowIndex) => {
          const destinationKey = normalizeText(getCellValue(row, "destination_key") || getCellValue(row, "destination") || getCellValue(row, "destination_name"));
          const categoryValue = normalizeText(getCellValue(row, "category"));
          if (!destinationKey || !categoryValue) {
            validationErrors.push(`Cost row ${rowIndex + 2} is missing a destination or cost category.`);
          }
        });
      }

      if (contract.key === "climate_monthly") {
        rows.forEach((row, rowIndex) => {
          const destinationKey = normalizeText(getCellValue(row, "destination_key") || getCellValue(row, "destination") || getCellValue(row, "destination_name"));
          const monthValue = normalizeText(getCellValue(row, "month"));
          if (!destinationKey || !monthValue) {
            validationErrors.push(`Climate row ${rowIndex + 2} is missing a destination or month.`);
          }
        });
      }
    }

    return {
      key: contract.key,
      label: contract.label,
      kind: contract.kind,
      detected: Boolean(sheetName),
      sheetName,
      rowCount: rows.length,
      columns: headers,
      validationErrors,
      warnings,
      entityType: contract.entityType,
      destinationRelationship: contract.destinationRelationship,
      storageTarget: contract.storageTarget,
    };
  });

  const structuralSheets = PREMIUM_V2_WORKBOOK_MODULE_CONTRACTS.filter((contract) => contract.kind === "structural").map((contract) => {
    const sheetName = findMatchingSheetName(workbookSheets, contract.sheetCandidates);
    return {
      key: contract.key,
      label: contract.label,
      kind: contract.kind,
      detected: Boolean(sheetName),
      sheetName,
      rowCount: sheetName ? (workbookRowsBySheet[sheetName] ?? []).length : 0,
      columns: sheetName ? (workbookHeadersBySheet[sheetName] ?? []) : [],
      validationErrors: [],
      warnings: [],
      destinationRelationship: contract.destinationRelationship,
      storageTarget: contract.storageTarget,
    };
  });

  const destinationRows = runtimeModules.find((module) => module.key === "destinations")?.detected
    ? getSheetRows({ workbookSheets, workbookRowsBySheet, sheetName: runtimeModules.find((module) => module.key === "destinations")?.sheetName }).map((row) => buildNormalizedDestinationRow(row, getSheetHeaders({ workbookSheets, workbookHeadersBySheet, sheetName: runtimeModules.find((module) => module.key === "destinations")?.sheetName })))
    : [];

  const workbookDestinationMatches = destinationRows.map((row) => ({
    id: normalizeSlug(String(getCellValue(row, "slug") || getCellValue(row, "destination_slug") || getCellValue(row, "destination_name") || getCellValue(row, "city") || "workbook-destination")),
    slug: normalizeText(getCellValue(row, "slug") || getCellValue(row, "destination_slug") || ""),
    name: normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "name") || getCellValue(row, "city") || ""),
    destination_name: normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "name") || getCellValue(row, "city") || ""),
    city: normalizeText(getCellValue(row, "city") || getCellValue(row, "destination_name") || getCellValue(row, "name") || ""),
    country: normalizeText(getCellValue(row, "country") || ""),
    state: normalizeText(getCellValue(row, "state") || getCellValue(row, "province") || getCellValue(row, "region") || ""),
    region: normalizeText(getCellValue(row, "region") || ""),
    province: normalizeText(getCellValue(row, "province") || ""),
    destination_key: normalizeText(getCellValue(row, "destination_key") || ""),
  }));

  const resolvedDestinations = workbookDestinationMatches.map((destinationMatch) => {
    const matchedExisting = existingDestinations.some((destination) => {
      const existingSlug = normalizeText(destination.slug);
      const matchSlug = normalizeText(destinationMatch.slug);
      if (matchSlug && existingSlug && existingSlug.toLowerCase() === matchSlug.toLowerCase()) {
        return true;
      }

      const existingName = normalizeText(destination.name ?? destination.destination_name ?? destination.city);
      const existingCountry = normalizeText(destination.country);
      const destinationName = normalizeText(destinationMatch.name);
      const country = normalizeText(destinationMatch.country);
      if (destinationName && existingName && destinationName.toLowerCase() === existingName.toLowerCase()) {
        if (!country || !existingCountry || country.toLowerCase() === existingCountry.toLowerCase()) {
          return true;
        }
      }

      return false;
    });

    return {
      slug: destinationMatch.slug || normalizeSlug(destinationMatch.name || "workbook-destination"),
      name: destinationMatch.name,
      matchedExisting,
      source: matchedExisting ? "existing" : "workbook",
    };
  });

  const unresolvedRows = runtimeModules.flatMap((module) => {
    if (!module.detected || module.kind !== "runtime") {
      return [];
    }

    const rows = getSheetRows({ workbookSheets, workbookRowsBySheet, sheetName: module.sheetName });
    const headers = getSheetHeaders({ workbookSheets, workbookHeadersBySheet, sheetName: module.sheetName });

    if (module.key === "places") {
      return rows.flatMap((row, rowIndex) => {
        const matchingDestinations = findDestinationMatchesForWorkbookRow(row, existingDestinations, workbookDestinationMatches);
        return matchingDestinations.length > 0 ? [] : [{ moduleKey: module.key, rowNumber: rowIndex + 2, reason: "Row references an unresolved destination." }];
      });
    }

    if (module.key === "resources") {
      return rows.flatMap((row, rowIndex) => {
        const matchingDestinations = findDestinationMatchesForWorkbookRow(row, existingDestinations, workbookDestinationMatches);
        return matchingDestinations.length > 0 ? [] : [{ moduleKey: module.key, rowNumber: rowIndex + 2, reason: "Row references an unresolved destination." }];
      });
    }

    if (module.key === "media") {
      return rows.flatMap((row, rowIndex) => {
        const matchingDestinations = findDestinationMatchesForWorkbookRow(row, existingDestinations, workbookDestinationMatches);
        return matchingDestinations.length > 0 ? [] : [{ moduleKey: module.key, rowNumber: rowIndex + 2, reason: "Row references an unresolved destination." }];
      });
    }

    return rows.flatMap((row, rowIndex) => {
      const destinationKey = normalizeText(getCellValue(row, "destination_key") || getCellValue(row, "destination") || getCellValue(row, "destination_name"));
      if (!destinationKey) {
        return [{ moduleKey: module.key, rowNumber: rowIndex + 2, reason: "Row is missing a destination key." }];
      }
      return [];
    });
  });

  const unresolvedModuleErrorEntries = unresolvedRows.map((row) => ({
    moduleKey: row.moduleKey,
    message: `Row ${row.rowNumber} references an unresolved destination.`,
  }));

  unresolvedModuleErrorEntries.forEach((entry) => {
    const matchingModule = runtimeModules.find((module) => module.key === entry.moduleKey);
    if (matchingModule) {
      matchingModule.validationErrors.push(entry.message);
    }
  });

  const errors = runtimeModules.flatMap((module) => module.validationErrors);
  const warnings = runtimeModules.flatMap((module) => module.warnings);

  return {
    recognized: runtimeModules.some((module) => module.detected) || structuralSheets.some((sheet) => sheet.detected),
    runtimeModules,
    structuralSheets,
    errors,
    warnings,
    destinationResolution: {
      resolvedDestinations,
      unresolvedRows,
    },
  };
};

export const buildPremiumV2WorkbookImportPlan = ({
  destinationRows,
  neighborhoodRows = [],
  neighborhoodPlaceRows = [],
  resourceRows = [],
  mediaRows = [],
  existingDestinations,
  mode,
  compatibilityNotes = [],
}: {
  destinationRows: Array<Record<string, unknown>>;
  neighborhoodRows?: Array<Record<string, unknown>>;
  neighborhoodPlaceRows?: Array<Record<string, unknown>>;
  resourceRows?: Array<Record<string, unknown>>;
  mediaRows?: Array<Record<string, unknown>>;
  existingDestinations: WorkbookExistingDestination[];
  mode: WorkbookImportMode;
  compatibilityNotes?: Array<{ sheetName: string; unsupportedColumns: string[]; note: string }>;
}): PremiumV2WorkbookImportPlan => {
  const destinations = buildWorkbookImportPlan(
    destinationRows,
    existingDestinations,
    buildWorkbookSchema("Destinations", ["destination_name", "country", "slug", "description"]),
    mode,
  ).map((entry) => ({ ...entry, entityType: "destination" as const }));

  const workbookDestinationMatches = destinationRows.map((row) => ({
    id: normalizeSlug(String(getCellValue(row, "slug") || getCellValue(row, "destination_slug") || getCellValue(row, "destination_name") || getCellValue(row, "city") || "workbook-destination")),
    slug: normalizeText(getCellValue(row, "slug") || getCellValue(row, "destination_slug") || ""),
    name: normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "name") || getCellValue(row, "city") || ""),
    destination_name: normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "name") || getCellValue(row, "city") || ""),
    city: normalizeText(getCellValue(row, "city") || getCellValue(row, "destination_name") || getCellValue(row, "name") || ""),
    country: normalizeText(getCellValue(row, "country") || ""),
    state: normalizeText(getCellValue(row, "state") || getCellValue(row, "province") || getCellValue(row, "region") || ""),
    region: normalizeText(getCellValue(row, "region") || ""),
    province: normalizeText(getCellValue(row, "province") || ""),
    destination_key: normalizeText(getCellValue(row, "destination_key") || ""),
  }));

  const destinationLookupCandidates = [...existingDestinations, ...workbookDestinationMatches];

  const seenNeighborhoodKeys = new Set<string>();
  const seenPlaceKeys = new Set<string>();
  const seenResourceKeys = new Set<string>();
  const seenMediaKeys = new Set<string>();

  const neighborhoods = neighborhoodRows.map((row, index) => {
    const destinationName = getFirstCellValue(row, ["destination_name", "destination", "destination_city", "destination_key"]);
    const neighborhoodName = getFirstCellValue(row, ["neighborhood_name", "neighborhood", "neighborhood_key"]);
    const destinationSlug = normalizeText(getCellValue(row, "destination_slug") || getCellValue(row, "destination_slug_name") || "");
    const destinationMatches = findDestinationMatchesForWorkbookRow(row, existingDestinations, workbookDestinationMatches);
    const destinationMatch = destinationMatches[0];

    if (destinationMatches.length > 1) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "ambiguous destination match; flagged for review.",
        slug: destinationSlug || normalizeSlug(neighborhoodName || `${destinationName}-neighborhood`),
        entityType: "neighborhood" as const,
      };
    }

    if (!destinationMatch || !neighborhoodName) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Neighborhood rows require a matching destination and a neighborhood name.",
        slug: destinationSlug || normalizeSlug(neighborhoodName || `${destinationName}-neighborhood`),
        entityType: "neighborhood" as const,
      };
    }

    const rowKey = normalizeSlug(`${destinationName}-${neighborhoodName}`);
    if (seenNeighborhoodKeys.has(rowKey)) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Duplicate neighborhood row; skipped during import.",
        slug: destinationSlug || rowKey,
        entityType: "neighborhood" as const,
        destinationSlug: normalizeText(destinationSlug || destinationMatch.slug || ""),
      };
    }

    seenNeighborhoodKeys.add(rowKey);

    return {
      rowNumber: index + 2,
      action: "create" as const,
      slug: destinationSlug || normalizeSlug(`${destinationName}-${neighborhoodName}`),
      entityType: "neighborhood" as const,
      destinationSlug: normalizeText(destinationSlug || destinationMatch.slug || ""),
    };
  });

  const neighborhoodPlaces = neighborhoodPlaceRows.map((row, index) => {
    const destinationName = getFirstCellValue(row, ["destination_name", "destination", "destination_city", "destination_key"]);
    const neighborhoodName = getFirstCellValue(row, ["neighborhood_name", "neighborhood", "neighborhood_key"]);
    const placeName = normalizeText(getCellValue(row, "real_place_name") || getCellValue(row, "place_name") || getCellValue(row, "name"));
    const destinationMatches = findDestinationMatchesForWorkbookRow(row, existingDestinations, workbookDestinationMatches);
    const destinationMatch = destinationMatches[0];
    const categoryValue = getFirstCellValue(row, ["category", "category_key"]);
    const placeScopeName = normalizeText(neighborhoodName || destinationName);

    if (destinationMatches.length > 1) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "ambiguous destination match; flagged for review.",
        slug: normalizeSlug(placeName || `${destinationName}-${neighborhoodName}-place`),
        entityType: "neighborhood_place" as const,
        destinationSlug: normalizeText(destinationMatch?.slug || ""),
      };
    }

    if (!destinationMatch || !isMeaningfulNeighborhoodPlace(row)) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Neighborhood place rows require a matching destination and a real identifiable place.",
        slug: normalizeSlug(placeName || `${destinationName}-${placeScopeName}-place`),
        entityType: "neighborhood_place" as const,
        destinationSlug: normalizeText(destinationMatch?.slug || ""),
      };
    }

    if (categoryValue && !isSupportedPlaceCategory(categoryValue)) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: `Unsupported place category: ${categoryValue}`,
        slug: normalizeSlug(`${destinationName}-${placeScopeName}-${placeName}`),
        entityType: "neighborhood_place" as const,
        destinationSlug: normalizeText(destinationMatch.slug || ""),
      };
    }

    const rowKey = normalizeSlug(`${destinationName}-${placeScopeName}-${placeName}`);
    if (seenPlaceKeys.has(rowKey)) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Duplicate neighborhood place row; skipped during import.",
        slug: rowKey,
        entityType: "neighborhood_place" as const,
        destinationSlug: normalizeText(destinationMatch.slug || ""),
      };
    }

    seenPlaceKeys.add(rowKey);

    return {
      rowNumber: index + 2,
      action: "create" as const,
      slug: normalizeSlug(`${destinationName}-${placeScopeName}-${placeName}`),
      entityType: "neighborhood_place" as const,
      destinationSlug: normalizeText(destinationMatch.slug || ""),
      category: normalizePlaceCategory(categoryValue),
    };
  });

  const resources = resourceRows.map((row, index) => {
    const resourceName = normalizeText(getCellValue(row, "resource_name") || getCellValue(row, "name"));
    const destinationName = getFirstCellValue(row, ["destination_name", "destination", "destination_city", "destination_key"]);
    const destinationMatches = findDestinationMatchesForWorkbookRow(row, existingDestinations, workbookDestinationMatches);
    const destinationMatch = destinationMatches[0];

    if (destinationMatches.length > 1) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "ambiguous destination match; flagged for review.",
        slug: normalizeSlug(resourceName || `${destinationName}-resource`),
        entityType: "resource" as const,
        destinationSlug: normalizeText(destinationMatch?.slug || ""),
      };
    }

    if (!destinationMatch || !resourceName) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Resources require a matching destination and a resource name.",
        slug: normalizeSlug(resourceName || `${destinationName}-resource`),
        entityType: "resource" as const,
        destinationSlug: normalizeText(destinationMatch?.slug || ""),
      };
    }

    const rowKey = normalizeSlug(`${destinationName}-${resourceName}`);
    if (seenResourceKeys.has(rowKey)) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Duplicate resource row; skipped during import.",
        slug: rowKey,
        entityType: "resource" as const,
        destinationSlug: normalizeText(destinationMatch.slug || ""),
      };
    }

    seenResourceKeys.add(rowKey);

    return {
      rowNumber: index + 2,
      action: "create" as const,
      slug: normalizeSlug(`${destinationName}-${resourceName}`),
      entityType: "resource" as const,
      destinationSlug: normalizeText(destinationMatch.slug || ""),
    };
  });

  const media = mediaRows.map((row, index) => {
    const destinationName = getFirstCellValue(row, ["destination_name", "destination", "destination_city", "destination_key"]);
    const destinationMatches = findDestinationMatchesForWorkbookRow(row, existingDestinations, workbookDestinationMatches);
    const destinationMatch = destinationMatches[0];
    const mediaUrl = normalizeText(getCellValue(row, "image_url") || getCellValue(row, "media_url") || getCellValue(row, "url"));

    if (destinationMatches.length > 1) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "ambiguous destination match; flagged for review.",
        slug: normalizeSlug(`${destinationName}-media`),
        entityType: "media" as const,
        destinationSlug: normalizeText(destinationMatch?.slug || ""),
      };
    }

    if (!destinationMatch || !mediaUrl) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Media rows require a matching destination and a media URL.",
        slug: normalizeSlug(`${destinationName}-media`),
        entityType: "media" as const,
        destinationSlug: normalizeText(destinationMatch?.slug || ""),
      };
    }

    const rowKey = normalizeSlug(`${destinationName}-${mediaUrl}`);
    if (seenMediaKeys.has(rowKey)) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Duplicate media row; skipped during import.",
        slug: rowKey,
        entityType: "media" as const,
        destinationSlug: normalizeText(destinationMatch.slug || ""),
      };
    }

    seenMediaKeys.add(rowKey);

    return {
      rowNumber: index + 2,
      action: "create" as const,
      slug: normalizeSlug(`${destinationName}-media-${index + 1}`),
      entityType: "media" as const,
      destinationSlug: normalizeText(destinationMatch.slug || ""),
    };
  });

  const rejectedCount = [...destinations, ...neighborhoods, ...neighborhoodPlaces, ...resources, ...media].filter((entry) => entry.action === "reject").length;

  return {
    destinations,
    neighborhoods,
    neighborhoodPlaces,
    resources,
    media,
    compatibilityNotes,
    previewSummary: {
      destinationCount: destinations.filter((entry) => entry.action !== "reject").length,
      neighborhoodCount: neighborhoods.filter((entry) => entry.action !== "reject").length,
      placeCount: neighborhoodPlaces.filter((entry) => entry.action !== "reject").length,
      resourceCount: resources.filter((entry) => entry.action !== "reject").length,
      mediaCount: media.filter((entry) => entry.action !== "reject").length,
      rejectedCount,
    },
  };
};
