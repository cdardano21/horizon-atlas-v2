import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadNormalizedPersistedDestinationBundle } from "../load-normalized-persisted-destination-bundle";

const requiredPresenceModules = [
  "facts",
  "scores",
  "neighborhoods",
  "places",
  "resources",
  "media",
  "propertyResources",
  "moveChecklist",
  "eventsSeasonality",
  "sources",
  "costOfLiving",
  "climateMonthly",
  "housing",
  "healthcare",
  "visaResidency",
  "taxesFinance",
  "lgbtqInclusivity",
  "safetyRisks",
  "transportation",
  "remoteWork",
  "languageIntegration",
  "pets",
  "familyEducation",
  "communitySocial",
  "accessibility",
  "bureaucracySetup",
  "workBusiness",
  "retirementAging",
  "lifestyleLaws",
  "realityCheck",
  "environmentQuality",
  "dailyLifePracticality",
] as const;

function readDryRunPayload() {
  const payloadPath = path.resolve(__dirname, "../../../../../tmp/premium-pilot-dry-run.json");
  return JSON.parse(readFileSync(payloadPath, "utf8"));
}

function createReadPortForDestination(destination: any, destinationId: string) {
  const state = destination.storedState;
  const root = {
    destinationId,
    destinationKey: destination.identity.destinationKey,
    slug: destination.identity.slug,
    name: destination.identity.name,
    city: destination.identity.city,
    country: destination.identity.country,
  };
  const profile = {
    destinationId,
    destinationKey: destination.identity.destinationKey,
    profileStorageVersion: 1,
    identityName: destination.identity.name,
    shortDescription: state.editorial.shortDescription ?? null,
    longDescription: state.editorial.longDescription ?? null,
    currency: state.editorial.currency,
    primaryLanguage: state.editorial.primaryLanguage,
    timeZone: state.editorial.timeZone,
  };
  const presence = requiredPresenceModules.map((module) => ({
    destinationId,
    destinationKey: destination.identity.destinationKey,
    module,
  }));
  const keyedChildren = {
    facts: (state.facts ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, factKey: row.factKey, factGroup: row.factGroup, valueText: row.valueText, displayLabel: row.displayLabel, sourceName: row.sourceName })),
    scores: (state.scores ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, scoreKey: row.scoreKey, scoreValue: row.scoreValue, scoreLabel: row.scoreLabel, methodologyVersion: row.methodologyVersion })),
    neighborhoods: (state.neighborhoods ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, neighborhoodKey: row.neighborhoodKey, name: row.name, summary: row.summary, areaType: row.areaType })),
    places: (state.places ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, placeKey: row.placeKey, category: row.category, name: row.name, description: row.description })),
    resources: (state.resources ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, resourceKey: row.resourceKey, category: row.category, name: row.name, url: row.url })),
    media: (state.media ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, mediaKey: row.mediaKey, kind: row.kind, url: row.url, caption: row.caption, altText: row.altText })),
    propertyResources: (state.propertyResources ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, itemKey: row.itemKey, category: row.category, name: row.name, url: row.url })),
    moveChecklist: (state.moveChecklist ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, checklistKey: row.checklistKey, summary: row.summary, checklistNotes: row.checklistNotes })),
    eventsSeasonality: (state.eventsSeasonality ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, eventSeasonalityKey: row.eventSeasonalityKey, summary: row.summary, seasonalityNotes: row.seasonalityNotes })),
    sources: (state.sources ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, sourceKey: row.sourceKey, name: row.name, url: row.url, type: row.type })),
  };
  const replaceModules = {
    costOfLiving: (state.costOfLiving ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, itemKey: row.itemKey, category: row.category, monthlyLow: row.monthlyLow, monthlyHigh: row.monthlyHigh, currency: row.currency })),
    climateMonthly: (state.climateMonthly ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, monthKey: row.monthKey, avgHighTemp: row.avgHighTemp, avgLowTemp: row.avgLowTemp, precipitationMm: row.precipitationMm, humidityPct: row.humidityPct })),
    housing: (state.housing ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, summary: row.summary, buyingSummary: row.buyingSummary, rentalSummary: row.rentalSummary })),
    healthcare: (state.healthcare ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, summary: row.summary, publicAccessSummary: row.publicAccessSummary, insuranceSummary: row.insuranceSummary })),
    visaResidency: (state.visaResidency ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, summary: row.summary, residencyPath: row.residencyPath, citizenshipPath: row.citizenshipPath })),
    taxesFinance: (state.taxesFinance ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, summary: row.summary, notes: row.notes })),
    lgbtqInclusivity: (state.lgbtqInclusivity ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, culturalNotes: row.culturalNotes })),
    safetyRisks: (state.safetyRisks ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, itemKey: row.itemKey, topic: row.topic, severity: row.severity, summary: row.summary })),
    transportation: (state.transportation ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, summary: row.summary, airportSummary: row.airportSummary, transitSummary: row.transitSummary })),
    remoteWork: (state.remoteWork ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, summary: row.summary, internetSummary: row.internetSummary, timezoneSummary: row.timezoneSummary })),
    languageIntegration: (state.languageIntegration ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, englishSupport: row.englishSupport })),
    pets: (state.pets ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, petFriendlyNotes: row.petFriendlyNotes })),
    familyEducation: (state.familyEducation ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, schoolsSummary: row.schoolsSummary })),
    communitySocial: (state.communitySocial ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, socialNotes: row.socialNotes })),
    accessibility: (state.accessibility ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, mobilityNotes: row.mobilityNotes })),
    bureaucracySetup: (state.bureaucracySetup ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, setupNotes: row.setupNotes })),
    workBusiness: (state.workBusiness ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, remoteWorkNotes: row.remoteWorkNotes })),
    retirementAging: (state.retirementAging ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, agingNotes: row.agingNotes })),
    lifestyleLaws: (state.lifestyleLaws ?? []).map((row: any, index: number) => ({ destinationId, destinationKey: destination.identity.destinationKey, position: index + 1, summary: row.summary, legalNotes: row.legalNotes })),
    realityCheck: (state.realityCheck ?? []).map((row: any) => ({ destinationId, destinationKey: destination.identity.destinationKey, itemKey: row.itemKey, title: row.title, detail: row.detail, severity: row.severity })),
  };
  const singletons = {
    environmentQuality: state.environmentQuality ? [{ destinationId, destinationKey: destination.identity.destinationKey, summary: state.environmentQuality.summary, qualityNotes: state.environmentQuality.qualityNotes }] : [],
    dailyLifePracticality: state.dailyLifePracticality ? [{ destinationId, destinationKey: destination.identity.destinationKey, summary: state.dailyLifePracticality.summary, practicalityNotes: state.dailyLifePracticality.practicalityNotes }] : [],
  };

  return {
    async readRoot() { return { ok: true, value: root }; },
    async readProfile() { return { ok: true, value: profile }; },
    async readPresence() { return { ok: true, value: presence }; },
    async readKeyedChildren() { return { ok: true, value: keyedChildren }; },
    async readReplaceModules() { return { ok: true, value: replaceModules }; },
    async readSingletons() { return { ok: true, value: singletons }; },
  };
}

describe("premium pilot dry-run artifact", () => {
  it("passes the current persisted-bundle contract for all three pilots", async () => {
    const payload = readDryRunPayload();
    expect(payload.destinations).toHaveLength(3);

    for (const [index, destination] of payload.destinations.entries()) {
      const destinationId = `11111111-1111-1111-1111-${String(index + 1).padStart(12, "0")}`;
      const readPort = createReadPortForDestination(destination, destinationId);
      const result = await loadNormalizedPersistedDestinationBundle(
        { destinationId, destinationKey: destination.identity.destinationKey },
        readPort,
      );

      expect(result.outcome).toBe("SUCCESS");
      if (result.outcome !== "SUCCESS") {
        throw new Error(`Expected success for ${destination.identity.destinationKey}, got ${result.failure?.reason}`);
      }
      expect(result.bundle.destinationKey).toBe(destination.identity.destinationKey);
      expect(result.bundle.identity.name).toBe(destination.identity.name);
      expect(result.bundle.identity.slug).toBe(destination.identity.slug);
    }
  });
});
