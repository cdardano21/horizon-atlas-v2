import { describe, expect, it } from "vitest";
import { buildBatchImportPlan, buildDestinationUpdatePayload, buildImportSummary } from "./processor";

describe("batch import processor", () => {
  it("creates new rows when no match exists and updates existing rows otherwise", () => {
    const rows = [
      { city: "Paris", country: "France", slug: "paris-france" },
      { city: "Rome", country: "Italy", slug: "rome-italy" },
    ];

    const existingDestinations = [{ id: "dest-1", slug: "rome-italy", city: "Rome", country: "Italy" }];
    const plan = buildBatchImportPlan({ rows, existingDestinations, mode: "create_or_update", matchField: "slug" });

    expect(plan).toHaveLength(2);
    expect(plan[0]).toMatchObject({ action: "create", city: "Paris", country: "France" });
    expect(plan[1]).toMatchObject({ action: "update", existingId: "dest-1", existingSlug: "rome-italy" });
  });

  it("rejects rows without city or country", () => {
    const rows = [{ city: "", country: "", slug: "blank" }];
    const plan = buildBatchImportPlan({ rows, existingDestinations: [], mode: "create_or_update", matchField: "slug" });

    expect(plan[0]).toMatchObject({ action: "reject", reason: "City and country are required." });
  });

  it("honors explicit row-level match instructions", () => {
    const rows = [
      { city: "Chicago", country: "United States", slug: "chicago", match: "update" },
      { city: "Testville", country: "Testland", slug: "testville", match: "create" },
      { city: "", country: "", slug: "invalid", match: "update" },
    ];

    const existingDestinations = [{ id: "dest-1", slug: "chicago", city: "Chicago", country: "United States" }];
    const plan = buildBatchImportPlan({ rows, existingDestinations, mode: "create_or_update", matchField: "slug" });

    expect(plan[0]).toMatchObject({ action: "update", existingId: "dest-1" });
    expect(plan[1]).toMatchObject({ action: "create" });
    expect(plan[2]).toMatchObject({ action: "reject", reason: "City and country are required." });
  });

  it("falls back to city and country when the stored slug differs", () => {
    const rows = [
      { city: "Chicago", country: "United States", slug: "chicago", destination_name: "Chicago", match: "update" },
      { city: "Testville", country: "Testland", slug: "testville", match: "create" },
      { city: "", country: "", slug: "invalid", match: "update" },
    ];

    const existingDestinations = [{ id: "dest-1", slug: "chicago-illinois-united-states", city: "Chicago", country: "United States" }];
    const plan = buildBatchImportPlan({ rows, existingDestinations, mode: "create_or_update", matchField: "slug" });

    expect(plan[0]).toMatchObject({ action: "update", existingId: "dest-1" });
    expect(plan[1]).toMatchObject({ action: "create" });
    expect(plan[2]).toMatchObject({ action: "reject", reason: "City and country are required." });
  });

  it("defaults newly created imports to published when no status is provided", () => {
    const rows = [{ city: "San Francisco", country: "United States", slug: "san-francisco" }];
    const plan = buildBatchImportPlan({ rows, existingDestinations: [], mode: "create_or_update", matchField: "slug" });

    expect(plan[0]).toMatchObject({ action: "create", status: "published" });
  });

  it("builds an update payload for an existing destination", () => {
    const result = buildDestinationUpdatePayload({
      existingDestination: { id: "dest-1", slug: "rome-italy", city: "Rome", country: "Italy" },
      row: {
        rowNumber: 2,
        action: "update",
        slug: "rome-italy",
        city: "Rome",
        country: "Italy",
        status: "published",
        tier: "premium",
        description: "Updated description",
        overview: "Updated overview",
      },
    });

    expect(result.updates).toMatchObject({ city: "Rome", country: "Italy", status: "published", tier: "premium" });
  });

  it("uses enriched description and overview values when building update payloads", () => {
    const result = buildDestinationUpdatePayload({
      existingDestination: { id: "dest-1", slug: "spearfish-south-dakota", city: "Spearfish", country: "United States" },
      row: {
        rowNumber: 2,
        action: "update",
        slug: "spearfish-south-dakota",
        city: "Spearfish",
        country: "United States",
        status: "published",
        tier: "premium",
        description: "",
        overview: "",
      },
      description: "Premium imported description for Spearfish.",
      overview: "Premium imported overview for Spearfish.",
    });

    expect(result.updates).toEqual(expect.objectContaining({
      description: "Premium imported description for Spearfish.",
      overview: "Premium imported overview for Spearfish.",
    }));
  });

  it("avoids slug conflicts while still persisting metadata on updates", () => {
    const result = buildDestinationUpdatePayload({
      existingDestination: { id: "dest-1", slug: "spearfish-sd-usa", city: "Spearfish", country: "United States" },
      existingDestinations: [{ id: "dest-2", slug: "spearfish-south-dakota-united-states", city: "Spearfish", country: "United States" }],
      row: {
        rowNumber: 2,
        action: "update",
        slug: "spearfish-south-dakota-united-states",
        city: "Spearfish",
        country: "United States",
        status: "published",
        tier: "premium",
        description: "Updated description",
        overview: "Updated overview",
      },
      metadata: {
        editorialContent: { heroNarrative: "Premium narrative" },
      },
      description: "Premium imported description for Spearfish.",
      overview: "Premium imported overview for Spearfish.",
    });

    expect(result.updates).not.toHaveProperty("slug");
    expect(result.updates).toEqual(expect.objectContaining({
      description: "Premium imported description for Spearfish.",
      overview: "Premium imported overview for Spearfish.",
      metadata: expect.objectContaining({
        editorialContent: expect.objectContaining({ heroNarrative: "Premium narrative" }),
      }),
    }));
  });

  it("skips blank values and respects selected columns for updates", () => {
    const rows = [{ city: "Chicago", country: "United States", slug: "chicago", description: "", overview: "Updated overview", match: "update" }];
    const existingDestinations = [{ id: "dest-1", slug: "chicago-illinois-united-states", city: "Chicago", country: "United States", description: "Old description", overview: "Old overview" }];
    const plan = buildBatchImportPlan({
      rows,
      existingDestinations,
      mode: "create_or_update",
      matchField: "slug",
      selectedColumns: ["description"],
      allowBlankClears: false,
    });

    expect(plan[0]).toMatchObject({ action: "update" });
    expect(plan[0].fieldChanges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "description", changed: false }),
      ]),
    );
    expect(plan[0].fieldChanges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "overview", changed: false }),
      ]),
    );
  });

  it("preserves existing values when the incoming row leaves a field blank", () => {
    const rows = [{ city: "Chicago", country: "United States", slug: "chicago", description: "", overview: "", match: "update" }];
    const existingDestinations = [{ id: "dest-1", slug: "chicago", city: "Chicago", country: "United States", description: "Old description", overview: "Old overview" }];
    const plan = buildBatchImportPlan({ rows, existingDestinations, mode: "create_or_update", matchField: "slug", selectedColumns: ["description", "overview"], allowBlankClears: false });

    expect(plan[0]).toMatchObject({ action: "update" });
    expect(plan[0].fieldChanges).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "description", changed: false }),
      expect.objectContaining({ field: "overview", changed: false }),
    ]));
  });

  it("builds a summary with create update reject skip warning and error counts", () => {
    const plan = [
      { action: "create" as const, rowNumber: 2, slug: "one", city: "One", country: "Country", warnings: ["blank value skipped"], errors: [] },
      { action: "update" as const, rowNumber: 3, slug: "two", city: "Two", country: "Country", warnings: [], errors: [] },
      { action: "reject" as const, rowNumber: 4, slug: "three", city: "Three", country: "Country", warnings: [], errors: ["missing city"] },
      { action: "skip" as const, rowNumber: 5, slug: "four", city: "Four", country: "Country", warnings: [], errors: [] },
    ];

    const summary = buildImportSummary({ plan, totalRows: 4 });

    expect(summary).toMatchObject({ totalRows: 4, create: 1, update: 1, reject: 1, skip: 1, warnings: 1, errors: 1 });
  });
});
