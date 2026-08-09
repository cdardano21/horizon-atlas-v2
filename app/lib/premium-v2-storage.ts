export type PremiumV2ModuleDefinition = {
  moduleKey: string;
  storageTable: string;
  description: string;
  destinationScoped: boolean;
  supportsMultipleRows: boolean;
  futureReady: boolean;
};

export type PremiumV2StoragePlan = PremiumV2ModuleDefinition & {
  destinationLinkField: "destination_id";
  destinationKeyField: "destination_key";
  rowIdentityField: "row_key" | "destination_id";
  uniqueKey: string;
  upsertStrategy: "insert-or-update-by-unique-constraint";
  deletionProtection: "never-delete-missing-rows";
};

export type PremiumV2ScopedRecord = {
  moduleKey: string;
  destinationId: string;
  destinationKey: string;
  rowKey: string;
  value?: string;
};

export function getPremiumV2RuntimeModuleDefinitions(): PremiumV2ModuleDefinition[] {
  return [
    {
      moduleKey: "destinations",
      storageTable: "premium_destination_profiles",
      description: "Canonical destination-level Premium profile data",
      destinationScoped: true,
      supportsMultipleRows: false,
      futureReady: true,
    },
    {
      moduleKey: "destination_facts",
      storageTable: "premium_destination_facts",
      description: "Structured destination facts and evidence",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "destination_scores",
      storageTable: "premium_destination_scores",
      description: "Dimension-based score rows mapped from workbook score dimensions",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "neighborhoods",
      storageTable: "premium_neighborhoods",
      description: "Neighborhood records and premium attributes",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "places",
      storageTable: "premium_places",
      description: "Destination place records and structured metadata",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "resources",
      storageTable: "premium_resources",
      description: "Destination resource and link records",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "media",
      storageTable: "premium_media",
      description: "Destination media assets and gallery content",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "cost_of_living",
      storageTable: "premium_cost_of_living",
      description: "Structured cost-of-living categories and ranges",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "climate_monthly",
      storageTable: "premium_climate_monthly",
      description: "Per-month climate entries",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "housing_property",
      storageTable: "premium_housing_property",
      description: "Housing and property context",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "property_resources",
      storageTable: "premium_property_resources",
      description: "Property-related links and resources",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "healthcare_insurance",
      storageTable: "premium_healthcare_insurance",
      description: "Healthcare and insurance context",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "visa_residency",
      storageTable: "premium_visa_residency",
      description: "Visa and residency information",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "taxes_finance",
      storageTable: "premium_taxes_finance",
      description: "Tax and finance guidance",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "safety_risks",
      storageTable: "premium_safety_risks",
      description: "Safety and risk notes",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "transport_airports",
      storageTable: "premium_transport_airports",
      description: "Transport and airport data",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "connectivity_remote_work",
      storageTable: "premium_connectivity_remote_work",
      description: "Remote work connectivity context",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "reality_check",
      storageTable: "premium_reality_check",
      description: "Reality check facts and cautions",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
    {
      moduleKey: "sources",
      storageTable: "premium_sources",
      description: "Source attribution and provenance rows",
      destinationScoped: true,
      supportsMultipleRows: true,
      futureReady: true,
    },
  ];
}

export function getPremiumV2StoragePlans(): PremiumV2StoragePlan[] {
  return getPremiumV2RuntimeModuleDefinitions().map((module) => ({
    ...module,
    destinationLinkField: "destination_id",
    destinationKeyField: "destination_key",
    rowIdentityField: module.supportsMultipleRows ? "row_key" : "destination_id",
    uniqueKey: module.supportsMultipleRows
      ? "(destination_id, destination_key, row_key)"
      : "(destination_id, destination_key)",
    upsertStrategy: "insert-or-update-by-unique-constraint",
    deletionProtection: "never-delete-missing-rows",
  }));
}

export function getPremiumV2StoragePlan(moduleKey: string): PremiumV2StoragePlan | undefined {
  return getPremiumV2StoragePlans().find((plan) => plan.moduleKey === moduleKey);
}

export function buildPremiumV2DestinationScopedKey({
  moduleKey,
  destinationId,
  destinationKey,
  rowKey,
}: {
  moduleKey: string;
  destinationId: string;
  destinationKey: string;
  rowKey: string;
}): string {
  return [moduleKey, destinationId, destinationKey, rowKey].join(":");
}

export function applyPremiumV2DestinationScopedRows<T extends PremiumV2ScopedRecord>({
  existingRecords,
  incomingRecords,
  allowedDestinationIds,
}: {
  existingRecords: T[];
  incomingRecords: T[];
  allowedDestinationIds: Set<string>;
}): T[] {
  const nextRecords: T[] = [];
  const seen = new Set<string>();

  for (const incomingRecord of incomingRecords) {
    const association = assertPremiumV2DestinationAssociation({
      destinationId: incomingRecord.destinationId,
      destinationKey: incomingRecord.destinationKey,
      allowedDestinationIds,
    });

    if (!association.allowed) {
      continue;
    }

    const identity = buildPremiumV2DestinationScopedKey({
      moduleKey: incomingRecord.moduleKey,
      destinationId: incomingRecord.destinationId,
      destinationKey: incomingRecord.destinationKey,
      rowKey: incomingRecord.rowKey,
    });

    if (!seen.has(identity)) {
      nextRecords.push(incomingRecord);
      seen.add(identity);
    }
  }

  for (const existingRecord of existingRecords) {
    const association = assertPremiumV2DestinationAssociation({
      destinationId: existingRecord.destinationId,
      destinationKey: existingRecord.destinationKey,
      allowedDestinationIds,
    });

    if (!association.allowed) {
      continue;
    }

    const identity = buildPremiumV2DestinationScopedKey({
      moduleKey: existingRecord.moduleKey,
      destinationId: existingRecord.destinationId,
      destinationKey: existingRecord.destinationKey,
      rowKey: existingRecord.rowKey,
    });

    if (!seen.has(identity)) {
      nextRecords.push(existingRecord);
      seen.add(identity);
    }
  }

  return nextRecords;
}

export function assertPremiumV2DestinationAssociation({
  destinationId,
  destinationKey,
  allowedDestinationIds,
}: {
  destinationId: string;
  destinationKey?: string | null;
  allowedDestinationIds: Set<string>;
}): { allowed: true } | { allowed: false; reason: string } {
  if (!destinationId) {
    return { allowed: false, reason: "destination_id is required" };
  }

  if (!allowedDestinationIds.has(destinationId)) {
    return { allowed: false, reason: "destination_id is not linked to the permitted destination set" };
  }

  if (destinationKey && destinationKey.trim() === "") {
    return { allowed: false, reason: "destination_key cannot be blank" };
  }

  return { allowed: true };
}
