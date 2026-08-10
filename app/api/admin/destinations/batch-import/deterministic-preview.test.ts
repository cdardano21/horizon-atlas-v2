import { describe, expect, it } from "vitest";
import { buildDeterministicV31CanonicalDestination, type DeterministicV31CanonicalDestination } from "../../../../lib/workbook-v31-deterministic-core";
import { buildDeterministicV31PreviewResponse, detectDeterministicV31WorkbookContract, resolveDeterministicV31PreviewIdentity, type DeterministicV31PreviewResponse } from "./deterministic-preview";

describe("deterministic v3.1 preview adapter", () => {
  it("detects the frozen workbook as a valid deterministic v3.1 contract", async () => {
    const contract = await detectDeterministicV31WorkbookContract();

    expect(contract.isValid).toBe(true);
    expect(contract.schemaVersion).toBe("3.1");
    expect(contract.architecture).toBe("workbook_only_no_fallback");
    expect(contract.primaryIdentity).toBe("destination_key");
    expect(contract.requiredSheetsPresent).toBe(true);
  });

  it("builds a three-pilot preview with expected module counts and preview-only write status", async () => {
    const preview = await buildDeterministicV31PreviewResponse();

    expect(preview.workbook.validationStatus).toBe("PASS");
    expect(preview.workbook.destinationCount).toBe(3);
    expect(preview.destinations.map((destination) => destination.identity.destinationKey)).toEqual([
      "new-braunfels-tx-us",
      "lisbon-pt",
      "summerlin-nv-us",
    ]);

    const newBraunfels = preview.destinations.find((destination) => destination.identity.destinationKey === "new-braunfels-tx-us");
    const lisbon = preview.destinations.find((destination) => destination.identity.destinationKey === "lisbon-pt");
    const summerlin = preview.destinations.find((destination) => destination.identity.destinationKey === "summerlin-nv-us");

    expect(newBraunfels?.moduleCounts.neighborhoods).toBe(8);
    expect(newBraunfels?.moduleCounts.climateMonthly).toBe(12);
    expect(newBraunfels?.moduleCounts.moveChecklist).toBe(10);
    expect(newBraunfels?.moduleCounts.media).toBe(5);

    expect(lisbon?.moduleCounts.neighborhoods).toBe(8);
    expect(lisbon?.moduleCounts.climateMonthly).toBe(12);
    expect(lisbon?.moduleCounts.moveChecklist).toBe(10);
    expect(lisbon?.moduleCounts.media).toBe(3);

    expect(summerlin?.moduleCounts.neighborhoods).toBe(8);
    expect(summerlin?.moduleCounts.climateMonthly).toBe(12);
    expect(summerlin?.moduleCounts.moveChecklist).toBe(10);
    expect(summerlin?.moduleCounts.media).toBe(3);

    expect(preview.workbook.writeStatus).toBe("PREVIEW_ONLY");
    expect(preview.workbook.databaseReads).toBe(0);
    expect(preview.workbook.databaseWrites).toBe(0);
  });

  it("resolves explicit aliases and blocks unknown identities without fuzzy recovery", async () => {
    const preview = await buildDeterministicV31PreviewResponse();

    expect(resolveDeterministicV31PreviewIdentity({ preview, requestedIdentity: "new-braunfels-texas-united-states" })).toEqual({ ok: true, destinationKey: "new-braunfels-tx-us" });
    expect(resolveDeterministicV31PreviewIdentity({ preview, requestedIdentity: "lisbon-portugal" })).toEqual({ ok: true, destinationKey: "lisbon-pt" });
    expect(resolveDeterministicV31PreviewIdentity({ preview, requestedIdentity: "summerlin-nevada-united-states" })).toEqual({ ok: true, destinationKey: "summerlin-nv-us" });
    expect(resolveDeterministicV31PreviewIdentity({ preview, requestedIdentity: "definitely-not-a-real-destination" })).toEqual({ ok: false, error: "UNKNOWN_DESTINATION" });
  });

  it("preserves blank scalar values as null while keeping repeatable modules as arrays", async () => {
    const preview = await buildDeterministicV31PreviewResponse();
    const destination = preview.destinations[0];

    expect(Array.isArray(destination.canonicalDestination.facts)).toBe(true);
    expect(Array.isArray(destination.canonicalDestination.scores)).toBe(true);
    expect(Array.isArray(destination.canonicalDestination.neighborhoods)).toBe(true);

    const firstFact = destination.canonicalDestination.facts[0] as Record<string, unknown>;
    const firstScore = destination.canonicalDestination.scores[0] as Record<string, unknown>;
    const firstNeighborhood = destination.canonicalDestination.neighborhoods[0] as Record<string, unknown>;

    expect(firstFact.value_number).toBeNull();
    expect(firstFact.unit).toBeNull();
    expect(firstFact.source_url).toBeNull();
    expect(firstScore.source_url).toBeNull();
    expect(firstNeighborhood.typical_rent_low).toBeNull();
  });

  it("keeps destination rows isolated and deterministic across repeated previews", async () => {
    const firstPreview = await buildDeterministicV31PreviewResponse();
    const secondPreview = await buildDeterministicV31PreviewResponse();

    expect(firstPreview).toEqual(secondPreview);

    firstPreview.destinations.forEach((destination) => {
      destination.canonicalDestination.facts.forEach((row) => {
        expect((row as Record<string, unknown>).destination_key).toBe(destination.identity.destinationKey);
      });
      destination.canonicalDestination.scores.forEach((row) => {
        expect((row as Record<string, unknown>).destination_key).toBe(destination.identity.destinationKey);
      });
      destination.canonicalDestination.neighborhoods.forEach((row) => {
        expect((row as Record<string, unknown>).destination_key).toBe(destination.identity.destinationKey);
      });
    });
  }, 20000);

  it("rejects near-miss identities and does not recover them fuzzily", async () => {
    const preview = await buildDeterministicV31PreviewResponse();
    const nearMisses = [
      "new-braunfels",
      "new-braunfels-tx",
      "new-braunfels-tx-usa",
      "lisbon",
      "lisbon-port",
      "summerlin",
      "summerlin-nevada",
      "summerlin-nv",
      "summerlin-nv-usa-typo",
      "new-braunfels-tx-us ",
      " LISBON-PORTUGAL",
    ];

    nearMisses.forEach((requestedIdentity) => {
      expect(resolveDeterministicV31PreviewIdentity({ preview, requestedIdentity })).toEqual({ ok: false, error: "UNKNOWN_DESTINATION" });
    });
  });

  it("recursively proves destination isolation across nested records", async () => {
    const preview = await buildDeterministicV31PreviewResponse();
    const counts: Record<string, number> = {};

    const walk = (value: unknown, expectedDestinationKey: string) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => walk(entry, expectedDestinationKey));
        return;
      }
      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        if (typeof record.destination_key === "string") {
          counts[expectedDestinationKey] = (counts[expectedDestinationKey] ?? 0) + 1;
          expect(record.destination_key).toBe(expectedDestinationKey);
        }
        Object.values(record).forEach((entry) => walk(entry, expectedDestinationKey));
      }
    };

    preview.destinations.forEach((destination) => {
      walk(destination.canonicalDestination, destination.identity.destinationKey);
      expect(counts[destination.identity.destinationKey]).toBeGreaterThan(0);
    });
  });

  it("preserves blank values as null while keeping 0 and false as non-empty values", () => {
    const destinationHeaders = ["destination_key", "destination_name", "short_description"];
    const destinationRowZero = ["dest-zero", "0", "   "];
    const destinationRowFalse = ["dest-false", "false", "   "];

    const canonicalZero = buildDeterministicV31CanonicalDestination({
      destinationKey: "dest-zero",
      destinationRow: destinationRowZero,
      destinationHeaders,
      sheetRows: new Map([["DESTINATIONS", [["destination_key", "destination_name", "short_description"], destinationRowZero]]]),
      headersBySheet: new Map([["DESTINATIONS", destinationHeaders]]),
    });

    const canonicalFalse = buildDeterministicV31CanonicalDestination({
      destinationKey: "dest-false",
      destinationRow: destinationRowFalse,
      destinationHeaders,
      sheetRows: new Map([["DESTINATIONS", [["destination_key", "destination_name", "short_description"], destinationRowFalse]]]),
      headersBySheet: new Map([["DESTINATIONS", destinationHeaders]]),
    });

    expect(canonicalZero.identity.name).toBe("0");
    expect(canonicalZero.editorial.shortDescription).toBeNull();
    expect(canonicalFalse.identity.name).toBe("false");
    expect(canonicalFalse.editorial.shortDescription).toBeNull();
  });

  it("does not inject placeholder text into the canonical preview payload", async () => {
    const preview = await buildDeterministicV31PreviewResponse();
    const serialized = JSON.stringify(preview);

    expect(serialized).not.toContain("Not available");
    expect(serialized).not.toContain("TBD");
    expect(serialized).not.toContain("More local detail coming soon");
  });

  it("rejects invalid contracts cleanly", async () => {
    const invalidContract = await detectDeterministicV31WorkbookContract({ overrides: { schemaVersion: "3.0", architecture: "with_fallback", primaryIdentity: "slug" } });
    expect(invalidContract.isValid).toBe(false);
    expect(invalidContract.validationErrors).toContain("schema_version must be 3.1");
    expect(invalidContract.validationErrors).toContain("architecture must be workbook_only_no_fallback");
    expect(invalidContract.validationErrors).toContain("primary_identity must be destination_key");
  });
});
