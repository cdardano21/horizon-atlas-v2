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
};

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

const findExistingDestination = (row: Record<string, unknown>, existingDestinations: WorkbookExistingDestination[]) => {
  const rowSlug = normalizeText(getCellValue(row, "slug") || getCellValue(row, "destination_slug"));
  const rowName = normalizeText(getCellValue(row, "name") || getCellValue(row, "destination_name") || getCellValue(row, "city"));
  const rowState = normalizeText(getCellValue(row, "state") || getCellValue(row, "province") || getCellValue(row, "region"));
  const rowCity = getRowCityValue(row);
  const rowCountry = normalizeText(getCellValue(row, "country"));

  return existingDestinations.find((destination) => {
    if (rowSlug) {
      const existingSlug = normalizeText(destination.slug);
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

const isMeaningfulNeighborhoodPlace = (row: Record<string, unknown>) => {
  const placeName = normalizeText(getCellValue(row, "real_place_name") || getCellValue(row, "place_name") || getCellValue(row, "name"));
  const address = normalizeText(getCellValue(row, "address") || getCellValue(row, "street_address"));
  const googleMapsUrl = normalizeText(getCellValue(row, "google_maps_url") || getCellValue(row, "google_maps"));
  const websiteUrl = normalizeText(getCellValue(row, "website_url") || getCellValue(row, "url"));

  return Boolean(placeName && (address || googleMapsUrl || websiteUrl));
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

export const buildPremiumV2WorkbookImportPlan = ({
  destinationRows,
  neighborhoodRows = [],
  neighborhoodPlaceRows = [],
  resourceRows = [],
  mediaRows = [],
  existingDestinations,
  mode,
}: {
  destinationRows: Array<Record<string, unknown>>;
  neighborhoodRows?: Array<Record<string, unknown>>;
  neighborhoodPlaceRows?: Array<Record<string, unknown>>;
  resourceRows?: Array<Record<string, unknown>>;
  mediaRows?: Array<Record<string, unknown>>;
  existingDestinations: WorkbookExistingDestination[];
  mode: WorkbookImportMode;
}): PremiumV2WorkbookImportPlan => {
  const destinations = buildWorkbookImportPlan(
    destinationRows,
    existingDestinations,
    buildWorkbookSchema("Destinations", ["destination_name", "country", "slug", "description"]),
    mode,
  ).map((entry) => ({ ...entry, entityType: "destination" as const }));

  const neighborhoods = neighborhoodRows.map((row, index) => {
    const destinationName = normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "destination") || getCellValue(row, "destination_city"));
    const neighborhoodName = normalizeText(getCellValue(row, "neighborhood_name") || getCellValue(row, "neighborhood"));
    const destinationSlug = normalizeText(getCellValue(row, "destination_slug") || getCellValue(row, "destination_slug_name") || "");
    const destinationMatch = destinationName
      ? findExistingDestination({ destination_name: destinationName, country: getCellValue(row, "country") }, existingDestinations)
      : null;

    if (!destinationMatch || !neighborhoodName) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Neighborhood rows require a matching destination and a neighborhood name.",
        slug: destinationSlug || normalizeSlug(neighborhoodName || `${destinationName}-neighborhood`),
        entityType: "neighborhood" as const,
      };
    }

    return {
      rowNumber: index + 2,
      action: "create" as const,
      slug: destinationSlug || normalizeSlug(`${destinationName}-${neighborhoodName}`),
      entityType: "neighborhood" as const,
      destinationSlug: normalizeText(destinationSlug || destinationMatch.slug || ""),
    };
  });

  const neighborhoodPlaces = neighborhoodPlaceRows.map((row, index) => {
    const destinationName = normalizeText(getCellValue(row, "destination_name") || getCellValue(row, "destination") || getCellValue(row, "destination_city"));
    const neighborhoodName = normalizeText(getCellValue(row, "neighborhood_name") || getCellValue(row, "neighborhood"));
    const placeName = normalizeText(getCellValue(row, "real_place_name") || getCellValue(row, "place_name") || getCellValue(row, "name"));
    const destinationMatch = destinationName
      ? findExistingDestination({ destination_name: destinationName, country: getCellValue(row, "country") }, existingDestinations)
      : null;

    if (!destinationMatch || !neighborhoodName || !isMeaningfulNeighborhoodPlace(row)) {
      return {
        rowNumber: index + 2,
        action: "reject" as const,
        reason: "Neighborhood place rows require a matching destination, neighborhood, and a real identifiable place.",
        slug: normalizeSlug(placeName || `${destinationName}-${neighborhoodName}-place`),
        entityType: "neighborhood_place" as const,
        destinationSlug: normalizeText(destinationMatch?.slug || ""),
      };
    }

    return {
      rowNumber: index + 2,
      action: "create" as const,
      slug: normalizeSlug(`${destinationName}-${neighborhoodName}-${placeName}`),
      entityType: "neighborhood_place" as const,
      destinationSlug: normalizeText(destinationMatch.slug || ""),
    };
  });

  const resources = resourceRows.map((row, index) => {
    const resourceName = normalizeText(getCellValue(row, "resource_name") || getCellValue(row, "name"));
    const destinationName = normalizeText(getCellValue(row, "destination") || getCellValue(row, "destination_name") || getCellValue(row, "destination_city"));
    const destinationMatch = destinationName
      ? findExistingDestination({ destination_name: destinationName, country: getCellValue(row, "country") }, existingDestinations)
      : null;

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

    return {
      rowNumber: index + 2,
      action: "create" as const,
      slug: normalizeSlug(`${destinationName}-${resourceName}`),
      entityType: "resource" as const,
      destinationSlug: normalizeText(destinationMatch.slug || ""),
    };
  });

  const media = mediaRows.map((row, index) => {
    const destinationName = normalizeText(getCellValue(row, "destination") || getCellValue(row, "destination_name") || getCellValue(row, "destination_city"));
    const destinationMatch = destinationName
      ? findExistingDestination({ destination_name: destinationName, country: getCellValue(row, "country") }, existingDestinations)
      : null;
    const mediaUrl = normalizeText(getCellValue(row, "image_url") || getCellValue(row, "media_url") || getCellValue(row, "url"));

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
