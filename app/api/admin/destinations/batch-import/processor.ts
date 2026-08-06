export type ImportMode = "preview" | "create" | "update" | "create_or_update";
export type MatchField = "slug" | "city_country";

export type BatchImportRow = Record<string, unknown>;

export type BatchImportPlanEntry = {
  rowNumber: number;
  action: "create" | "update" | "reject" | "skip";
  reason?: string;
  slug: string;
  city: string;
  country: string;
  status?: string;
  tier?: string;
  description?: string;
  overview?: string;
  existingId?: string;
  existingSlug?: string;
  warnings?: string[];
  errors?: string[];
  fieldChanges?: Array<{ field: string; currentValue?: string; newValue?: string; changed: boolean }>;
  currentValues?: Record<string, string>;
  newValues?: Record<string, string>;
  importedRow?: Record<string, unknown>;
};

export type ExistingDestination = {
  id: string;
  slug: string;
  city: string;
  country: string;
  name?: string | null;
  destination_name?: string | null;
  description?: string | null;
  overview?: string | null;
  status?: string | null;
  tier?: string | null;
};

const normalizeText = (value: unknown) => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
};

const findFirstValue = (row: BatchImportRow, aliases: string[]) => {
  for (const alias of aliases) {
    const value = row[alias as keyof BatchImportRow];
    if (value != null && normalizeText(value) !== "") {
      return normalizeText(value);
    }
  }

  return "";
};

