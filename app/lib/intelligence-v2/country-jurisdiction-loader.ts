import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  COUNTRY_JURISDICTION_FACT_HEADERS,
  normalizeCountryCode,
  normalizeEvidenceForLegalStatus,
  validateCountryJurisdictionFact,
  validateCountryJurisdictionRows,
  type ActivityModeGroup,
  type CountryJurisdictionFact,
  type LifeMatchEvidence,
} from "./life-match-fact-contract";

export { validateCountryJurisdictionFact, validateCountryJurisdictionRows };

export const COUNTRY_JURISDICTION_WORKBOOK_PATH = path.resolve(process.cwd(), "data/shared/DestinationFinderAI_COUNTRY_JURISDICTION_FACTS_v1.xlsx");

export interface SharedCountryJurisdictionWorkbook {
  readonly sourcePath: string;
  readonly rowCount: number;
  readonly facts: readonly CountryJurisdictionFact[];
}

export interface CountryJurisdictionWorkbookReadResult {
  readonly sheets: readonly Array<{ name: string; headers: readonly string[]; rows: readonly Record<string, string | number | null>[] }>;
}

export function parseWorkbookCountryJurisdictionRow(raw: Record<string, string | number | null>): CountryJurisdictionFact {
  const evidence: LifeMatchEvidence = {
    sourceUrl: (raw.sourceUrl ?? raw.source_url ?? null) as string | null,
    sourceAuthority: (raw.sourceAuthority ?? raw.source_authority ?? null) as LifeMatchEvidence["sourceAuthority"],
    verifiedAt: (raw.verifiedAt ?? raw.verified_at ?? null) as string | null,
    effectiveAsOf: (raw.effectiveAsOf ?? raw.effective_as_of ?? null) as string | null,
    evidenceStatus: (raw.evidenceStatus ?? raw.evidence_status ?? "RESEARCH_PENDING") as LifeMatchEvidence["evidenceStatus"],
    confidence: (raw.confidence ?? "LOW") as LifeMatchEvidence["confidence"],
    notes: (raw.notes ?? null) as string | null,
  };

  const fact: CountryJurisdictionFact = {
    destinationCountryCode: normalizeCountryCode(String(raw.destinationCountryCode ?? raw.destination_country_code ?? "")),
    travelerPassportCountryCode: normalizeCountryCode(String(raw.travelerPassportCountryCode ?? raw.traveler_passport_country_code ?? "")),
    activityModeGroup: (raw.activityModeGroup ?? raw.activity_mode_group ?? "TOURIST") as ActivityModeGroup,
    stayModeKey: String(raw.stayModeKey ?? raw.stay_mode_key ?? "UNKNOWN"),
    ordinaryVisitorEligibility: (raw.ordinaryVisitorEligibility ?? "UNKNOWN") as CountryJurisdictionFact["ordinaryVisitorEligibility"],
    visaRequired: (raw.visaRequired ?? "UNKNOWN") as CountryJurisdictionFact["visaRequired"],
    maximumVisitorDays: raw.maximumVisitorDays === null || raw.maximumVisitorDays === "" ? null : Number(raw.maximumVisitorDays),
    rollingWindowDays: raw.rollingWindowDays === null || raw.rollingWindowDays === "" ? null : Number(raw.rollingWindowDays),
    extensionAvailability: (raw.extensionAvailability ?? "UNKNOWN") as CountryJurisdictionFact["extensionAvailability"],
    extensionMaximumDays: raw.extensionMaximumDays === null || raw.extensionMaximumDays === "" ? null : Number(raw.extensionMaximumDays),
    longStayResidencyPathwayAvailable: (raw.longStayResidencyPathwayAvailable ?? "UNKNOWN") as CountryJurisdictionFact["longStayResidencyPathwayAvailable"],
    digitalNomadPathwayAvailable: (raw.digitalNomadPathwayAvailable ?? "UNKNOWN") as CountryJurisdictionFact["digitalNomadPathwayAvailable"],
    remoteWorkLegality: (raw.remoteWorkLegality ?? "UNKNOWN") as CountryJurisdictionFact["remoteWorkLegality"],
    localEmploymentAuthorization: (raw.localEmploymentAuthorization ?? "UNKNOWN") as CountryJurisdictionFact["localEmploymentAuthorization"],
    selfEmploymentPathwayAvailable: (raw.selfEmploymentPathwayAvailable ?? "UNKNOWN") as CountryJurisdictionFact["selfEmploymentPathwayAvailable"],
    seasonalSplitYearPathwayAvailable: (raw.seasonalSplitYearPathwayAvailable ?? "UNKNOWN") as CountryJurisdictionFact["seasonalSplitYearPathwayAvailable"],
    retirementResidencyPathwayAvailable: (raw.retirementResidencyPathwayAvailable ?? "UNKNOWN") as CountryJurisdictionFact["retirementResidencyPathwayAvailable"],
    renewalAvailability: (raw.renewalAvailability ?? "UNKNOWN") as CountryJurisdictionFact["renewalAvailability"],
    evidence,
  };

  return normalizeEvidenceForLegalStatus(validateCountryJurisdictionFact(fact));
}

