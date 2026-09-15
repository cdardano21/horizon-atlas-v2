import { describe, expect, it } from "vitest";
import { evaluatePremiumReadiness, type PremiumReadinessChecks } from "./premium-readiness-gate";

const complete: PremiumReadinessChecks = {
  scope: true, identity: true, provenance: true, lifestyle: true, namedPlacesAndResources: true,
  links: true, media: true, semanticCopy: true, internalLanguage: true, moduleCounts: true,
  unknownPreserved: true, statusIntent: true, replayAuthorization: true,
};

describe("consolidated premium readiness", () => {
  it("returns one clear handoff status", () => {
    expect(evaluatePremiumReadiness(complete)).toEqual({ status: "PREMIUM_READY_FOR_CODEX", blockers: [] });
    expect(evaluatePremiumReadiness({ ...complete, media: false, links: false })).toEqual({ status: "BLOCKED", blockers: ["links", "media"] });
  });
});
