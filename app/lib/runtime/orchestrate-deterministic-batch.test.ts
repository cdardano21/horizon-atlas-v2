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

  it("documents the known pre-existing blocker for Lisbon: a duplicate source_key in the frozen workbook's SOURCES sheet", async () => {
    // This is intentionally an integration-style regression: it proves the orchestration entrypoint
    // surfaces this real data defect loudly (via a thrown DuplicateChildKeyError) instead of silently
    // dropping or guessing at one of the two colliding rows. Fixing the frozen workbook's data is a
    // separate, explicit decision for the user - not something this pass should do unilaterally.
    await expect(runDeterministicV31BatchOrchestration({
      approvedDestinationKeys: ["lisbon-pt"],
      catalogSlugByDestinationKey: { "lisbon-pt": "lisbon-portugal" },
      mode: "DRY_RUN",
    })).rejects.toThrow(/Duplicate stable child key lis-cuf for module sources/);
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
