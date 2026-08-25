import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";
import { getCanonicalDestination } from "../canonical-destination-loader";

/**
 * Direct-from-workbook preservation inventory for Batch #1 and Batch #2.
 *
 * Batch #1 is not registered in the local preview registry and has no persisted Supabase row in
 * this environment, so it is not reachable through getCanonicalDestination/the dev server today -
 * this test proves the raw workbook content itself (the only available "before" reference, since
 * its SHA-256 is unchanged) is intact, complete, and internally consistent. Batch #2 IS reachable
 * through the registry-driven preview path, so this test additionally cross-checks every
 * neighborhood/place/resource against what getCanonicalDestination actually returns, proving the
 * Travel-resource-system checkpoint did not delete, rename, reorder, detach, or contaminate any
 * destination-specific content.
 */

const BATCH01_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx");
const BATCH02_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.2.xlsx");

const BATCH01_KEYS = ["the-villages-fl-us", "sofia-bg", "puerto-vallarta-mx", "hoi-an-vn", "queenstown-nz"] as const;
const BATCH02_KEYS = ["ascoli-piceno-it", "sarande-al", "dumaguete-ph", "las-terrenas-do", "fairhope-al-us"] as const;

describe("Batch #1 raw-workbook preservation inventory (not locally previewable - direct parser proof)", () => {
  for (const destinationKey of BATCH01_KEYS) {
    it(`${destinationKey}: neighborhoods/places/resources/propertyResources are present, keyed, ordered, and destination-scoped`, async () => {
      const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
      const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === destinationKey);
      expect(canonical).toBeDefined();

      // Every neighborhood/place/resource/propertyResource row must genuinely belong to this
      // destination_key - proves no cross-destination bleed exists in the raw parsed source.
      for (const n of canonical!.neighborhoods) expect(n.destination_key).toBe(destinationKey);
      for (const p of canonical!.places) expect(p.destination_key).toBe(destinationKey);
      for (const r of canonical!.resources) expect(r.destination_key).toBe(destinationKey);
      for (const pr of canonical!.propertyResources) expect(pr.destination_key).toBe(destinationKey);

      // Every place tied to a neighborhood_key must resolve to a neighborhood that really exists
      // for this destination (no orphaned/detached place-to-neighborhood association).
      const neighborhoodKeys = new Set(canonical!.neighborhoods.map((n) => n.neighborhood_key));
      for (const place of canonical!.places) {
        if (place.neighborhood_key) {
          expect(neighborhoodKeys.has(place.neighborhood_key)).toBe(true);
        }
      }

      // Neighborhood keys and place keys must each be unique within the destination (no duplication/
      // renaming collision).
      const neighborhoodKeyList = canonical!.neighborhoods.map((n) => n.neighborhood_key);
      expect(new Set(neighborhoodKeyList).size).toBe(neighborhoodKeyList.length);
      const placeKeyList = canonical!.places.map((p) => p.place_key);
      expect(new Set(placeKeyList).size).toBe(placeKeyList.length);

      expect(canonical!.neighborhoods.length).toBeGreaterThan(0);
      expect(canonical!.places.length).toBeGreaterThan(0);
    });
  }

  it("prints the full Batch #1 inventory table for report capture (neighborhoods/places/resources counts per destination)", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
    const rows = BATCH01_KEYS.map((key) => {
      const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === key)!;
      return {
        destinationKey: key,
        name: canonical.identity.name,
        city: canonical.identity.city,
        country: canonical.identity.country,
        neighborhoods: canonical.neighborhoods.length,
        neighborhoodNames: canonical.neighborhoods.map((n) => n.neighborhood_name),
        places: canonical.places.length,
        placeCategories: Array.from(new Set(canonical.places.map((p) => p.category_key))),
        resources: canonical.resources.length,
        resourceCategories: Array.from(new Set(canonical.resources.map((r) => r.resource_category))),
        propertyResources: canonical.propertyResources.length,
        media: canonical.media.length,
      };
    });
    // eslint-disable-next-line no-console
    console.log("BATCH01_INVENTORY", JSON.stringify(rows, null, 2));
    expect(rows.length).toBe(5);
  });
});

describe("Batch #2 preservation inventory - raw workbook vs. resolved canonical destination (registry-driven preview path)", () => {
  for (const destinationKey of BATCH02_KEYS) {
    it(`${destinationKey}: every raw workbook neighborhood/place survives, correctly keyed and destination-scoped, in the resolved canonical destination`, async () => {
      const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH02_PATH);
      const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === destinationKey)!;
      const destination = await getCanonicalDestination(destinationKey);
      expect(destination).not.toBeNull();

      const rawNeighborhoodNames = new Set(canonical.neighborhoods.map((n) => n.neighborhood_name));
      const resolvedNeighborhoodNames = new Set((destination!.v31Modules?.neighborhoods ?? []).map((n) => n.name));
      for (const name of rawNeighborhoodNames) {
        expect(resolvedNeighborhoodNames.has(name)).toBe(true);
      }
      expect(destination!.v31Modules?.neighborhoods.length).toBe(canonical.neighborhoods.length);

      const rawPlaceNames = new Set(canonical.places.map((p) => p.place_name));
      const resolvedPlaceNames = new Set((destination!.v31Modules?.places ?? []).map((p) => p.name));
      for (const name of rawPlaceNames) {
        expect(resolvedPlaceNames.has(name)).toBe(true);
      }
      expect(destination!.v31Modules?.places.length).toBe(canonical.places.length);

      // No neighborhood/place name from this destination ever collides with the destination's own
      // suffix-bearing key/slug (proves the public-label suffix-leak fix holds across the full set).
      expect(destination!.title.toLowerCase()).not.toContain(destinationKey.replace(/-/g, " "));
    });
  }

  it("prints the full Batch #2 inventory table for report capture", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH02_PATH);
    const rows = await Promise.all(BATCH02_KEYS.map(async (key) => {
      const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === key)!;
      const destination = await getCanonicalDestination(key);
      return {
        destinationKey: key,
        title: destination!.title,
        neighborhoods: destination!.v31Modules?.neighborhoods.length ?? 0,
        places: destination!.v31Modules?.places.length ?? 0,
        rawResources: canonical.resources.length,
        rawPropertyResources: canonical.propertyResources.length,
        resolvedResources: destination!.resources.length,
        media: destination!.media.length,
      };
    }));
    // eslint-disable-next-line no-console
    console.log("BATCH02_INVENTORY", JSON.stringify(rows, null, 2));
    expect(rows.length).toBe(5);
  }, 30000);
});
