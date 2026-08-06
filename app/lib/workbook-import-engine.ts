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

    if (rowName && rowCountry) {
      const existingName = normalizeText(destination.name ?? destination.destination_name ?? destination.city);
      const existingCountry = normalizeText(destination.country);
      if (existingName && existingName.toLowerCase() === rowName.toLowerCase() && existingCountry.toLowerCase() === rowCountry.toLowerCase()) {
        return true;
      }
    }

    if (rowCity && rowCountry) {
      const existingCity = normalizeText(destination.city);
      const existingCountry = normalizeText(destination.country);
      if (existingCity && existingCity.toLowerCase() === rowCity.toLowerCase() && existingCountry.toLowerCase() === rowCountry.toLowerCase()) {
        return true;
      }
    }

    if (rowName && rowState && rowCountry) {
      const existingName = normalizeText(destination.name ?? destination.destination_name ?? destination.city);
      const existingState = normalizeText(destination.state ?? destination.province ?? destination.region);
      const existingCountry = normalizeText(destination.country);
      if (existingName && existingName.toLowerCase() === rowName.toLowerCase() && existingState.toLowerCase() === rowState.toLowerCase() && existingCountry.toLowerCase() === rowCountry.toLowerCase()) {
        return true;
      }
    }

    return false;
  });
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
