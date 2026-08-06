import { describe, expect, it } from "vitest";
import { buildEditorFormFromDestination, filterDestinationsByCatalog, filterDestinationsByQuery, getDestinationWorkflowState, normalizeDestinationIdentity, normalizeDestinationStatus, upsertItemById } from "./adminCatalogManagerUtils";

describe("filterDestinationsByQuery", () => {
  it("matches city, country, and slug values case-insensitively", () => {
    const destinations = [
      { id: "1", city: "Cavtat", country: "Croatia", slug: "cavtat" },
      { id: "2", city: "Zagreb", country: "Croatia", slug: "zagreb" },
      { id: "3", city: "Split", country: "Croatia", slug: "split" },
    ];

    expect(filterDestinationsByQuery(destinations, "cav")).toEqual([destinations[0]]);
    expect(filterDestinationsByQuery(destinations, "croatia")).toHaveLength(3);
    expect(filterDestinationsByQuery(destinations, "ZAG")).toEqual([destinations[1]]);
  });
});

describe("upsertItemById", () => {
  it("prepends a newly created item and removes any previous copy with the same id", () => {
    const existing = [
      { id: "1", city: "Cavtat", country: "Croatia", slug: "cavtat" },
      { id: "2", city: "Zagreb", country: "Croatia", slug: "zagreb" },
    ];
    const next = { id: "2", city: "Split", country: "Croatia", slug: "split" };

    expect(upsertItemById(existing, next)).toEqual([next, existing[0]]);
  });
});

describe("buildEditorFormFromDestination", () => {
  it("hydrates the editor form from the selected destination state", () => {
    const destination = {
      id: "dest-1",
      city: "Cavtat",
      country: "Croatia",
      slug: "cavtat",
      status: "review" as const,
      tier: "premium",
      description: "A coastal base for retirees.",
      overview: "Best for relaxed living.",
    };

    expect(buildEditorFormFromDestination(destination)).toEqual({
      city: "Cavtat",
      country: "Croatia",
      slug: "cavtat",
      status: "review",
      tier: "premium",
      description: "A coastal base for retirees.",
      overview: "Best for relaxed living.",
    });
  });
});

describe("filterDestinationsByCatalog", () => {
  it("filters by status, tier, and query while sorting newest first", () => {
    const destinations = [
      { id: "1", city: "Cavtat", country: "Croatia", slug: "cavtat", status: "published", tier: "premium", updated_at: "2024-01-10T00:00:00.000Z" },
      { id: "2", city: "Split", country: "Croatia", slug: "split", status: "draft", tier: "launch", updated_at: "2024-02-10T00:00:00.000Z" },
      { id: "3", city: "Zagreb", country: "Croatia", slug: "zagreb", status: "review", tier: "premium", updated_at: "2024-03-10T00:00:00.000Z" },
    ];

    expect(filterDestinationsByCatalog(destinations, {
      query: "croatia",
      status: "published",
      tier: "premium",
      sort: "newest",
    })).toEqual([destinations[0]]);

    expect(filterDestinationsByCatalog(destinations, {
      query: "split",
      status: "draft",
      sort: "oldest",
    })).toEqual([destinations[1]]);
  });
});

describe("getDestinationWorkflowState", () => {
  it("marks draft destinations as requiring preview before publish", () => {
    expect(getDestinationWorkflowState("draft")).toMatchObject({
      canPublish: true,
      requiresPreview: true,
      statusLabel: "Draft",
    });
  });

  it("marks published destinations as already live", () => {
    expect(getDestinationWorkflowState("published")).toMatchObject({
      canPublish: false,
      requiresPreview: false,
      statusLabel: "Published",
    });
  });

  it("treats mixed-case published values as published in the workflow state", () => {
    expect(getDestinationWorkflowState("Published")).toMatchObject({
      canPublish: false,
      requiresPreview: false,
      statusLabel: "Published",
    });
  });
});

describe("normalizeDestinationStatus", () => {
  it("coerces mixed-case values to the canonical lowercase status", () => {
    expect(normalizeDestinationStatus("Published")).toBe("published");
    expect(normalizeDestinationStatus("Draft")).toBe("draft");
  });
});

describe("normalizeDestinationIdentity", () => {
  it("trims values and generates a canonical slug from city and country", () => {
    expect(normalizeDestinationIdentity({ city: "  Cavtat  ", country: "Croatia", slug: "   " })).toEqual({
      city: "Cavtat",
      country: "Croatia",
      slug: "cavtat-croatia",
    });
  });

  it("normalizes an explicit slug without changing the canonical city and country values", () => {
    expect(normalizeDestinationIdentity({ city: "Split", country: "Croatia", slug: "  Split Croatia  " })).toEqual({
      city: "Split",
      country: "Croatia",
      slug: "split-croatia",
    });
  });
});
