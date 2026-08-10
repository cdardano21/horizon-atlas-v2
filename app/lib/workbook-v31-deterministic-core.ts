import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export type DeterministicV31Destination = {
  destinationKey: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  facts: Array<{
    factKey: string;
    factGroup: string;
    valueText: string;
    displayLabel: string;
    sourceName: string;
  }>;
  scores: Array<{
    scoreKey: string;
    scoreValue: string;
    scoreLabel: string;
    methodologyVersion: string;
  }>;
  moduleCounts?: Record<string, number>;
};

export type DeterministicV31CanonicalDestination = {
  identity: {
    destinationKey: string;
    slug: string | null;
    name: string | null;
    city: string | null;
    country: string | null;
  };
  editorial: {
    shortDescription: string | null;
    longDescription: string | null;
    currency: string | null;
    primaryLanguage: string | null;
    timeZone: string | null;
  };
  facts: Array<Record<string, unknown>>;
  scores: Array<Record<string, unknown>>;
  neighborhoods: Array<Record<string, unknown>>;
  places: Array<Record<string, unknown>>;
  resources: Array<Record<string, unknown>>;
  media: Array<Record<string, unknown>>;
  costOfLiving: Array<Record<string, unknown>>;
  climateMonthly: Array<Record<string, unknown>>;
  housing: Array<Record<string, unknown>>;
  propertyResources: Array<Record<string, unknown>>;
  healthcare: Array<Record<string, unknown>>;
  visaResidency: Array<Record<string, unknown>>;
  taxesFinance: Array<Record<string, unknown>>;
  lgbtqInclusivity: Array<Record<string, unknown>>;
  safetyRisks: Array<Record<string, unknown>>;
  transportation: Array<Record<string, unknown>>;
  remoteWork: Array<Record<string, unknown>>;
  languageIntegration: Array<Record<string, unknown>>;
  pets: Array<Record<string, unknown>>;
  familyEducation: Array<Record<string, unknown>>;
  communitySocial: Array<Record<string, unknown>>;
  accessibility: Array<Record<string, unknown>>;
  bureaucracySetup: Array<Record<string, unknown>>;
  workBusiness: Array<Record<string, unknown>>;
  retirementAging: Array<Record<string, unknown>>;
  lifestyleLaws: Array<Record<string, unknown>>;
  realityCheck: Array<Record<string, unknown>>;
  moveChecklist: Array<Record<string, unknown>>;
  environmentQuality: Record<string, unknown> | null;
  dailyLifePracticality: Record<string, unknown> | null;
  eventsSeasonality: Array<Record<string, unknown>>;
  sources: Array<Record<string, unknown>>;
};

export type DeterministicV31ImportPlan = {
  destinations: DeterministicV31Destination[];
  rejectedRows: Array<{
    sheet: string;
    rowNumber: number;
    reason: string;
  }>;
};

export type DeterministicV31WorkbookImport = {
  contractVersion: string;
  validationErrors: string[];
  destinations: DeterministicV31Destination[];
  canonicalDestinations?: DeterministicV31CanonicalDestination[];
  diagnostics?: {
    readOnly: boolean;
    architecture: string;
    metadata: Record<string, string>;
    aliasResolution: Record<string, string>;
    moduleCounts: Record<string, number>;
  };
};

export type DeterministicV31IdentityResolutionResult = {
  ok: boolean;
  value?: string;
  error?: string;
};

export type DeterministicV31CanonicalImportFixture = {
  destinations: Array<{
    destinationKey: string;
    facts?: Array<Record<string, unknown>>;
    scores?: Array<Record<string, unknown>>;
    neighborhoods?: Array<Record<string, unknown>>;
    places?: Array<Record<string, unknown>>;
    media?: Array<Record<string, unknown>>;
    aliases?: Array<Record<string, unknown>>;
  }>;
};

const workbookPath = path.resolve(process.cwd(), "data/DestinationFinderAI_Master_Workbook_v3.1_FROZEN_Pilot_Dataset.xlsx");

const normalizeCellValue = (value: unknown) => {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
};

const normalizeBlankValue = (value: unknown) => {
  const normalized = normalizeCellValue(value);
  return normalized === "" ? null : normalized;
};

const normalizeScalarValue = (value: unknown) => normalizeBlankValue(value);

