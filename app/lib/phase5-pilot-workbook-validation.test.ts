import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildPremiumV2WorkbookContractPreview, buildPremiumV2WorkbookImportPlan, normalizeWorkbookImportMode } from "./workbook-import-engine";

const workbookPath = path.resolve(process.cwd(), "data/DestinationFinderAI_Master_Schema_v2.0_Premium_3-Destination_Pilot 3.xlsx");

const getRowValue = (row: Record<string, unknown>, field: string) => {
  const value = row[field] ?? row[field.toLowerCase()] ?? row[field.toUpperCase()];
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
};

const loadWorkbookPayload = () => {
  const output = execFileSync(
    "/Users/samuelcurtdardano/Desktop/horizon-atlas-v2/.venv/bin/python",
    [
      "-c",
      `import json, sys
from openpyxl import load_workbook
path = sys.argv[1]
wb = load_workbook(path, read_only=True, data_only=True)
module_sheets = [
    "DESTINATIONS",
    "DESTINATION_FACTS",
    "DESTINATION_SCORES",
    "NEIGHBORHOODS",
    "PLACES",
    "RESOURCES",
    "MEDIA",
    "COST_OF_LIVING",
    "CLIMATE_MONTHLY",
    "HOUSING_PROPERTY",
    "PROPERTY_RESOURCES",
    "HEALTHCARE_INSURANCE",
    "VISA_RESIDENCY",
    "TAXES_FINANCE",
    "LGBTQ_INCLUSIVITY",
    "SAFETY_RISKS",
    "TRANSPORT_AIRPORTS",
    "CONNECTIVITY_REMOTE_WORK",
    "LANGUAGE_INTEGRATION",
    "PETS",
    "FAMILY_EDUCATION",
    "COMMUNITY_SOCIAL",
    "ACCESSIBILITY",
    "BUREAUCRACY_SETUP",
    "WORK_BUSINESS",
    "RETIREMENT_AGING",
    "LIFESTYLE_LAWS",
    "REALITY_CHECK",
    "MOVE_CHECKLIST",
    "SOURCES",
    "README",
    "CATEGORIES",
    "SCORING_DIMENSIONS",
    "STAY_MODES",
    "SCHEMA_INDEX",
    "PILOT_STATUS",
]
workbookSheets = wb.sheetnames
rows_by_sheet = {}
headers_by_sheet = {}
for sheet_name in workbookSheets:
    if sheet_name.upper() not in module_sheets:
        continue
    sheet = wb[sheet_name]
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        continue
    headers = [str(cell) if cell is not None else "" for cell in rows[0]]
    body_rows = []
    for row in rows[1:]:
        if not any(cell is not None and str(cell).strip() != "" for cell in row):
            continue
        body_rows.append([cell if cell is not None else "" for cell in row])
    normalized_rows = []
    for row in body_rows:
        record = {}
        for idx, header in enumerate(headers):
            if idx < len(row):
                value = row[idx]
                if isinstance(value, str):
                    record[header] = value
                else:
                    record[header] = value
        normalized_rows.append(record)
    rows_by_sheet[sheet_name] = normalized_rows
    headers_by_sheet[sheet_name] = headers
print(json.dumps({"workbookSheets": workbookSheets, "rowsBySheet": rows_by_sheet, "headersBySheet": headers_by_sheet}, ensure_ascii=False))
`, workbookPath],
    { encoding: "utf8" },
  );

  return JSON.parse(output);
};