const findFirstListValue = (row: BatchImportRow, aliases: string[]) => {
  const rawValue = findFirstValue(row, aliases);
  if (!rawValue) {
    return [] as string[];
  }

  return rawValue
    .split(/\r?\n|[|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getRowCityValue = (row: BatchImportRow) => normalizeText(
  row.city ?? row.City ?? row.city_name ?? row.location_city ?? row.destination_name ?? row.destinationName ?? row.name ?? row.Name ?? row.destination ?? row.Destination
);

const isDeleteMarker = (value: unknown) => normalizeText(value).toLowerCase() === "[delete]";

export const buildImportedDestinationMetadata = (row: BatchImportRow) => {
  const editorialContent: Record<string, unknown> = {};
  const researchProfile: Record<string, unknown> = {};

  const descriptionValue = findFirstValue(row, ["description", "Description", "hero_description", "heroDescription", "hero_description_text", "heroNarrative", "introduction", "intro"]);
  const overviewValue = findFirstValue(row, ["overview", "Overview", "destination_overview", "destinationOverview", "destination_summary", "google_style_relocation_profile"]);
  const whyDistinctValue = findFirstValue(row, ["why_this_place_feels_distinct", "whyThisPlaceFeelsDistinct", "distinctive_narrative", "feels_distinct", "google_style_relocation_profile"]);
  const lifestyleValue = findFirstValue(row, ["lifestyle", "Lifestyle", "lifestyle_narrative", "lifestyle_summary"]);
  const climateValue = findFirstValue(row, ["climate", "Climate", "climate_narrative", "climate_summary"]);
  const transportationValue = findFirstValue(row, ["transportation", "Transportation", "transportation_narrative", "transportation_summary"]);
  const costOfLivingValue = findFirstValue(row, ["cost_of_living", "costOfLiving", "housing_costs"]);
  const housingValue = findFirstValue(row, ["housing", "housing_note"]);
  const healthcareValue = findFirstValue(row, ["healthcare", "healthcare_access"]);
  const educationValue = findFirstValue(row, ["education"]);
  const safetyValue = findFirstValue(row, ["safety"]);
  const walkabilityValue = findFirstValue(row, ["walkability"]);
  const digitalNomadValue = findFirstValue(row, ["digital_nomad", "digitalNomad", "digital_nomad_suitability"]);
  const retirementValue = findFirstValue(row, ["retirement", "retirement_suitability"]);
  const familyLivingValue = findFirstValue(row, ["family_living", "familyLiving"]);
  const localCultureValue = findFirstValue(row, ["local_culture", "localCulture"]);
  const foodDiningValue = findFirstValue(row, ["food_and_dining", "foodDining"]);
  const outdoorRecreationValue = findFirstValue(row, ["outdoor_recreation", "outdoorRecreation"]);
  const relocationAdviceValue = findFirstValue(row, ["relocation_advice", "relocationAdvice", "google_style_relocation_profile"]);
  const longFormEditorialValue = findFirstValue(row, ["long_form_editorial", "longFormEditorial", "google_style_relocation_profile"]);
  const bestForValue = findFirstListValue(row, ["best_for", "bestFor"]);
  const notIdealForValue = findFirstListValue(row, ["not_ideal_for", "notIdealFor"]);
  const bestNeighborhoodsValue = findFirstListValue(row, ["best_neighborhoods", "bestNeighborhoods"]);
  const hiddenGemsValue = findFirstListValue(row, ["hidden_gems", "hiddenGems"]);
  const prosValue = findFirstListValue(row, ["pros"]);
  const consValue = findFirstListValue(row, ["cons"]);

  if (descriptionValue) {
    editorialContent.introduction = descriptionValue;
    editorialContent.heroNarrative = descriptionValue;
    researchProfile.overview = overviewValue || descriptionValue;
  }

  if (overviewValue) {
    editorialContent.destinationOverview = overviewValue;
    researchProfile.overview = overviewValue;
  }

  if (whyDistinctValue) {
    editorialContent.whyThisPlaceFeelsDistinct = whyDistinctValue;
    researchProfile.whyThisPlaceFeelsDistinct = whyDistinctValue;
    researchProfile.feel = whyDistinctValue;
  }

  if (lifestyleValue) {
    editorialContent.lifestyleNarrative = lifestyleValue;
    if (!researchProfile.feel) {
      researchProfile.feel = lifestyleValue;
    }
  }

  if (climateValue) {
    editorialContent.climateNarrative = climateValue;
    researchProfile.climate = climateValue;
  }

  if (transportationValue) {
    editorialContent.transportationNarrative = transportationValue;
    researchProfile.transportation = transportationValue;
  }

  if (costOfLivingValue) {
    editorialContent.costOfLiving = costOfLivingValue;
    researchProfile.costOfLiving = costOfLivingValue;
  }

  if (housingValue) {
    editorialContent.housing = housingValue;
    researchProfile.housing = housingValue;
  }

  if (healthcareValue) {
    editorialContent.healthcare = healthcareValue;
    researchProfile.healthcare = healthcareValue;
  }

  if (educationValue) {
    editorialContent.education = educationValue;
    researchProfile.education = educationValue;
  }

  if (safetyValue) {
    editorialContent.safety = safetyValue;
    researchProfile.safety = safetyValue;
  }

  if (walkabilityValue) {
    editorialContent.walkability = walkabilityValue;
    researchProfile.walkability = walkabilityValue;
  }

  if (digitalNomadValue) {
    editorialContent.digitalNomad = digitalNomadValue;
    researchProfile.digitalNomadSuitability = digitalNomadValue;
  }

  if (retirementValue) {
    editorialContent.retirement = retirementValue;
    researchProfile.longStaySuitability = retirementValue;
  }

  if (familyLivingValue) {
    editorialContent.familyLiving = familyLivingValue;
    researchProfile.familyFriendliness = familyLivingValue;
  }

  if (bestNeighborhoodsValue.length > 0) {
    editorialContent.bestNeighborhoods = bestNeighborhoodsValue;
    researchProfile.bestNeighborhoods = bestNeighborhoodsValue;
  }

  if (hiddenGemsValue.length > 0) {
    editorialContent.hiddenGems = hiddenGemsValue;
    researchProfile.hiddenGems = hiddenGemsValue;
  }

  if (localCultureValue) {
    editorialContent.localCulture = localCultureValue;
    researchProfile.localCulture = localCultureValue;
  }

  if (foodDiningValue) {
    editorialContent.foodAndDining = foodDiningValue;
    researchProfile.foodAndDining = foodDiningValue;
  }

  if (outdoorRecreationValue) {
    editorialContent.outdoorRecreation = outdoorRecreationValue;
    researchProfile.outdoorRecreation = outdoorRecreationValue;
  }

  if (prosValue.length > 0) {
    editorialContent.pros = prosValue;
    researchProfile.pros = prosValue;
  }

  if (consValue.length > 0) {
    editorialContent.cons = consValue;
    researchProfile.cons = consValue;
  }

  if (bestForValue.length > 0) {
    editorialContent.bestFor = bestForValue;
    researchProfile.bestFor = bestForValue;
  }

  if (notIdealForValue.length > 0) {
    editorialContent.notIdealFor = notIdealForValue;
    researchProfile.notIdealFor = notIdealForValue;
  }

  if (relocationAdviceValue) {
    editorialContent.relocationAdvice = relocationAdviceValue;
    researchProfile.relocationAdvice = relocationAdviceValue;
  }

  if (longFormEditorialValue) {
    editorialContent.longFormEditorial = longFormEditorialValue;
    researchProfile.longFormEditorial = longFormEditorialValue;
  }

  return {
    descriptionValue,
    overviewValue,
    editorialContent: Object.keys(editorialContent).length > 0 ? editorialContent : null,
    researchProfile: Object.keys(researchProfile).length > 0 ? researchProfile : null,
  };
};

export const normalizeSlug = (value: unknown) => {
  const normalized = typeof value === "string" ? value : String(value ?? "");

  return normalized
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const buildIdentity = (city: string, country: string, slug?: string) => {
  const resolvedSlug = normalizeSlug(slug || `${city}-${country}`);
  return {
    city: city.trim(),
    country: country.trim(),
    slug: resolvedSlug,
  };
};

const findMatchingDestination = ({
  row,
  existingDestinations,
  city,
  country,
  slug,
}: {
  row: BatchImportRow;
  existingDestinations: ExistingDestination[];
  city: string;
  country: string;
  slug: string;
}) => {
  const normalizedRowId = normalizeText(row.id ?? row.destination_id ?? row.destinationId ?? row.destinationID).toLowerCase();
  const normalizedRowSlug = normalizeSlug(slug);
  const normalizedRowCity = city.toLowerCase();
  const normalizedRowCountry = country.toLowerCase();
  const normalizedRowName = normalizeText(row.destination_name ?? row.destinationName ?? row.name ?? row.destination ?? row.city ?? row.City ?? row.city_name ?? row.location_city).toLowerCase();

  return existingDestinations.find((destination) => {
    if (normalizedRowId && normalizeText(destination.id).toLowerCase() === normalizedRowId) {
      return true;
    }

    if (normalizedRowSlug && normalizeSlug(destination.slug) === normalizedRowSlug) {
      return true;
    }

    if (normalizedRowCity && normalizedRowCountry) {
      const normalizedExistingCity = normalizeText(destination.city).toLowerCase();
      const normalizedExistingCountry = normalizeText(destination.country).toLowerCase();
      if (normalizedExistingCity === normalizedRowCity && normalizedExistingCountry === normalizedRowCountry) {
        return true;
      }
    }

    if (normalizedRowName && normalizedRowCountry) {
      const normalizedExistingName = normalizeText(destination.name ?? destination.destination_name ?? destination.city).toLowerCase();
      const normalizedExistingCountry = normalizeText(destination.country).toLowerCase();
      if (normalizedExistingName === normalizedRowName && normalizedExistingCountry === normalizedRowCountry) {
        return true;
      }
    }

    return false;
  });
};

const getRowInstruction = (row: BatchImportRow) => {
  const rawInstruction = normalizeText(row.match ?? row.Match ?? row.action ?? row.Action);
  if (!rawInstruction) {
    return null;
  }

  const instruction = rawInstruction.toLowerCase();
  if (instruction === "create" || instruction === "update" || instruction === "reject" || instruction === "create_or_update") {
    return instruction as "create" | "update" | "reject" | "create_or_update";
  }

  return null;
};

export const buildBatchImportPlan = ({
  rows,
  existingDestinations,
  mode,
  matchField,
  selectedColumns,
  allowBlankClears,
}: {
  rows: BatchImportRow[];
  existingDestinations: ExistingDestination[];
  mode: ImportMode;
  matchField: MatchField;
  selectedColumns?: string[];
  allowBlankClears?: boolean;
}) => {
  const plan: BatchImportPlanEntry[] = [];

  rows.forEach((row, index) => {
    const city = getRowCityValue(row);
    const country = normalizeText(row.country ?? row.Country ?? row.country_name);
    const slug = normalizeText(row.slug ?? row.Slug ?? row.destination_slug);
    const description = normalizeText(
      row.description ?? row.Description ?? row.hero_description ?? row.heroDescription ?? row.hero_description_text ?? row.introduction ?? row.intro,
    );
    const overview = normalizeText(
      row.overview ?? row.Overview ?? row.destination_overview ?? row.destinationOverview ?? row.destination_summary,
    );
    const status = normalizeText(row.status ?? row.Status ?? "published");
    const tier = normalizeText(row.tier ?? row.Tier ?? "launch");
    const allowedColumns = (selectedColumns ?? ["description", "overview", "status", "tier"]).map((column) => column.toLowerCase());

    const identity = buildIdentity(city, country, slug);

    if (!city || !country) {
      plan.push({
        rowNumber: index + 2,
        action: "reject",
        reason: "City and country are required.",
        slug: identity.slug,
        city,
        country,
      });
      return;
    }

    const rowInstruction = getRowInstruction(row);
    const existing = findMatchingDestination({
      row,
      existingDestinations,
      city,
      country,
      slug: identity.slug,
    });

    const currentValues: Record<string, string> = {
      city: existing?.city ?? "",
      country: existing?.country ?? "",
      slug: existing?.slug ?? "",
      description: existing?.description ?? "",
      overview: existing?.overview ?? "",
      status: existing?.status ?? "",
      tier: existing?.tier ?? "",
    };

    const newValues: Record<string, string> = {
      city,
      country,
      slug: identity.slug,
      description,
      overview,
      status,
      tier,
    };

    const fieldChanges = ["city", "country", "slug", "description", "overview", "status", "tier"].map((field) => {
      const currentValue = currentValues[field] ?? "";
      const newValue = newValues[field] ?? "";
      const normalizedNewValue = normalizeText(newValue);
      const normalizedCurrentValue = normalizeText(currentValue);
      const isIdentityField = ["city", "country", "slug"].includes(field);
      const isSelectedField = isIdentityField || allowedColumns.includes(field);
      const hasBlankValue = normalizedNewValue === "";
      const isClearRequest = isDeleteMarker(newValue);
      const shouldTreatAsChange = isSelectedField && ((allowBlankClears && hasBlankValue) ? normalizedCurrentValue !== "" : !hasBlankValue || isClearRequest);
      const changed = isSelectedField ? shouldTreatAsChange && normalizedNewValue !== normalizedCurrentValue : false;

      return {
        field,
        currentValue,
        newValue: isClearRequest ? "" : normalizedNewValue,
        changed,
      };
    });

    const effectiveMode = rowInstruction ?? mode;

    if (rowInstruction === "reject") {
      plan.push({
        rowNumber: index + 2,
        action: "reject",
        reason: "Row explicitly rejected.",
        slug: identity.slug,
        city,
        country,
        status,
        tier,
        description,
        overview,
        warnings: [],
        errors: ["Row explicitly rejected."],
        fieldChanges,
        currentValues,
        newValues,
        importedRow: row,
      });
      return;
    }

    if (effectiveMode === "create" && existing) {
      plan.push({
        rowNumber: index + 2,
        action: "reject",
        reason: "Destination already exists.",
        slug: identity.slug,
        city,
        country,
        status,
        tier,
        description,
        overview,
        existingId: existing.id,
        existingSlug: existing.slug,
        warnings: ["Destination already exists; no create action executed."],
        errors: [],
        fieldChanges,
        currentValues,
        newValues,
        importedRow: row,
      });
      return;
    }

    if (effectiveMode === "update" && !existing) {
      plan.push({
        rowNumber: index + 2,
        action: "reject",
        reason: "Destination not found for update.",
        slug: identity.slug,
        city,
        country,
        status,
        tier,
        description,
        overview,
        warnings: [],
        errors: ["Destination not found for update."],
        fieldChanges,
        currentValues,
        newValues,
        importedRow: row,
      });
      return;
    }

    const action = existing ? "update" : "create";
    const warnings = fieldChanges.filter((entry) => entry.changed === false && entry.field !== "city" && entry.field !== "country" && entry.field !== "slug").map((entry) => `No change for ${entry.field}.`);
    const effectiveWarnings = warnings.length > 0 ? warnings : [];

    plan.push({
      rowNumber: index + 2,
      action,
      slug: identity.slug,
      city,
      country,
      status,
      tier,
      description,
      overview,
      existingId: existing?.id,
      existingSlug: existing?.slug,
      warnings: effectiveWarnings,
      errors: [],
      fieldChanges,
      currentValues,
      newValues,
      importedRow: row,
    });
  });

  return plan;
};

export const buildImportSummary = ({
  plan,
  totalRows,
}: {
  plan: BatchImportPlanEntry[];
  totalRows: number;
}) => ({
  totalRows,
  create: plan.filter((entry) => entry.action === "create").length,
  update: plan.filter((entry) => entry.action === "update").length,
  reject: plan.filter((entry) => entry.action === "reject").length,
  skip: plan.filter((entry) => entry.action === "skip").length,
  warnings: plan.reduce((count, entry) => count + (entry.warnings?.length ?? 0), 0),
  errors: plan.reduce((count, entry) => count + (entry.errors?.length ?? 0), 0),
});

export const buildDestinationUpdatePayload = ({
  existingDestination,
  existingDestinations,
  row,
  selectedColumns,
  allowBlankClears,
  metadata,
  description,
  overview,
}: {
  existingDestination?: ExistingDestination | null;
  existingDestinations?: ExistingDestination[];
  row: BatchImportPlanEntry;
  selectedColumns?: string[];
  allowBlankClears?: boolean;
  metadata?: Record<string, unknown> | null;
  description?: string | null;
  overview?: string | null;
}) => {
  const updates: Record<string, string | null | Record<string, unknown>> = {};

  const enabledColumns = (selectedColumns ?? ["description", "overview", "status", "tier"]).map((column) => column.toLowerCase());
  const isDefaultSelection = enabledColumns.length === 0;
  const shouldIncludeColumn = (column: string) => {
    const normalizedColumn = column.toLowerCase();
    if (["city", "country", "slug"].includes(normalizedColumn)) {
      return true;
    }

    if (isDefaultSelection) {
      return ["description", "overview", "status", "tier"].includes(normalizedColumn);
    }

    return enabledColumns.includes(normalizedColumn);
  };

  if (shouldIncludeColumn("city") && row.city) {
    updates.city = row.city;
  }

  if (shouldIncludeColumn("country") && row.country) {
    updates.country = row.country;
  }

  const incomingSlug = normalizeSlug(row.slug);
  const hasConflictingSlug = Boolean(
    existingDestination &&
      existingDestinations?.some((destination) => {
        const destinationSlug = normalizeSlug(destination.slug);
        return destinationSlug && destinationSlug === incomingSlug && normalizeText(destination.id) !== normalizeText(existingDestination.id);
      }),
  );

  if (shouldIncludeColumn("slug") && row.slug && !hasConflictingSlug) {
    updates.slug = row.slug;
  }

  if (shouldIncludeColumn("status") && row.status) {
    updates.status = row.status;
  }

  if (shouldIncludeColumn("tier") && row.tier) {
    updates.tier = row.tier;
  }

  const resolvedDescription = description ?? row.description ?? null;
  const resolvedOverview = overview ?? row.overview ?? null;

  if (shouldIncludeColumn("description") && (allowBlankClears || row.description !== "" || (resolvedDescription != null && resolvedDescription !== ""))) {
    updates.description = resolvedDescription;
  }

  if (shouldIncludeColumn("overview") && (allowBlankClears || row.overview !== "" || (resolvedOverview != null && resolvedOverview !== ""))) {
    updates.overview = resolvedOverview;
  }

  if (metadata && Object.keys(metadata).length > 0) {
    updates.metadata = metadata;
  }

  if (existingDestination) {
    return {
      existingDestination,
      updates,
    };
  }

  return {
    existingDestination: null,
    updates,
  };
};
