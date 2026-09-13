import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY, validateExpansionWorkbookRegistry } from "../../expansion-workbook-registry";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31WorkbookImport } from "../../workbook-v31-deterministic-core";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import { planCatalogWriteOperation } from "../../persistence/v31/catalog-write-contract";
import type { CanonicalDestinationKey, DestinationId } from "../../persistence/v31/types";
import { getDestinationImageSet } from "../../imageFallback";
import type { Destination } from "../../destinations";
import { adaptWorkbookDestinationToIntelligenceV2Facts } from "../workbook-v32-adapter";

const ID = "curated-mixed-batch-10-01";
const WORKBOOK = "data/curated-mixed-batch-10-01/DestinationFinderAI-Curated-Mixed-Batch-10-01-Authoring-Complete-v3.3.xlsx";
const SHA = "23d4a18924d6a9ccc94d8389c4e76c4a669a5411e0f1385d7d83a7a138c35b48";
const KEYS = ["bariloche-argentina", "mendoza-argentina", "joao-pessoa-brazil", "punta-del-este-uruguay", "ghent-belgium", "wanaka-new-zealand", "stellenbosch-south-africa", "loreto-mexico", "vevey-switzerland", "hakuba-japan"];
let parsed: DeterministicV31WorkbookImport;
beforeAll(async () => {
  parsed = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK);
  expect(parsed.validationErrors).toEqual([]);
});

describe("curated mixed batch 10-01", () => {
  it("pins exact workbook bytes and exclusive published-catalog ownership", () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK)).digest("hex")).toBe(SHA);
    expect(EXPANSION_WORKBOOK_REGISTRY.filter(e => e.registryId === ID)).toEqual([expect.objectContaining({
      workbookPath: WORKBOOK, expectedSha256: SHA, environment: "production", candidateDiscovery: "published-catalog", expectedDestinationKeys: KEYS,
    })]);
    expect(parsed.canonicalDestinations.map(d => d.identity.destinationKey)).toEqual(KEYS);
    for (const key of KEYS) expect(EXPANSION_WORKBOOK_REGISTRY.filter(e => e.expectedDestinationKeys.includes(key)).map(e => e.registryId)).toEqual([ID]);
  });

  it("validates the batch hash and identities through the generic validator", async () => {
    const entry = EXPANSION_WORKBOOK_REGISTRY.find(e => e.registryId === ID)!;
    // The validator visits preview entries only; exercise it without changing production registration.
    const validation = await validateExpansionWorkbookRegistry([{ ...entry, environment: "preview" }]);
    expect(validation.ok, JSON.stringify(validation)).toBe(true);
    const mismatch = await validateExpansionWorkbookRegistry([{ ...entry, environment: "preview", expectedSha256: "0".repeat(64) }]);
    expect(mismatch.ok).toBe(false);
  });

  it("preserves counts, population provenance, and four local authored images per destination", () => {
    for (const d of parsed.canonicalDestinations) {
      const key = d.identity.destinationKey;
      expect(adaptWorkbookDestinationToIntelligenceV2Facts(d).mappingErrors, key).toEqual([]);
      const stored = mapCanonicalDestinationToStoredState(d);
      expect(stored.neighborhoods, key).toHaveLength(5);
      expect(stored.places, key).toHaveLength(18);
      expect(stored.resources, key).toHaveLength(18);
      expect(d.climateMonthly, key).toHaveLength(12);
      expect(d.identity.population, key).toBeTruthy();
      expect(d.sources.some(s => /population/i.test(s.source_name ?? "") && /^https:\/\//.test(s.source_url ?? "")), key).toBe(true);
      expect(d.media, key).toHaveLength(4);
      expect(d.media.filter(m => /^(true|1|yes)$/i.test(String(m.primary_image))), key).toHaveLength(1);
      const urls = d.media.map(m => m.image_url!);
      expect(new Set(urls).size, key).toBe(4);
      for (const [index, m] of d.media.entries()) {
        expect(m.image_url).toBe(`/images/${ID}/${key}-${index === 0 ? "hero" : `gallery-0${index}`}.jpg`);
        expect(m.source_url).toMatch(/^https:\/\//);
        expect(m.license_notes).toBeTruthy();
        const bytes = readFileSync(path.join("public", m.image_url!));
        expect([...bytes.subarray(0, 3)]).toEqual([255, 216, 255]);
      }
      const imageDestination = { slug: key, city: d.identity.name, country: d.identity.country,
        images: urls.map(src => ({ src, alt: key })) } as Destination;
      expect(getDestinationImageSet(imageDestination, 5), key).toEqual(urls);
      expect(stored.media.every(m => m.sortOrder !== null), key).toBe(true);
    }
  });

  it("plans five existing-identity updates and five creates without executing writes", () => {
    const operations = parsed.canonicalDestinations.map((d, index) => {
      const resolvedDestinationIdentity = { destinationKey: d.identity.destinationKey as CanonicalDestinationKey, destinationId: `fixture-${index}` as DestinationId };
      const current = { destinationKey: null, slug: d.identity.slug, city: d.identity.name, country: d.identity.country, beachAccess: null, mountainOrSkiAccess: null, countryCode: null };
      return index < 5
        ? planCatalogWriteOperation({ kind: "EXISTING", resolvedDestinationIdentity, canonicalDestination: d, current })
        : planCatalogWriteOperation({ kind: "CREATE", resolvedDestinationIdentity, canonicalDestination: d, bootstrap: { slug: d.identity.slug, city: d.identity.name, country: d.identity.country } });
    });
    expect(operations.map(o => o?.kind)).toEqual([...Array(5).fill("UPDATE_EXISTING_CATALOG"), ...Array(5).fill("CREATE_CATALOG")]);
    expect(operations.map(o => o?.destinationKey)).toEqual(KEYS);
  });
});