describe("Phase 5 pilot workbook validation", () => {
  it("recognizes the real Premium V2 pilot workbook, resolves the three pilot destinations, and keeps module rows scoped to the matching destination", () => {
    const workbookPayload = loadWorkbookPayload();
    const preview = buildPremiumV2WorkbookContractPreview({
      workbookSheets: workbookPayload.workbookSheets,
      workbookRowsBySheet: workbookPayload.rowsBySheet,
      workbookHeadersBySheet: workbookPayload.headersBySheet,
      existingDestinations: [],
    });

    const destinationModule = preview.runtimeModules.find((module) => module.key === "destinations");
    const neighborhoodModule = preview.runtimeModules.find((module) => module.key === "neighborhoods");
    const placeModule = preview.runtimeModules.find((module) => module.key === "places");
    const resourceModule = preview.runtimeModules.find((module) => module.key === "resources");

    const destinationRows = (workbookPayload.rowsBySheet.DESTINATIONS ?? []).map((row) => row as Record<string, unknown>);
    const neighborhoodRows = (workbookPayload.rowsBySheet.NEIGHBORHOODS ?? []).map((row) => row as Record<string, unknown>);
    const placeRows = (workbookPayload.rowsBySheet.PLACES ?? []).map((row) => row as Record<string, unknown>);
    const resourceRows = (workbookPayload.rowsBySheet.RESOURCES ?? []).map((row) => row as Record<string, unknown>);

    const expectedDestinations = [
      { key: "new-braunfels-tx-us", name: "New Braunfels", slug: "new-braunfels-texas" },
      { key: "lisbon-pt", name: "Lisbon", slug: "lisbon-portugal" },
      { key: "summerlin-nv-us", name: "Summerlin", slug: "summerlin-las-vegas-nevada" },
    ];

    expect(preview.recognized).toBe(true);
    expect(destinationModule?.detected).toBe(true);
    expect(neighborhoodModule?.detected).toBe(true);
    expect(placeModule?.detected).toBe(true);
    expect(resourceModule?.detected).toBe(true);
    expect(preview.errors).toEqual([]);
    expect(preview.destinationResolution?.resolvedDestinations.map((destination) => destination.name)).toEqual(expect.arrayContaining(["New Braunfels", "Lisbon", "Summerlin"]));
    expect(preview.destinationResolution?.unresolvedRows).toEqual([]);

    const importPlan = buildPremiumV2WorkbookImportPlan({
      destinationRows,
      neighborhoodRows,
      neighborhoodPlaceRows: placeRows,
      resourceRows,
      mediaRows: workbookPayload.rowsBySheet.MEDIA ?? [],
      existingDestinations: [],
      mode: normalizeWorkbookImportMode("UPDATE_SUPPLIED_FIELDS"),
    });

    const destinationEntriesByKey = new Map<string, (typeof importPlan.destinations)[number]>();
    destinationRows.forEach((row, index) => {
      const destinationKey = getRowValue(row, "destination_key");
      if (destinationKey) {
        destinationEntriesByKey.set(destinationKey, importPlan.destinations[index]);
      }
    });

    expectedDestinations.forEach(({ key, name, slug }) => {
      const destinationEntry = destinationEntriesByKey.get(key);
      expect(destinationEntry).toBeDefined();
      expect(destinationEntry?.action).toBe("create");
      expect(destinationEntry?.slug).toBe(slug);
      expect(getRowValue(destinationRows.find((row) => getRowValue(row, "destination_key") === key) ?? {}, "destination_name")).toBe(name);
    });

    const neighborhoodPairs = neighborhoodRows.map((row, index) => ({ row, entry: importPlan.neighborhoods[index] }));
    const placePairs = placeRows.map((row, index) => ({ row, entry: importPlan.neighborhoodPlaces[index] }));
    const resourcePairs = resourceRows.map((row, index) => ({ row, entry: importPlan.resources[index] }));

    expectedDestinations.forEach(({ key, slug }) => {
      const matchingNeighborhoods = neighborhoodPairs.filter(({ row }) => getRowValue(row, "destination_key") === key);
      expect(matchingNeighborhoods.length).toBeGreaterThan(0);
      expect(matchingNeighborhoods.some(({ entry }) => entry.action === "reject")).toBe(false);
      expect(matchingNeighborhoods.every(({ entry }) => entry.destinationSlug === slug)).toBe(true);

      const matchingPlaces = placePairs.filter(({ row }) => getRowValue(row, "destination_key") === key);
      expect(matchingPlaces.length).toBeGreaterThan(0);
      expect(matchingPlaces.some(({ entry }) => entry.action === "reject")).toBe(false);
      expect(matchingPlaces.every(({ entry }) => entry.destinationSlug === slug)).toBe(true);

      const matchingResources = resourcePairs.filter(({ row }) => getRowValue(row, "destination_key") === key);
      expect(matchingResources.length).toBeGreaterThan(0);
      expect(matchingResources.some(({ entry }) => entry.action === "reject")).toBe(false);
      expect(matchingResources.every(({ entry }) => entry.destinationSlug === slug)).toBe(true);
      expect(matchingResources.some(({ row }) => getRowValue(row, "url").startsWith("http"))).toBe(true);
    });

    const newBraunfelsPlaces = placePairs.filter(({ row }) => getRowValue(row, "destination_key") === "new-braunfels-tx-us");
    const lisbonPlaces = placePairs.filter(({ row }) => getRowValue(row, "destination_key") === "lisbon-pt");
    const summerlinPlaces = placePairs.filter(({ row }) => getRowValue(row, "destination_key") === "summerlin-nv-us");

    expect(newBraunfelsPlaces.every(({ entry }) => entry.destinationSlug === "new-braunfels-texas")).toBe(true);
    expect(lisbonPlaces.every(({ entry }) => entry.destinationSlug === "lisbon-portugal")).toBe(true);
    expect(summerlinPlaces.every(({ entry }) => entry.destinationSlug === "summerlin-las-vegas-nevada")).toBe(true);

    expect(importPlan.previewSummary.destinationCount).toBeGreaterThanOrEqual(3);
    expect(importPlan.previewSummary.rejectedCount).toBe(0);
    expect(importPlan.destinations.filter((entry) => entry.action !== "reject")).toHaveLength(importPlan.previewSummary.destinationCount);
  });
});
