import { describe, expect, it } from "vitest";
import { runDeterministicV31BatchOrchestration } from "./orchestrate-deterministic-batch";

// This is the Step 13 proof: run the new, generic, reusable orchestration entrypoint against the
// existing frozen 3-pilot workbook in DRY_RUN mode. Since the pilots are already in their
// browser-verified persisted state, this must produce only fully-understood, non-destructive
// differences (or none) - never a large or unexplained diff. This test intentionally exercises
// real network (Supabase) and the real frozen workbook file; it is not mocked.
describe("deterministic v3.1 batch orchestration - golden 3 dry-run proof", () => {
  it("produces a valid contract and a clean plan for Summerlin without any hardcoded pilot allowlist", async () => {
    // Only Summerlin is asserted as a full clean PLANNED result here. Lisbon and New Braunfels each
    // have their own separate, pre-existing, real blockers documented in the two tests below - this
    // is intentional: Step 13's purpose is to surface exactly this kind of issue, not paper over it.
    const result = await runDeterministicV31BatchOrchestration({
      approvedDestinationKeys: ["summerlin-nv-us"],
      catalogSlugByDestinationKey: { "summerlin-nv-us": "summerlin-nv-usa" },
      mode: "DRY_RUN",
    });

    expect(result.contractValid).toBe(true);
    expect(result.contractSchemaVersion).toBe("3.1");
    expect(result.contractValidationErrors).toEqual([]);

    // eslint-disable-next-line no-console
    console.log("Golden dry-run destination report (Summerlin):", JSON.stringify(result.destinationReports, null, 2));
    // eslint-disable-next-line no-console
    console.log("Golden dry-run summary (Summerlin):", JSON.stringify(result.summary, null, 2));

    expect(result.destinationReports).toEqual([
      expect.objectContaining({ destinationKey: "summerlin-nv-us", status: "PLANNED" }),
    ]);
    expect(result.summary.unresolved).toBe(0);
  }, 30000);

  it("resolves Lisbon cleanly now that the frozen workbook's SOURCES sheet has unique stable keys for both legitimate 'CUF' entries", async () => {
    // Historical note: the SOURCES sheet used to have two distinct sources (the general "CUF"
    // network page and "CUF Lisbon Hospitals") incorrectly sharing one source_key ("lis-cuf"),
    // which previously made this call reject with a DuplicateChildKeyError. The frozen workbook
    // was corrected to give the hospitals entry its own key ("lis-cuf-hospitals"), preserving both
    // real rows. This test now proves the positive, resolved contract instead of the old failure.
    const result = await runDeterministicV31BatchOrchestration({
      approvedDestinationKeys: ["lisbon-pt"],
      catalogSlugByDestinationKey: { "lisbon-pt": "lisbon-portugal" },
      mode: "DRY_RUN",
    });

    expect(result.contractValid).toBe(true);
    expect(result.summary.unresolved).toBe(0);
    expect(result.destinationReports).toEqual([
      expect.objectContaining({ destinationKey: "lisbon-pt", status: "PLANNED", errors: [] }),
    ]);

    // A duplicate stable child key (the historical "lis-cuf" collision) would have thrown a
    // DuplicateChildKeyError during planning, so reaching a PLANNED report at all - combined with
    // errors being empty - is already the definitive proof that both Lisbon source rows now resolve
    // under unique stable keys. This loose bound is a general sanity check that real child
    // operations were actually planned, without pinning to a fragile exact snapshot count.
    expect(result.summary.totalChildOperations).toBeGreaterThan(50);
  }, 30000);

  it("documents the known pre-existing blocker for New Braunfels: its destinations_catalog row is status='review', not 'published'", async () => {
    // New Braunfels's catalog row has never been published, so Postgres RLS ("Published rows are
    // viewable") blocks the anon-key persisted-runtime read path from ever seeing its premium_v2
    // module rows - independent of anything changed in this pass. This is exactly why the live app
    // still renders New Braunfels correctly only via the golden-pilot workbook-fallback branch
    // preserved in Step 5/6, not via the persisted-bundle path. Publishing the row is a data change
    // outside this pass's scope (it would also change the live pilot page's data source, which this
    // pass must not risk).
    const result = await runDeterministicV31BatchOrchestration({
      approvedDestinationKeys: ["new-braunfels-tx-us"],
      catalogSlugByDestinationKey: { "new-braunfels-tx-us": "new-braunfels-texas-united-states" },
      mode: "DRY_RUN",
    });

    expect(result.destinationReports).toEqual([
      expect.objectContaining({ destinationKey: "new-braunfels-tx-us", status: "DESTINATION_NOT_FOUND" }),
    ]);
  }, 30000);
});