export function readWorkbookRowsFromPython(workbookPath: string): CountryJurisdictionWorkbookReadResult {
  const script = `
import json, sys
from openpyxl import load_workbook
path = sys.argv[1]
try:
    wb = load_workbook(path, read_only=True, data_only=True)
except FileNotFoundError:
    print(json.dumps({"sheets": []}))
    raise SystemExit
sheets = []
for ws in wb.worksheets:
    rows = list(ws.iter_rows(values_only=True))
    headers = []
    data = []
    if rows:
        headers = [str(cell) if cell is not None else "" for cell in rows[0]]
        for row in rows[1:]:
            item = {}
            for idx, header in enumerate(headers):
                if idx < len(row):
                    item[header] = row[idx]
            if item:
                data.append(item)
    sheets.append({"name": ws.title, "headers": headers, "rows": data})
print(json.dumps({"sheets": sheets}))
`;

  const result = spawnSync("python3", ["-c", script, workbookPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const message = result.stderr ? result.stderr.trim() : "unknown error";
    throw new Error(`Unable to read workbook rows: ${message}`);
  }

  const payload = JSON.parse(result.stdout || '{"sheets":[]}');
  return payload;
}

export async function loadSharedCountryJurisdictionWorkbook(): Promise<SharedCountryJurisdictionWorkbook> {
  const workbook = readWorkbookRowsFromPython(COUNTRY_JURISDICTION_WORKBOOK_PATH);
  const facts = (workbook.sheets ?? [])
    .flatMap((sheet) => sheet.rows ?? [])
    .filter((row) => {
      const keys = Object.keys(row);
      return keys.some((key) => COUNTRY_JURISDICTION_FACT_HEADERS.includes(key as (typeof COUNTRY_JURISDICTION_FACT_HEADERS)[number]));
    })
    .map((row) => parseWorkbookCountryJurisdictionRow(row));

  const validated = validateCountryJurisdictionRows(facts);
  return {
    sourcePath: COUNTRY_JURISDICTION_WORKBOOK_PATH,
    rowCount: validated.length,
    facts: validated,
  };
}

export async function lookupCountryJurisdictionFact(input: {
  destinationCountryCode: string;
  travelerPassportCountryCode: string;
  activityModeGroup: ActivityModeGroup;
  stayModeKey: string;
}): Promise<
  | { kind: "FOUND"; fact: CountryJurisdictionFact }
  | { kind: "UNKNOWN"; destinationCountryCode: string; travelerPassportCountryCode: string; activityModeGroup: ActivityModeGroup; stayModeKey: string }
  | { kind: "UNSUPPORTED_PASSPORT"; destinationCountryCode: string; travelerPassportCountryCode: string; activityModeGroup: ActivityModeGroup; stayModeKey: string }
> {
  const destinationCountryCode = normalizeCountryCode(input.destinationCountryCode);
  const travelerPassportCountryCode = normalizeCountryCode(input.travelerPassportCountryCode);

  const supportedPassports = new Set([
    "US", "CA", "MX", "GB", "DE", "FR", "ES", "IT", "NL", "SE", "NO", "DK", "FI", "PT", "IE",
    "IS", "CH", "AT", "BE", "PL", "CZ", "SK", "HU", "RO", "GR", "HR", "SI", "EE", "LV", "LT",
    "LU", "AU", "NZ", "JP", "KR", "SG", "MY", "TH", "PH", "ID", "VN", "IN", "BR", "AR", "CL",
    "UY", "PE", "EC", "CR", "PA", "GT", "DO", "PR", "ZA", "AE", "TR",
  ]);

  if (!supportedPassports.has(travelerPassportCountryCode)) {
    return {
      kind: "UNSUPPORTED_PASSPORT",
      destinationCountryCode,
      travelerPassportCountryCode,
      activityModeGroup: input.activityModeGroup,
      stayModeKey: input.stayModeKey,
    };
  }

  const workbook = await loadSharedCountryJurisdictionWorkbook();
  const match = workbook.facts.find((fact) => {
    return (
      fact.destinationCountryCode === destinationCountryCode &&
      fact.travelerPassportCountryCode === travelerPassportCountryCode &&
      fact.activityModeGroup === input.activityModeGroup &&
      fact.stayModeKey === input.stayModeKey
    );
  });

  if (!match) {
    return {
      kind: "UNKNOWN",
      destinationCountryCode,
      travelerPassportCountryCode,
      activityModeGroup: input.activityModeGroup,
      stayModeKey: input.stayModeKey,
    };
  }

  return { kind: "FOUND", fact: match };
}
