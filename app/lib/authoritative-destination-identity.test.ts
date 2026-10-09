import { describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "./expansion-workbook-registry";
import { smartShortlistCandidates } from "./smart-shortlist/cohort";
import { isAuthoritativeDestinationIdentity } from "./authoritative-destination-identity";

describe("authoritative fallback boundary", () => {
  it("covers every registered identity and existing registered cohort alias", () => {
    const keys = new Set(EXPANSION_WORKBOOK_REGISTRY.flatMap(entry => [...entry.expectedDestinationKeys]));
    for (const key of keys) expect(isAuthoritativeDestinationIdentity(key)).toBe(true);
    for (const candidate of smartShortlistCandidates.filter(candidate => keys.has(candidate.key))) {
      expect(isAuthoritativeDestinationIdentity(candidate.slug)).toBe(true);
    }
  });
  it("preserves Legacy-only identities and rejects fuzzy matches", () => {
    expect(isAuthoritativeDestinationIdentity("chicago-illinois-united-states")).toBe(false);
    expect(isAuthoritativeDestinationIdentity("makarska")).toBe(false);
    expect(isAuthoritativeDestinationIdentity(" MAKARSKA-CROATIA ")).toBe(true);
  });
});