const getHeaderIndex = (headers: string[], headerName: string) => {
  const normalizedHeader = normalizeCellValue(headerName).toLowerCase();
  return headers.findIndex((header) => normalizeCellValue(header).toLowerCase() === normalizedHeader);
};

const getRowValue = (headers: string[], row: Array<string>, headerName: string) => {
  const index = getHeaderIndex(headers, headerName);
  if (index < 0) return "";
  return normalizeCellValue(row[index]);
};

const buildRecordFromRow = (headers: string[], row: Array<string>) => {
  const record: Record<string, unknown> = {};
  headers.forEach((header, index) => {
    record[header] = normalizeBlankValue(row[index]);
  });
  return record;
};

const getSheetRowsForDestination = (sheetRows: Map<string, Array<Array<string>>>, headersBySheet: Map<string, string[]>, sheetName: string, destinationKey: string) => {
  const rows = (sheetRows.get(sheetName) ?? []).slice(1);
  const headers = headersBySheet.get(sheetName) ?? [];
  return rows
    .filter((row) => normalizeCellValue(getRowValue(headers, row, "destination_key")) === destinationKey)
    .map((row) => {
      const record = buildRecordFromRow(headers, row);
      if (record.destination_key == null) {
        record.destination_key = destinationKey;
      }
      return record;
    });
};

export const buildDeterministicV31CanonicalDestination = (input: {
  destinationKey: string;
  destinationRow: Array<string>;
  destinationHeaders: string[];
  sheetRows: Map<string, Array<Array<string>>>;
  headersBySheet: Map<string, string[]>;
}): DeterministicV31CanonicalDestination => {
  const destinationRecord = buildRecordFromRow(input.destinationHeaders, input.destinationRow);
  const destinationKey = normalizeCellValue(input.destinationKey || destinationRecord.destination_key);
  const destinationRows = getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DESTINATIONS", destinationKey);
  const destinationRowRecord = destinationRows[0] ?? destinationRecord;

  return {
    identity: {
      destinationKey,
      slug: normalizeBlankValue(destinationRowRecord.slug) as string | null,
      name: normalizeBlankValue(destinationRowRecord.destination_name) as string | null,
      city: normalizeBlankValue(destinationRowRecord.city) as string | null,
      country: normalizeBlankValue(destinationRowRecord.country) as string | null,
    },
    editorial: {
      shortDescription: normalizeBlankValue(destinationRowRecord.short_description) as string | null,
      longDescription: normalizeBlankValue(destinationRowRecord.long_description) as string | null,
      currency: normalizeBlankValue(destinationRowRecord.currency) as string | null,
      primaryLanguage: normalizeBlankValue(destinationRowRecord.primary_language) as string | null,
      timeZone: normalizeBlankValue(destinationRowRecord.time_zone) as string | null,
    },
    facts: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DESTINATION_FACTS", destinationKey).map((record) => ({ ...record, factKey: record.fact_key, factGroup: record.fact_group, valueText: record.value_text, displayLabel: record.display_label, sourceName: record.source_name })),
    scores: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DESTINATION_SCORES", destinationKey).map((record) => ({ ...record, scoreKey: record.score_key, scoreValue: record.score_value, scoreLabel: record.score_label, methodologyVersion: record.methodology_version })),
    neighborhoods: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "NEIGHBORHOODS", destinationKey),
    places: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "PLACES", destinationKey),
    resources: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "RESOURCES", destinationKey),
    media: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "MEDIA", destinationKey),
    costOfLiving: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "COST_OF_LIVING", destinationKey),
    climateMonthly: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "CLIMATE_MONTHLY", destinationKey),
    housing: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "HOUSING_PROPERTY", destinationKey),
    propertyResources: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "PROPERTY_RESOURCES", destinationKey),
    healthcare: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "HEALTHCARE_INSURANCE", destinationKey),
    visaResidency: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "VISA_RESIDENCY", destinationKey),
    taxesFinance: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "TAXES_FINANCE", destinationKey),
    lgbtqInclusivity: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "LGBTQ_INCLUSIVITY", destinationKey),
    safetyRisks: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "SAFETY_RISKS", destinationKey),
    transportation: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "TRANSPORT_AIRPORTS", destinationKey),
    remoteWork: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "CONNECTIVITY_REMOTE_WORK", destinationKey),
    languageIntegration: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "LANGUAGE_INTEGRATION", destinationKey),
    pets: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "PETS", destinationKey),
    familyEducation: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "FAMILY_EDUCATION", destinationKey),
    communitySocial: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "COMMUNITY_SOCIAL", destinationKey),
    accessibility: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "ACCESSIBILITY", destinationKey),
    bureaucracySetup: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "BUREAUCRACY_SETUP", destinationKey),
    workBusiness: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "WORK_BUSINESS", destinationKey),
    retirementAging: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "RETIREMENT_AGING", destinationKey),
    lifestyleLaws: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "LIFESTYLE_LAWS", destinationKey),
    realityCheck: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "REALITY_CHECK", destinationKey),
    moveChecklist: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "MOVE_CHECKLIST", destinationKey),
    environmentQuality: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "ENVIRONMENT_QUALITY", destinationKey)[0] ?? null,
    dailyLifePracticality: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DAILY_LIFE_PRACTICALITY", destinationKey)[0] ?? null,
    eventsSeasonality: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "EVENTS_SEASONALITY", destinationKey),
    sources: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "SOURCES", destinationKey),
  };
};

