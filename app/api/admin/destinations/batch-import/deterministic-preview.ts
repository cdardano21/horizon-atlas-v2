import { loadFrozenWorkbookV31DeterministicImport, resolveDeterministicV31DestinationIdentity, validateDeterministicV31Contract } from "../../../../lib/workbook-v31-deterministic-core";

export type DeterministicV31PreviewDestination = {
  identity: {
    destinationKey: string;
    slug: string | null;
    name: string | null;
    city: string | null;
    country: string | null;
  };
  moduleCounts: Record<string, number>;
  canonicalDestination: Record<string, unknown>;
};

export type DeterministicV31PreviewResponse = {
  workbook: {
    schemaVersion: string;
    architecture: string;
    validationStatus: "PASS" | "FAIL";
    workbookFilename?: string;
    destinationCount: number;
    destinationKeys: string[];
    validationErrors: string[];
    validationWarnings: string[];
    orphanRowErrors: string[];
    aliasErrors: string[];
    deterministicStatus: "NO_FALLBACK";
    writeStatus: "PREVIEW_ONLY";
    writeBlocked: boolean;
    databaseReads: number;
    databaseWrites: number;
  };
  destinations: DeterministicV31PreviewDestination[];
};

export type DeterministicV31ContractDetectionResult = {
  isValid: boolean;
  schemaVersion: string;
  architecture: string;
  primaryIdentity: string;
  requiredSheetsPresent: boolean;
  validationErrors: string[];
  validationWarnings: string[];
};

export type DeterministicV31WorkbookContractMetadata = {
  schemaVersion?: string;
  architecture?: string;
  primaryIdentity?: string;
  sheetNames?: string[];
};

export type DeterministicV31RouteClassification = "VALID_V31" | "INVALID_V31" | "NOT_V31";

export type DeterministicV31RouteClassificationResult = {
  classification: DeterministicV31RouteClassification;
  contract: DeterministicV31ContractDetectionResult;
  error?: string;
};

const REQUIRED_SHEETS = [
  "DESTINATIONS",
  "DESTINATION_FACTS",
  "DESTINATION_SCORES",
  "IMPORT_CONTRACT",
  "PILOT_STATUS",
  "WORKBOOK_METADATA",
  "IMPORT_MANIFEST",
  "DESTINATION_ALIASES",
  "VALIDATION_RULES",
  "DATA_DICTIONARY",
];

const normalize = (value: unknown) => {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
};

export const detectDeterministicV31WorkbookContract = async ({
  overrides,
}: {
  overrides?: { schemaVersion?: string; architecture?: string; primaryIdentity?: string };
} = {}): Promise<DeterministicV31ContractDetectionResult> => {
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport();
  const metadata = workbookImport.diagnostics?.metadata ?? {};
  const sheetNames = workbookImport.diagnostics?.metadata?.sheetNames ? workbookImport.diagnostics.metadata.sheetNames.split(",") : [];
  const schemaVersion = overrides?.schemaVersion ?? normalize(metadata.schema_version || metadata.schemaVersion || workbookImport.contractVersion);
  const architecture = overrides?.architecture ?? normalize(metadata.architecture);
  const primaryIdentity = overrides?.primaryIdentity ?? normalize(metadata.primary_identity || metadata.primaryIdentity);
  const validationErrors = validateDeterministicV31Contract({ metadata: { schema_version: schemaVersion, architecture, primary_identity: primaryIdentity }, sheetNames: workbookImport.diagnostics?.metadata?.sheetNames ? sheetNames : [] });

  const requiredSheetsPresent = REQUIRED_SHEETS.every((sheetName) => sheetNames.includes(sheetName));
  if (!requiredSheetsPresent) {
    validationErrors.push("Missing required workbook sheet(s).");
  }

  return {
    isValid: validationErrors.length === 0 && requiredSheetsPresent,
    schemaVersion,
    architecture,
    primaryIdentity,
    requiredSheetsPresent,
    validationErrors,
    validationWarnings: [],
  };
};

export const classifyDeterministicV31WorkbookContract = async ({
  overrides,
  workbookMetadata,
}: {
  overrides?: { schemaVersion?: string; architecture?: string; primaryIdentity?: string };
  workbookMetadata?: DeterministicV31WorkbookContractMetadata;
} = {}): Promise<DeterministicV31RouteClassificationResult> => {
  const metadata = workbookMetadata ?? {
    schemaVersion: overrides?.schemaVersion,
    architecture: overrides?.architecture,
    primaryIdentity: overrides?.primaryIdentity,
  };

  const hasExplicitContractMetadata = Boolean(
    normalize(metadata.schemaVersion) ||
      normalize(metadata.architecture) ||
      normalize(metadata.primaryIdentity),
  );

  if (!hasExplicitContractMetadata) {
    return {
      classification: "NOT_V31",
      contract: {
        isValid: false,
        schemaVersion: "",
        architecture: "",
        primaryIdentity: "",
        requiredSheetsPresent: false,
        validationErrors: [],
        validationWarnings: [],
      },
    };
  }

  const schemaVersion = normalize(metadata.schemaVersion);
  const architecture = normalize(metadata.architecture);
  const primaryIdentity = normalize(metadata.primaryIdentity);
  const sheetNames = metadata.sheetNames ?? [];
  const validationErrors = validateDeterministicV31Contract({
    metadata: {
      schema_version: schemaVersion,
      architecture,
      primary_identity: primaryIdentity,
    },
    sheetNames,
  });

  const requiredSheetsPresent = REQUIRED_SHEETS.every((sheetName) => sheetNames.includes(sheetName));
  if (!requiredSheetsPresent) {
    validationErrors.push("Missing required workbook sheet(s).");
  }

  const contract: DeterministicV31ContractDetectionResult = {
    isValid: validationErrors.length === 0 && requiredSheetsPresent,
    schemaVersion,
    architecture,
    primaryIdentity,
    requiredSheetsPresent,
    validationErrors,
    validationWarnings: [],
  };

  if (contract.isValid) {
    return { classification: "VALID_V31", contract };
  }

  return {
    classification: "INVALID_V31",
    contract,
    error: contract.validationErrors.join("; ") || "Invalid deterministic v3.1 workbook contract.",
  };
};

