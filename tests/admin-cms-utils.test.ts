import { describe, expect, it } from "vitest";
import { buildDashboardMetrics, createAdminCmsDestination, filterAdminDestinations, searchAdminDestinations } from "../app/components/adminCmsUtils";

describe("admin cms utilities", () => {
  it("searches destinations by city and country", () => {
    const destinations = [
      createAdminCmsDestination({ city: "Cádiz", country: "Spain", status: "draft" }),
      createAdminCmsDestination({ city: "Lisbon", country: "Portugal", status: "published" }),
    ];

    const results = searchAdminDestinations(destinations, "cadiz");
    expect(results).toHaveLength(1);
    expect(results[0]?.destination.city).toBe("Cádiz");
  });

  it("applies filters and sorting for the dashboard view", () => {
    const destinations = [
      createAdminCmsDestination({ city: "Zanzibar", country: "Tanzania", status: "review", needsReview: true, missingImages: true, updatedAt: "2024-01-03T00:00:00.000Z" }),
      createAdminCmsDestination({ city: "Alicante", country: "Spain", status: "published", missingAiSummary: true, updatedAt: "2024-01-10T00:00:00.000Z" }),
    ];

    const filtered = filterAdminDestinations(destinations, { status: "review", needsReview: true, sortBy: "updated" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.city).toBe("Zanzibar");
  });

  it("builds dashboard metrics from destination health signals", () => {
    const destinations = [
      createAdminCmsDestination({ city: "Mexico City", country: "Mexico", status: "published", missingImages: true, missingAiSummary: true, missingClimate: false, missingHealthcare: false, missingCostOfLiving: false, missingVideos: false, missingResources: false }),
      createAdminCmsDestination({ city: "Valencia", country: "Spain", status: "draft", missingImages: false, missingAiSummary: false, missingClimate: true, missingHealthcare: true, missingCostOfLiving: true, missingVideos: true, missingResources: true }),
    ];

    const metrics = buildDashboardMetrics(destinations);
    expect(metrics.total).toBe(2);
    expect(metrics.published).toBe(1);
    expect(metrics.missingContent).toBe(2);
  });
});
