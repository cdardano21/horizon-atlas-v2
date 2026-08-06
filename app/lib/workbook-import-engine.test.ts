import { describe, expect, it } from "vitest";
import {
  buildWorkbookImportPlan,
  buildWorkbookSchema,
  normalizeWorkbookImportMode,
} from "./workbook-import-engine";

describe("workbook import engine", () => {
  it("infers a schema from workbook headers without assuming a fixed field count", () => {
    const schema = buildWorkbookSchema("Master Destinations", ["slug", "city", "country", "description", "custom_score"]);

    expect(schema.columns.map((column) => column.canonicalName)).toEqual([
      "slug",
      "city",
      "country",
      "description",
      "custom_score",
    ]);
    expect(schema.columns.find((column) => column.rawName === "custom_score")?.canonicalName).toBe("custom_score");
  });

  it("supports create-only mode for existing destinations", () => {
    const schema = buildWorkbookSchema("Master Destinations", ["slug", "city", "country", "description"]);
    const plan = buildWorkbookImportPlan(
      [{ slug: "devon", city: "Devon", country: "United Kingdom", description: "A coastal county" }],
      [{ id: "existing-1", slug: "devon", city: "Devon", country: "United Kingdom" }],
      schema,
      normalizeWorkbookImportMode("CREATE_ONLY"),
    );

    expect(plan[0]?.action).toBe("reject");
    expect(plan[0]?.reason).toContain("already exists");
  });

  it("fills only blank fields for existing destinations and honors delete markers", () => {
    const schema = buildWorkbookSchema("Master Destinations", ["slug", "city", "country", "description"]);
    const plan = buildWorkbookImportPlan(
      [{ slug: "devon", city: "Devon", country: "United Kingdom", description: "[delete]" }],
      [{ id: "existing-1", slug: "devon", city: "Devon", country: "United Kingdom", description: "Existing copy" }],
      schema,
      normalizeWorkbookImportMode("FILL_BLANKS_ONLY"),
    );

    const descriptionUpdate = plan[0]?.fieldUpdates?.find((fieldUpdate) => fieldUpdate.field === "description");

    expect(plan[0]?.action).toBe("update");
    expect(descriptionUpdate?.changeType).toBe("clear");
    expect(descriptionUpdate?.newValue).toBe("");
  });

  it("matches existing destinations by name plus state and country when slug is missing", () => {
    const schema = buildWorkbookSchema("Master Destinations", ["name", "state", "country", "description"]);
    const plan = buildWorkbookImportPlan(
      [{ name: "Devon", state: "Devon", country: "United Kingdom", description: "Updated copy" }],
      [{ id: "existing-2", slug: "devon-united-kingdom", name: "Devon", state: "Devon", country: "United Kingdom", description: "Original copy" }],
      schema,
      normalizeWorkbookImportMode("UPDATE_SUPPLIED_FIELDS"),
    );

    expect(plan[0]?.action).toBe("update");
    expect(plan[0]?.fieldUpdates?.find((fieldUpdate) => fieldUpdate.field === "description")?.changeType).toBe("set");
  });
});