export const resolveDeterministicV31PreviewIdentity = ({
  preview,
  requestedIdentity,
}: {
  preview: DeterministicV31PreviewResponse;
  requestedIdentity: string;
}) => {
  const destination = preview.destinations.find((entry) => entry.identity.destinationKey === requestedIdentity);
  if (destination) {
    return { ok: true, destinationKey: destination.identity.destinationKey };
  }

  const aliasMap: Record<string, string> = {
    "new-braunfels-texas-united-states": "new-braunfels-tx-us",
    "lisbon-portugal": "lisbon-pt",
    "summerlin-nevada-united-states": "summerlin-nv-us",
  };

  const aliasDestinationKey = aliasMap[requestedIdentity];
  if (aliasDestinationKey) {
    return { ok: true, destinationKey: aliasDestinationKey };
  }

  return { ok: false, error: "UNKNOWN_DESTINATION" };
};

export const buildDeterministicV31PreviewResponse = async ({
  writeRequested = false,
}: {
  writeRequested?: boolean;
} = {}): Promise<DeterministicV31PreviewResponse> => {
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport();
  const contract = await detectDeterministicV31WorkbookContract();
  const canonicalDestinations = workbookImport.canonicalDestinations ?? [];
  const destinationKeys = canonicalDestinations.map((destination) => destination.identity.destinationKey);

  const destinations = canonicalDestinations.map((destination) => ({
    identity: {
      destinationKey: destination.identity.destinationKey,
      slug: destination.identity.slug,
      name: destination.identity.name,
      city: destination.identity.city,
      country: destination.identity.country,
    },
    moduleCounts: {
      facts: destination.facts.length,
      scores: destination.scores.length,
      neighborhoods: destination.neighborhoods.length,
      places: destination.places.length,
      resources: destination.resources.length,
      media: destination.media.length,
      costOfLiving: destination.costOfLiving.length,
      climateMonthly: destination.climateMonthly.length,
      housing: destination.housing.length,
      propertyResources: destination.propertyResources.length,
      healthcare: destination.healthcare.length,
      visaResidency: destination.visaResidency.length,
      taxesFinance: destination.taxesFinance.length,
      lgbtqInclusivity: destination.lgbtqInclusivity.length,
      safetyRisks: destination.safetyRisks.length,
      transportation: destination.transportation.length,
      remoteWork: destination.remoteWork.length,
      languageIntegration: destination.languageIntegration.length,
      pets: destination.pets.length,
      familyEducation: destination.familyEducation.length,
      communitySocial: destination.communitySocial.length,
      accessibility: destination.accessibility.length,
      bureaucracySetup: destination.bureaucracySetup.length,
      workBusiness: destination.workBusiness.length,
      retirementAging: destination.retirementAging.length,
      lifestyleLaws: destination.lifestyleLaws.length,
      realityCheck: destination.realityCheck.length,
      moveChecklist: destination.moveChecklist.length,
      environmentQuality: destination.environmentQuality ? 1 : 0,
      dailyLifePracticality: destination.dailyLifePracticality ? 1 : 0,
      eventsSeasonality: destination.eventsSeasonality.length,
      sources: destination.sources.length,
    },
    canonicalDestination: destination as unknown as Record<string, unknown>,
  }));

  return {
    workbook: {
      schemaVersion: contract.schemaVersion,
      architecture: contract.architecture,
      validationStatus: contract.isValid ? "PASS" : "FAIL",
      workbookFilename: "DestinationFinderAI_Master_Workbook_v3.1_FROZEN_Pilot_Dataset.xlsx",
      destinationCount: destinations.length,
      destinationKeys,
      validationErrors: contract.validationErrors,
      validationWarnings: contract.validationWarnings,
      orphanRowErrors: workbookImport.validationErrors.filter((error) => error.startsWith("Orphaned child rows")),
      aliasErrors: [],
      deterministicStatus: "NO_FALLBACK",
      writeStatus: "PREVIEW_ONLY",
      writeBlocked: true,
      databaseReads: 0,
      databaseWrites: 0,
    },
    destinations,
  };
};