const parseWorkbookRows = () => {
  const pythonCommand = process.env.PYTHON || "python3";
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "workbook-v31-"));
  const scriptPath = path.join(tempDir, "parse_workbook.py");
  const outputPath = path.join(tempDir, "parsed_workbook.json");
  const script = `
import json
import sys
import zipfile
import xml.etree.ElementTree as ET

ns = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
rel_ns = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}

with zipfile.ZipFile(sys.argv[1]) as archive:
    workbook = ET.fromstring(archive.read('xl/workbook.xml'))
    sheets = workbook.find('a:sheets', ns)
    relationships = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
    rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in relationships.findall('r:Relationship', rel_ns)}

    shared_strings = []
    if 'xl/sharedStrings.xml' in archive.namelist():
        shared_strings_xml = ET.fromstring(archive.read('xl/sharedStrings.xml'))
        for item in shared_strings_xml.findall('a:si', ns):
            text = ''.join(node.text or '' for node in item.iterfind('.//a:t', ns))
            shared_strings.append(text)

    rows_by_sheet = {}
    for sheet in sheets.findall('a:sheet', ns):
        name = sheet.attrib['name']
        rel_id = sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        target = rel_map[rel_id]
        if not target.startswith('/'):
            target = '/' + target
        sheet_path = target.lstrip('/')
        if not sheet_path.startswith('xl/'):
            sheet_path = 'xl/' + sheet_path
        sheet_xml = ET.fromstring(archive.read(sheet_path))
        parsed_rows = []
        for row in sheet_xml.findall('.//a:sheetData/a:row', ns):
            values = []
            for cell in row.findall('a:c', ns):
                cell_type = cell.attrib.get('t')
                value_node = cell.find('a:v', ns)
                if cell_type == 's' and value_node is not None and value_node.text is not None:
                    index = int(value_node.text)
                    values.append(shared_strings[index] if index < len(shared_strings) else '')
                elif value_node is not None and value_node.text is not None:
                    values.append(value_node.text)
                else:
                    inline = cell.find('a:is', ns)
                    if inline is not None:
                        text = ''.join(node.text or '' for node in inline.iterfind('.//a:t', ns))
                        values.append(text)
                    else:
                        values.append('')
            parsed_rows.append(values)
        rows_by_sheet[name] = parsed_rows

    with open(sys.argv[2], 'w', encoding='utf-8') as handle:
        json.dump(rows_by_sheet, handle)
`;
  writeFileSync(scriptPath, script, "utf8");
  try {
    execFileSync(pythonCommand, [scriptPath, workbookPath, outputPath], { encoding: "utf8" });
    const parsed = JSON.parse(readFileSync(outputPath, "utf8")) as Record<string, Array<Array<string>>>;
    return {
      sheetNames: Object.keys(parsed),
      sheetRows: new Map(Object.entries(parsed)),
      sharedStrings: [] as string[],
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

export const loadFrozenWorkbookV31DeterministicImport = async (): Promise<DeterministicV31WorkbookImport> => {
  const workbookRows = parseWorkbookRows();
  const sheetNames = workbookRows.sheetNames;
  const sheetRows = workbookRows.sheetRows;

  const requiredSheets = ["DESTINATIONS", "DESTINATION_FACTS", "DESTINATION_SCORES", "IMPORT_CONTRACT", "PILOT_STATUS", "WORKBOOK_METADATA", "IMPORT_MANIFEST", "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY"];
  if (requiredSheets.some((sheetName) => !sheetNames.includes(sheetName))) {
    return {
      contractVersion: "unknown",
      validationErrors: ["Required workbook sheets are missing from the frozen workbook."],
      destinations: [],
    };
  }

  const metadataRows = (sheetRows.get("WORKBOOK_METADATA") ?? []).slice(1);
  const contractVersionRow = metadataRows.find((row) => normalizeCellValue(row[0]).toLowerCase() === "schema_version");
  const contractVersion = contractVersionRow?.[1] ?? "unknown";
  const metadata = Object.fromEntries(metadataRows.map((row) => [normalizeCellValue(row[0]), normalizeCellValue(row[1])]).filter(([key]) => key));
  metadata.sheetNames = sheetNames.join(",");
  const architecture = metadata.architecture ?? "unknown";

  const pilotStatusRows = (sheetRows.get("PILOT_STATUS") ?? []).slice(1);
  const destinationSheetRows = (sheetRows.get("DESTINATIONS") ?? []);
  const destinationHeaders = destinationSheetRows[0] ?? [];
  const destinationRows = destinationSheetRows.slice(1);
  const factSheetRows = (sheetRows.get("DESTINATION_FACTS") ?? []);
  const factHeaders = factSheetRows[0] ?? [];
  const factRows = factSheetRows.slice(1);
  const scoreSheetRows = (sheetRows.get("DESTINATION_SCORES") ?? []);
  const scoreHeaders = scoreSheetRows[0] ?? [];
  const scoreRows = scoreSheetRows.slice(1);

  const aliasSheetRows = (sheetRows.get("DESTINATION_ALIASES") ?? []);
  const aliasHeaders = aliasSheetRows[0] ?? [];
  const aliasRows = aliasSheetRows.slice(1);

  const moduleSheetNames = ["NEIGHBORHOODS", "PLACES", "RESOURCES", "MEDIA", "COST_OF_LIVING", "CLIMATE_MONTHLY", "HOUSING_PROPERTY", "PROPERTY_RESOURCES", "HEALTHCARE_INSURANCE", "VISA_RESIDENCY", "TAXES_FINANCE", "LGBTQ_INCLUSIVITY", "SAFETY_RISKS", "TRANSPORT_AIRPORTS", "CONNECTIVITY_REMOTE_WORK", "LANGUAGE_INTEGRATION", "PETS", "FAMILY_EDUCATION", "COMMUNITY_SOCIAL", "ACCESSIBILITY", "BUREAUCRACY_SETUP", "WORK_BUSINESS", "RETIREMENT_AGING", "LIFESTYLE_LAWS", "REALITY_CHECK", "MOVE_CHECKLIST", "ENVIRONMENT_QUALITY", "DAILY_LIFE_PRACTICALITY", "EVENTS_SEASONALITY", "SOURCES"];

  const aliasResolution = Object.fromEntries(
    aliasRows
      .filter((row) => normalizeCellValue(getRowValue(aliasHeaders, row, "alias_value")) && normalizeCellValue(getRowValue(aliasHeaders, row, "active")) === "1")
      .map((row) => [normalizeCellValue(getRowValue(aliasHeaders, row, "alias_value")), normalizeCellValue(getRowValue(aliasHeaders, row, "destination_key"))]),
  );

  const destinations: DeterministicV31Destination[] = [];
  const destinationKeySet = new Set<string>();
  const headersBySheet = new Map<string, string[]>();
  for (const sheetName of sheetNames) {
    headersBySheet.set(sheetName, (sheetRows.get(sheetName) ?? [])[0] ?? []);
  }

  const canonicalDestinations: DeterministicV31CanonicalDestination[] = [];
  for (const row of destinationRows) {
    const destinationKey = getRowValue(destinationHeaders, row, "destination_key");
    if (!destinationKey) continue;
    destinationKeySet.add(destinationKey);
    const name = getRowValue(destinationHeaders, row, "destination_name");
    const country = getRowValue(destinationHeaders, row, "country");
    const slug = getRowValue(destinationHeaders, row, "slug");
    const city = getRowValue(destinationHeaders, row, "city");

    const facts = factRows
      .filter((factRow) => getRowValue(factHeaders, factRow, "destination_key") === destinationKey)
      .map((factRow) => ({
        factKey: getRowValue(factHeaders, factRow, "fact_key"),
        factGroup: getRowValue(factHeaders, factRow, "fact_group"),
        valueText: getRowValue(factHeaders, factRow, "value_text"),
        displayLabel: getRowValue(factHeaders, factRow, "display_label"),
        sourceName: getRowValue(factHeaders, factRow, "source_name"),
      }));

    const scores = scoreRows
      .filter((scoreRow) => getRowValue(scoreHeaders, scoreRow, "destination_key") === destinationKey)
      .map((scoreRow) => ({
        scoreKey: getRowValue(scoreHeaders, scoreRow, "score_key"),
        scoreValue: getRowValue(scoreHeaders, scoreRow, "score_value"),
        scoreLabel: getRowValue(scoreHeaders, scoreRow, "score_label"),
        methodologyVersion: getRowValue(scoreHeaders, scoreRow, "methodology_version"),
      }));

    const destinationModuleCounts = Object.fromEntries(moduleSheetNames.map((sheetName) => [sheetName, (sheetRows.get(sheetName) ?? []).slice(1).filter((moduleRow) => normalizeCellValue(getRowValue((sheetRows.get(sheetName) ?? [])[0] ?? [], moduleRow, "destination_key")) === destinationKey).length]));

    destinations.push({
      destinationKey,
      slug: slug || destinationKey,
      name,
      city,
      country,
      facts,
      scores,
      moduleCounts: destinationModuleCounts,
    });

    canonicalDestinations.push(buildDeterministicV31CanonicalDestination({
      destinationKey,
      destinationRow: row,
      destinationHeaders,
      sheetRows,
      headersBySheet,
    }));
  }

  const moduleCounts = {
    DESTINATIONS: destinations.length,
    ...Object.fromEntries(moduleSheetNames.map((sheetName) => [sheetName, (sheetRows.get(sheetName) ?? []).slice(1).filter((row) => row.some((value) => normalizeCellValue(value))).length])),
  };

  const validationErrors = [] as string[];
  if (contractVersion !== "3.1") {
    validationErrors.push("Workbook contract version does not match expected v3.1.");
  }
  if (pilotStatusRows.length < 3) {
    validationErrors.push("Pilot status sheet is missing the expected pilot destinations.");
  }
  if (destinations.length === 0) {
    validationErrors.push("No destinations were resolved from the workbook.");
  }

  const orphanedChildRows = [] as string[];
  for (const sheetName of ["DESTINATION_FACTS", "DESTINATION_SCORES", "NEIGHBORHOODS", "PLACES", "RESOURCES", "MEDIA", "COST_OF_LIVING", "CLIMATE_MONTHLY", "HOUSING_PROPERTY", "PROPERTY_RESOURCES", "HEALTHCARE_INSURANCE", "VISA_RESIDENCY", "TAXES_FINANCE", "LGBTQ_INCLUSIVITY", "SAFETY_RISKS", "TRANSPORT_AIRPORTS", "CONNECTIVITY_REMOTE_WORK", "LANGUAGE_INTEGRATION", "PETS", "FAMILY_EDUCATION", "COMMUNITY_SOCIAL", "ACCESSIBILITY", "BUREAUCRACY_SETUP", "WORK_BUSINESS", "RETIREMENT_AGING", "LIFESTYLE_LAWS", "REALITY_CHECK", "MOVE_CHECKLIST", "ENVIRONMENT_QUALITY", "DAILY_LIFE_PRACTICALITY", "EVENTS_SEASONALITY", "SOURCES"]) {
    const rows = (sheetRows.get(sheetName) ?? []).slice(1);
    if (rows.length === 0) continue;
    const headers = (sheetRows.get(sheetName) ?? [])[0] ?? [];
    for (const row of rows) {
      const destinationKey = getRowValue(headers, row, "destination_key");
      if (destinationKey && !destinationKeySet.has(destinationKey)) {
        orphanedChildRows.push(`${sheetName}:${destinationKey}`);
      }
    }
  }
  if (orphanedChildRows.length > 0) {
    validationErrors.push(`Orphaned child rows detected for ${orphanedChildRows.length} record(s).`);
  }

  return {
    contractVersion,
    validationErrors,
    destinations,
    canonicalDestinations,
    diagnostics: {
      readOnly: true,
      architecture,
      metadata,
      aliasResolution,
      moduleCounts,
    },
  };
};

export const buildDeterministicV31ImportPlan = (input: {
  destinations: Array<{ destination_key: string; slug: string; destination_name: string; city: string; country: string }>;
  destinationFacts: Array<{ destination_key: string; fact_group: string; fact_key: string; display_label: string; value_text: string; source_name: string }>;
  destinationScores: Array<{ destination_key: string; score_key: string; score_value: string; score_label: string; methodology_version: string }>;
  neighborhoods: Array<Record<string, unknown>>;
  places: Array<Record<string, unknown>>;
  resources: Array<Record<string, unknown>>;
  media: Array<Record<string, unknown>>;
  destinationAliases?: Array<{ destination_key: string; alias_value: string; canonical?: string; active?: string }>;
}): DeterministicV31ImportPlan => {
  const destinations = input.destinations.map((destination) => ({
    destinationKey: normalizeScalarValue(destination.destination_key) as string,
    slug: normalizeScalarValue(destination.slug || destination.destination_key) as string,
    name: normalizeScalarValue(destination.destination_name) as string,
    city: normalizeScalarValue(destination.city) as string,
    country: normalizeScalarValue(destination.country) as string,
    facts: input.destinationFacts
      .filter((fact) => fact.destination_key === destination.destination_key)
      .map((fact) => ({
        factKey: normalizeScalarValue(fact.fact_key),
        factGroup: normalizeScalarValue(fact.fact_group),
        valueText: normalizeScalarValue(fact.value_text),
        displayLabel: normalizeScalarValue(fact.display_label),
        sourceName: normalizeScalarValue(fact.source_name),
      })),
    scores: input.destinationScores
      .filter((score) => score.destination_key === destination.destination_key)
      .map((score) => ({
        scoreKey: normalizeScalarValue(score.score_key),
        scoreValue: normalizeScalarValue(score.score_value),
        scoreLabel: normalizeScalarValue(score.score_label),
        methodologyVersion: normalizeScalarValue(score.methodology_version),
      })),
  }));

  const aliasMap = new Map<string, string>();
  for (const alias of input.destinationAliases ?? []) {
    if (normalizeCellValue(alias.alias_value) && normalizeCellValue(alias.active ?? "1") === "1") {
      aliasMap.set(normalizeCellValue(alias.alias_value), normalizeCellValue(alias.destination_key));
    }
  }

  const rejectedRows = input.destinationFacts
    .filter((fact) => !input.destinations.some((destination) => destination.destination_key === fact.destination_key))
    .map((fact) => ({
      sheet: "destinationFacts",
      rowNumber: 0,
      reason: `Destination ${fact.destination_key} was not found in the deterministic destination map.`,
    }));

  const resolvedDestinations = destinations.map((destination) => ({
    ...destination,
    slug: aliasMap.get(destination.slug) ?? destination.slug,
  }));

  return {
    destinations: resolvedDestinations,
    rejectedRows,
  };
};

export const resolveDeterministicV31DestinationIdentity = (input: {
  requestedIdentity: string;
  destinations: Array<{ destination_key: string; slug: string }>;
  destinationAliases?: Array<{ destination_key: string; alias_value: string; active?: string }>;
}): DeterministicV31IdentityResolutionResult => {
  const requestedIdentity = normalizeCellValue(input.requestedIdentity);
  if (!requestedIdentity) {
    return { ok: false, error: "EMPTY_IDENTITY" };
  }

  const directMatch = input.destinations.find((destination) => normalizeCellValue(destination.destination_key) === requestedIdentity);
  if (directMatch) {
    return { ok: true, value: directMatch.destination_key };
  }

  const slugMatch = input.destinations.find((destination) => normalizeCellValue(destination.slug) === requestedIdentity);
  if (slugMatch) {
    return { ok: true, value: slugMatch.destination_key };
  }

  const aliasMatch = (input.destinationAliases ?? []).find((alias) => normalizeCellValue(alias.alias_value) === requestedIdentity && normalizeCellValue(alias.active ?? "1") === "1");
  if (aliasMatch) {
    return { ok: true, value: normalizeCellValue(aliasMatch.destination_key) };
  }

  return { ok: false, error: "UNKNOWN_DESTINATION" };
};

export const validateDeterministicV31Contract = (input: {
  metadata: Record<string, string>;
  sheetNames: string[];
  requiredSheets?: string[];
}) => {
  const errors: string[] = [];
  const requiredSheets = input.requiredSheets ?? ["DESTINATIONS", "DESTINATION_FACTS", "DESTINATION_SCORES", "IMPORT_CONTRACT", "PILOT_STATUS", "WORKBOOK_METADATA", "IMPORT_MANIFEST", "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY"];
  requiredSheets.forEach((sheetName) => {
    if (!input.sheetNames.includes(sheetName)) {
      errors.push(`Missing required sheet: ${sheetName}`);
    }
  });
  if (normalizeCellValue(input.metadata.schema_version) !== "3.1") {
    errors.push("schema_version must be 3.1");
  }
  if (normalizeCellValue(input.metadata.architecture) !== "workbook_only_no_fallback") {
    errors.push("architecture must be workbook_only_no_fallback");
  }
  if (normalizeCellValue(input.metadata.primary_identity) !== "destination_key") {
    errors.push("primary_identity must be destination_key");
  }
  return errors;
};

export const validateDeterministicV31CanonicalImportFixture = (fixture: DeterministicV31CanonicalImportFixture) => {
  const errors: string[] = [];
  const knownDestinationKeys = new Set(fixture.destinations.map((destination) => normalizeCellValue(destination.destinationKey)));

  fixture.destinations.forEach((destination) => {
    const destinationKey = normalizeCellValue(destination.destinationKey);

    const childRows = [
      ...(destination.facts ?? []),
      ...(destination.scores ?? []),
      ...(destination.neighborhoods ?? []),
      ...(destination.places ?? []),
      ...(destination.media ?? []),
    ];
    childRows.forEach((row) => {
      const rowDestinationKey = normalizeCellValue((row as Record<string, unknown>).destination_key);
      if (rowDestinationKey && rowDestinationKey !== destinationKey) {
        errors.push(`Row attached to the wrong destination: ${rowDestinationKey} !== ${destinationKey}`);
      }
      if (!rowDestinationKey && !knownDestinationKeys.has(destinationKey)) {
        errors.push(`Missing destination key for row attached to ${destinationKey}`);
      }
      if (rowDestinationKey && !knownDestinationKeys.has(rowDestinationKey)) {
        errors.push(`Unknown destination key ${rowDestinationKey}`);
      }
    });

    const neighborhoodKeys = new Set<string>();
    (destination.neighborhoods ?? []).forEach((row) => {
      const neighborhoodKey = normalizeCellValue((row as Record<string, unknown>).neighborhood_key);
      if (!neighborhoodKey) return;
      if (neighborhoodKeys.has(neighborhoodKey)) {
        errors.push(`Duplicate neighborhood key ${neighborhoodKey}`);
      }
      neighborhoodKeys.add(neighborhoodKey);
    });

    const placeKeys = new Set<string>();
    (destination.places ?? []).forEach((row) => {
      const placeKey = normalizeCellValue((row as Record<string, unknown>).place_key);
      if (!placeKey) return;
      if (placeKeys.has(placeKey)) {
        errors.push(`Duplicate place key ${placeKey}`);
      }
      placeKeys.add(placeKey);
    });

    const placeNeighborhoodKeys = new Set<string>();
    (destination.neighborhoods ?? []).forEach((row) => {
      const neighborhoodKey = normalizeCellValue((row as Record<string, unknown>).neighborhood_key);
      if (neighborhoodKey) {
        placeNeighborhoodKeys.add(neighborhoodKey);
      }
    });
    (destination.places ?? []).forEach((row) => {
      const neighborhoodKey = normalizeCellValue((row as Record<string, unknown>).neighborhood_key);
      if (!neighborhoodKey) return;
      if (!placeNeighborhoodKeys.has(neighborhoodKey)) {
        errors.push(`Place ${normalizeCellValue((row as Record<string, unknown>).place_key)} references unknown neighborhood ${neighborhoodKey}`);
      }
    });

    (destination.aliases ?? []).forEach((row) => {
      const aliasDestinationKey = normalizeCellValue((row as Record<string, unknown>).destination_key);
      if (aliasDestinationKey && !knownDestinationKeys.has(aliasDestinationKey)) {
        errors.push(`Alias targets unknown destination ${aliasDestinationKey}`);
      }
    });
  });

  return errors;
};
