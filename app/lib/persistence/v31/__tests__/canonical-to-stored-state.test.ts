import { describe, expect, it } from "vitest";
import type { DeterministicV31CanonicalDestination } from "../../../workbook-v31-deterministic-core";
import { mapCanonicalDestinationToStoredState } from "../map-canonical-destination-to-stored-state";

describe("v31 canonical-to-stored-state adapter", () => {
  const createCanonicalDestination = (overrides: Partial<DeterministicV31CanonicalDestination> = {}): DeterministicV31CanonicalDestination => ({
    identity: {
      destinationKey: "dest-a",
      slug: "alpha",
      name: "Alpha",
      city: "Alpha City",
      country: "Country A",
    },
    editorial: {
      shortDescription: "A lively retirement hub",
      longDescription: "A lively retirement hub with strong infrastructure",
      currency: "USD",
      primaryLanguage: "English",
      timeZone: "UTC",
    },
    facts: [
      {
        destination_key: "dest-a",
        record_key: "fact-1",
        fact_group: "overview",
        fact_key: "fact-1",
        display_label: "Overview",
        value_text: "Popular with retirees",
        value_number: null,
        unit: null,
        qualitative_rating: null,
        stay_mode_key: null,
        display_order: null,
        source_name: "Workbook",
        source_url: null,
        verified: null,
        verified_at: null,
        factKey: "fact-1",
        factGroup: "overview",
        valueText: "Popular with retirees",
        displayLabel: "Overview",
        sourceName: "Workbook",
      },
    ],
    scores: [
      {
        destination_key: "dest-a",
        score_key: "score-1",
        score_value: "8.4",
        score_label: "Overall",
        methodology_version: "v3.1",
        evidence_summary: null,
        source_url: null,
        verified: null,
        verified_at: null,
        scoreKey: "score-1",
        scoreValue: "8.4",
        scoreLabel: "Overall",
        methodologyVersion: "v3.1",
      },
    ],
    neighborhoods: [],
    places: [],
    resources: [],
    media: [],
    costOfLiving: [],
    climateMonthly: [],
    housing: [],
    propertyResources: [],
    healthcare: [],
    visaResidency: [],
    taxesFinance: [],
    lgbtqInclusivity: [],
    safetyRisks: [],
    transportation: [],
    remoteWork: [],
    languageIntegration: [],
    pets: [],
    familyEducation: [],
    communitySocial: [],
    accessibility: [],
    bureaucracySetup: [],
    workBusiness: [],
    retirementAging: [],
    lifestyleLaws: [],
    realityCheck: [],
    moveChecklist: [],
    environmentQuality: {
      air_quality_summary: "Clean air",
      water_quality_summary: "Good water",
    },
    dailyLifePracticality: {
      grocery_access: "Easy",
      things_residents_wish_they_knew: "Need a car",
    },
    eventsSeasonality: [
      {
        destination_key: "dest-a",
        event_season_key: "season-1",
        record_type: null,
        name: null,
        month_start: null,
        month_end: null,
        season: null,
        description: "Spring festival",
        crowding_level: null,
        price_pressure: null,
        weather_context: "Mild weather",
        best_for: null,
        avoid_if: null,
        official_url: null,
        source_url: null,
        verified: null,
        verified_at: null,
      },
    ],
    sources: [
      {
        destination_key: "dest-a",
        source_key: "source-1",
        source_name: "Workbook",
        source_url: "https://example.com",
        source_type: "workbook",
        publisher: null,
        accessed_at: null,
        verified: null,
        confidence: null,
        notes: null,
      },
    ],
    ...overrides,
  } as DeterministicV31CanonicalDestination);

  it("maps canonical destination data into the stored-state structural representation", () => {
    const canonicalDestination = createCanonicalDestination();

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.identity.destinationKey).toBe("dest-a");
    expect(result.editorial.shortDescription).toBe("A lively retirement hub");
    expect(result.facts[0]).toMatchObject({ factKey: "fact-1", factGroup: "overview", valueText: "Popular with retirees" });
    expect(result.environmentQuality).toEqual({ summary: "Clean air", qualityNotes: "Good water" });
    expect(result.dailyLifePracticality).toEqual({ summary: "Easy", practicalityNotes: "Need a car" });
    expect(result.eventsSeasonality[0]).toMatchObject({ eventSeasonalityKey: "season-1", summary: "Spring festival", seasonalityNotes: "Mild weather" });
    expect(result.sources[0]).toMatchObject({ sourceKey: "source-1", name: "Workbook" });
  });

  it("preserves deterministic identity and child-key mapping for canonical input", () => {
    const canonicalDestination = createCanonicalDestination({ identity: { destinationKey: "dest-a", slug: "alpha", name: "Alpha", city: "Alpha City", country: "Country A" } });

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.identity.destinationKey).toBe("dest-a");
    expect(result.identity.slug).toBe("alpha");
    expect(result.editorial.shortDescription).toBe("A lively retirement hub");
  });

  it("preserves primary identity, gallery order, and verification for media", () => {
    const canonicalDestination = createCanonicalDestination({
      media: [
        {
          media_key: "media-1",
          media_type: "photo",
          image_url: "https://upload.wikimedia.org/example.jpg",
          caption: "Destination panorama",
          subject: "City skyline",
          primary_image: "1",
          gallery_order: "2",
          source_name: "Wikimedia Commons",
          source_url: "https://commons.wikimedia.org/wiki/File:Example.jpg",
          license_notes: "CC BY-SA 4.0",
          verified: "1",
        } as unknown as DeterministicV31CanonicalDestination["media"][number],
      ],
    });

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.media[0]).toMatchObject({
      mediaKey: "media-1",
      isPrimary: "1",
      sortOrder: "2",
      verified: "1",
    });
  });

  it.each([null, "", " "])("preserves authored media order and deterministically fills blank hero order: %s", (blankOrder) => {
    const media = [
      { key: "hero", order: blankOrder },
      { key: "gallery-3", order: "3" },
      { key: "gallery-1", order: "1" },
      { key: "gallery-2", order: "2" },
    ].map(({ key, order }) => ({
      destination_key: "dest-a", media_key: key, media_type: key === "hero" ? "hero" : "gallery",
      image_url: `https://upload.wikimedia.org/${key}.jpg`, caption: key, subject: key,
      primary_image: key === "hero" ? "1" : "0", gallery_order: order,
      source_name: "Commons", source_url: `https://commons.wikimedia.org/wiki/File:${key}.jpg`,
      license_notes: "CC BY-SA", verified: "1", verified_at: null, confidence: "HIGH",
    }));
    const canonical = createCanonicalDestination({ media });
    const stored = mapCanonicalDestinationToStoredState(canonical);
    expect(stored.identity.destinationKey).toBe("dest-a");
    expect(stored.media.map((row) => [row.mediaKey, row.sortOrder])).toEqual([
      ["hero", "0"], ["gallery-3", "3"], ["gallery-1", "1"], ["gallery-2", "2"],
    ]);
    for (const [index, row] of stored.media.entries()) {
      expect(row.sortOrder, row.mediaKey).not.toBeNull();
      expect(row, row.mediaKey).toMatchObject({
        mediaKey: media[index].media_key, kind: media[index].media_type,
        url: media[index].image_url, isPrimary: media[index].primary_image,
        sourceUrl: media[index].source_url,
      });
    }
    expect(mapCanonicalDestinationToStoredState(canonical)).toEqual(stored);
    expect(canonical.media[0].gallery_order).toBe(blankOrder);
  });

  it("preserves neighborhoodKey, websiteUrl, googleMapsUrl, sourceUrl, address, phone, and displayOrder for a real place row", () => {
    const canonicalDestination = createCanonicalDestination({
      places: [
        {
          destination_key: "dest-a",
          place_key: "place-1",
          neighborhood_key: "hood-1",
          category_key: "restaurant",
          place_name: "Bluefin Grill & Bar",
          subcategory: "Restaurant",
          description: "Seafood-focused restaurant.",
          address: "2738 Brownwood Blvd",
          latitude: null,
          longitude: null,
          price_level: "$$",
          website_url: "https://www.bluefingrillbar.com/",
          google_maps_url: "https://www.google.com/maps/search/?api=1&query=Bluefin",
          phone: "+1 352-571-5344",
          best_for: "Residents",
          display_order: "1",
          source_name: "Bluefin Grill & Bar official website",
          source_url: "https://www.bluefingrillbar.com/",
          verified: "1",
          verified_at: "2026-08-16",
        } as unknown as DeterministicV31CanonicalDestination["places"][number],
      ],
    });

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.places).toHaveLength(1);
    expect(result.places[0]).toMatchObject({
      placeKey: "place-1",
      category: "restaurant",
      name: "Bluefin Grill & Bar",
      description: "Seafood-focused restaurant.",
      neighborhoodKey: "hood-1",
      websiteUrl: "https://www.bluefingrillbar.com/",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bluefin",
      sourceUrl: "https://www.bluefingrillbar.com/",
      address: "2738 Brownwood Blvd",
      phone: "+1 352-571-5344",
      displayOrder: "1",
    });
  });

  it("leaves neighborhoodKey/websiteUrl/googleMapsUrl/sourceUrl/address/phone/displayOrder null when the canonical place row has no value, without fabricating any of them", () => {
    const canonicalDestination = createCanonicalDestination({
      places: [
        {
          destination_key: "dest-a",
          place_key: "place-1",
          neighborhood_key: null,
          category_key: "restaurant",
          place_name: "Unlinked Place",
          subcategory: null,
          description: null,
          address: null,
          latitude: null,
          longitude: null,
          price_level: null,
          website_url: null,
          google_maps_url: null,
          phone: null,
          best_for: null,
          display_order: null,
          source_name: null,
          source_url: null,
          verified: null,
          verified_at: null,
        } as unknown as DeterministicV31CanonicalDestination["places"][number],
      ],
    });

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.places[0]).toMatchObject({
      neighborhoodKey: null,
      websiteUrl: null,
      googleMapsUrl: null,
      sourceUrl: null,
      address: null,
      phone: null,
      displayOrder: null,
    });
  });

  it("preserves description, official, stayModeKey, sourceName, sourceUrl, verified, and verifiedAt for a real RESOURCES row", () => {
    const canonicalDestination = createCanonicalDestination({
      resources: [
        {
          destination_key: "dest-a",
          resource_key: "resource-1",
          resource_category: "hotels",
          resource_name: "Grand Hotel",
          description: "A centrally located hotel.",
          url: "https://example.com/grand-hotel",
          official: "0",
          stay_mode_key: "SHORT_1_3_MONTHS",
          display_order: "1",
          source_name: "Grand Hotel official website",
          source_url: "https://example.com/grand-hotel/about",
          verified: "1",
          verified_at: "2026-08-16",
        } as unknown as DeterministicV31CanonicalDestination["resources"][number],
      ],
    });

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.resources).toHaveLength(1);
    expect(result.resources[0]).toMatchObject({
      category: "hotels",
      name: "Grand Hotel",
      url: "https://example.com/grand-hotel",
      description: "A centrally located hotel.",
      official: "0",
      stayModeKey: "SHORT_1_3_MONTHS",
      sourceName: "Grand Hotel official website",
      sourceUrl: "https://example.com/grand-hotel/about",
      verified: "1",
      verifiedAt: "2026-08-16",
    });
  });

  it("leaves description/official/stayModeKey/sourceName/sourceUrl/verified/verifiedAt null when the canonical RESOURCES row has no value, without fabricating any of them", () => {
    const canonicalDestination = createCanonicalDestination({
      resources: [
        {
          destination_key: "dest-a",
          resource_key: "resource-1",
          resource_category: "hotels",
          resource_name: "Grand Hotel",
          description: null,
          url: "https://example.com/grand-hotel",
          official: null,
          stay_mode_key: null,
          display_order: null,
          source_name: null,
          source_url: null,
          verified: null,
          verified_at: null,
        } as unknown as DeterministicV31CanonicalDestination["resources"][number],
      ],
    });

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.resources[0]).toMatchObject({
      description: null,
      official: null,
      stayModeKey: null,
      sourceName: null,
      sourceUrl: null,
      verified: null,
      verifiedAt: null,
    });
  });

  it("preserves description, official, sourceUrl, verified, and verifiedAt for a real PROPERTY_RESOURCES row", () => {
    const canonicalDestination = createCanonicalDestination({
      propertyResources: [
        {
          destination_key: "dest-a",
          resource_key: "property-1",
          transaction_type: "rent",
          resource_name: "Local Rentals Agency",
          resource_type: "rental_agency",
          url: "https://example.com/rentals",
          official: "0",
          description: "A local rental agency.",
          source_url: "https://example.com/rentals/about",
          verified: "1",
          verified_at: "2026-08-16",
        } as unknown as DeterministicV31CanonicalDestination["propertyResources"][number],
      ],
    });

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.propertyResources).toHaveLength(1);
    expect(result.propertyResources[0]).toMatchObject({
      category: "rental_agency",
      name: "Local Rentals Agency",
      url: "https://example.com/rentals",
      description: "A local rental agency.",
      official: "0",
      sourceUrl: "https://example.com/rentals/about",
      verified: "1",
      verifiedAt: "2026-08-16",
    });
  });

  it("leaves description/official/sourceUrl/verified/verifiedAt null when the canonical PROPERTY_RESOURCES row has no value, without fabricating any of them", () => {
    const canonicalDestination = createCanonicalDestination({
      propertyResources: [
        {
          destination_key: "dest-a",
          resource_key: "property-1",
          transaction_type: "rent",
          resource_name: "Local Rentals Agency",
          resource_type: "rental_agency",
          url: "https://example.com/rentals",
          official: null,
          description: null,
          source_url: null,
          verified: null,
          verified_at: null,
        } as unknown as DeterministicV31CanonicalDestination["propertyResources"][number],
      ],
    });

    const result = mapCanonicalDestinationToStoredState(canonicalDestination);

    expect(result.propertyResources[0]).toMatchObject({
      description: null,
      official: null,
      sourceUrl: null,
      verified: null,
      verifiedAt: null,
    });
  });
});

