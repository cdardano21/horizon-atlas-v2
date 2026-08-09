import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyPremiumV2DestinationScopedRows,
  assertPremiumV2DestinationAssociation,
  getPremiumV2RuntimeModuleDefinitions,
  getPremiumV2StoragePlan,
  getPremiumV2StoragePlans,
} from "./premium-v2-storage";

describe("premium v2 storage architecture", () => {
  it("maps the core runtime modules to additive storage tables", () => {
    const definitions = getPremiumV2RuntimeModuleDefinitions();

    expect(definitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ moduleKey: "destinations", storageTable: "premium_destination_profiles" }),
        expect.objectContaining({ moduleKey: "destination_facts", storageTable: "premium_destination_facts" }),
        expect.objectContaining({ moduleKey: "destination_scores", storageTable: "premium_destination_scores" }),
        expect.objectContaining({ moduleKey: "neighborhoods", storageTable: "premium_neighborhoods" }),
        expect.objectContaining({ moduleKey: "places", storageTable: "premium_places" }),
        expect.objectContaining({ moduleKey: "resources", storageTable: "premium_resources" }),
        expect.objectContaining({ moduleKey: "media", storageTable: "premium_media" }),
        expect.objectContaining({ moduleKey: "cost_of_living", storageTable: "premium_cost_of_living" }),
        expect.objectContaining({ moduleKey: "climate_monthly", storageTable: "premium_climate_monthly" }),
        expect.objectContaining({ moduleKey: "housing_property", storageTable: "premium_housing_property" }),
        expect.objectContaining({ moduleKey: "property_resources", storageTable: "premium_property_resources" }),
        expect.objectContaining({ moduleKey: "healthcare_insurance", storageTable: "premium_healthcare_insurance" }),
        expect.objectContaining({ moduleKey: "visa_residency", storageTable: "premium_visa_residency" }),
        expect.objectContaining({ moduleKey: "taxes_finance", storageTable: "premium_taxes_finance" }),
        expect.objectContaining({ moduleKey: "safety_risks", storageTable: "premium_safety_risks" }),
        expect.objectContaining({ moduleKey: "transport_airports", storageTable: "premium_transport_airports" }),
        expect.objectContaining({ moduleKey: "connectivity_remote_work", storageTable: "premium_connectivity_remote_work" }),
        expect.objectContaining({ moduleKey: "reality_check", storageTable: "premium_reality_check" }),
        expect.objectContaining({ moduleKey: "sources", storageTable: "premium_sources" }),
      ]),
    );
  });

  it("scopes premium rows to the intended destination without relying on names", () => {
    const allowedDestinationIds = new Set(["11111111-1111-1111-1111-111111111111"]);

    expect(
      assertPremiumV2DestinationAssociation({
        destinationId: "11111111-1111-1111-1111-111111111111",
        destinationKey: "new-braunfels-tx-us",
        allowedDestinationIds,
      }),
    ).toEqual({ allowed: true });

    expect(
      assertPremiumV2DestinationAssociation({
        destinationId: "22222222-2222-2222-2222-222222222222",
        destinationKey: "lisbon-pt",
        allowedDestinationIds,
      }),
    ).toEqual({
      allowed: false,
      reason: "destination_id is not linked to the permitted destination set",
    });
  });

  it("includes the additive premium storage migration in the schema assets", () => {
    const migrationPath = path.join(process.cwd(), "supabase/migrations/20260807120000_premium_v2_storage.sql");
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("create table if not exists public.premium_destination_profiles");
    expect(sql).toContain("create table if not exists public.premium_destination_facts");
    expect(sql).toContain("create table if not exists public.premium_neighborhoods");
    expect(sql).toContain("create table if not exists public.premium_places");
    expect(sql).toContain("create table if not exists public.premium_sources");
    expect(sql).toContain("create index if not exists idx_premium_destination_profiles_destination");
    expect(sql).toContain("create index if not exists idx_premium_places_destination");
    expect(sql).toContain("no destructive delete");
  });

  it("creates storage plans for each core module with destination-scoped keys", () => {
    const plans = getPremiumV2StoragePlans();
    const neighborhoods = getPremiumV2StoragePlan("neighborhoods");
    const media = getPremiumV2StoragePlan("media");

    expect(plans.length).toBeGreaterThan(15);
    expect(neighborhoods).toEqual(
      expect.objectContaining({
        moduleKey: "neighborhoods",
        destinationLinkField: "destination_id",
        destinationKeyField: "destination_key",
        uniqueKey: "(destination_id, destination_key, row_key)",
        deletionProtection: "never-delete-missing-rows",
      }),
    );
    expect(media).toEqual(
      expect.objectContaining({
        moduleKey: "media",
        uniqueKey: "(destination_id, destination_key, row_key)",
      }),
    );
  });

  it("preserves unrelated destinations when merging destination-scoped rows", () => {
    const existingRecords = [
      {
        moduleKey: "places",
        destinationId: "11111111-1111-1111-1111-111111111111",
        destinationKey: "new-braunfels-tx-us",
        rowKey: "place-1",
        value: "keep-me",
      },
    ];

    const incomingRecords = [
      {
        moduleKey: "places",
        destinationId: "22222222-2222-2222-2222-222222222222",
        destinationKey: "lisbon-pt",
        rowKey: "place-2",
        value: "new-entry",
      },
    ];

    const merged = applyPremiumV2DestinationScopedRows({
      existingRecords,
      incomingRecords,
      allowedDestinationIds: new Set(["11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222"]),
    });

    expect(merged).toHaveLength(2);
    expect(merged).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ destinationKey: "new-braunfels-tx-us" }),
        expect.objectContaining({ destinationKey: "lisbon-pt" }),
      ]),
    );
  });
});
