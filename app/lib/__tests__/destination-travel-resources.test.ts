import { describe, expect, it } from "vitest";
import { buildGeneratedScalarDiscoveryLinks, buildGeneratedTravelResources, mergeAuthoredAndGeneratedResources } from "../destination-travel-resources";

describe("destination-travel-resources: buildGeneratedTravelResources", () => {
  it("produces a hotel search generically for any public name/country", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Ascoli Piceno", country: "Italy" });
    const hotel = resources.find((r) => r.category === "hotels");
    expect(hotel).toBeDefined();
    expect(hotel!.url).toContain("booking.com");
    expect(hotel!.url).toContain("Ascoli%20Piceno");
  });

  it("produces an Airbnb search generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    const airbnb = resources.find((r) => r.provider === "Airbnb");
    expect(airbnb).toBeDefined();
    expect(airbnb!.url).toContain("airbnb.com/s/");
  });

  it("produces a Vrbo search generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    const vrbo = resources.find((r) => r.label === "Search Vrbo");
    expect(vrbo).toBeDefined();
    expect(vrbo!.url).toContain("vrbo.com");
  });

  it("produces short-term-rental and long-term-rental searches generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    expect(resources.some((r) => r.label === "Search short-term rentals")).toBe(true);
    expect(resources.some((r) => r.label === "Search long-term rentals")).toBe(true);
  });

  it("produces a rental-car search generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    const rentalCar = resources.find((r) => r.label === "Search rental cars");
    expect(rentalCar).toBeDefined();
    expect(rentalCar!.category).toBe("transportation");
  });

  it("produces a tours-and-activities search generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    expect(resources.some((r) => r.label === "Find tours and activities")).toBe(true);
  });

  it("produces an airport-transfer search generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    expect(resources.some((r) => r.label === "Find airport transfers")).toBe(true);
  });

  it("produces a local-transportation search generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    expect(resources.some((r) => r.label === "Find local transportation")).toBe(true);
  });

  it("produces a property-for-sale search generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    expect(resources.some((r) => r.label === "Search property for sale")).toBe(true);
  });

  it("produces a Facebook discovery search generically (no scalar link slot exists for it) via a Google search restricted to facebook.com, not Facebook's own ineffective internal search", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    const facebook = resources.find((r) => r.provider === "Facebook");
    expect(facebook).toBeDefined();
    expect(facebook!.category).toBe("social-discovery");
    expect(facebook!.label).toBe("Search Facebook");
    expect(facebook!.url).toContain("https://www.google.com/search?q=");
    expect(facebook!.url).toContain("site%3Afacebook.com");
    expect(facebook!.url).not.toContain("facebook.com/search/top");
  });

  const ALL_TEN_DESTINATIONS = [
    { key: "the-villages-fl-us", publicName: "The Villages", country: "United States" },
    { key: "sofia-bg", publicName: "Sofia", country: "Bulgaria" },
    { key: "puerto-vallarta-mx", publicName: "Puerto Vallarta", country: "Mexico" },
    { key: "hoi-an-vn", publicName: "Hoi An", country: "Vietnam" },
    { key: "queenstown-nz", publicName: "Queenstown", country: "New Zealand" },
    { key: "ascoli-piceno-it", publicName: "Ascoli Piceno", country: "Italy" },
    { key: "sarande-al", publicName: "Sarandë", country: "Albania" },
    { key: "dumaguete-ph", publicName: "Dumaguete City", country: "Philippines" },
    { key: "las-terrenas-do", publicName: "Las Terrenas", country: "Dominican Republic" },
    { key: "fairhope-al-us", publicName: "Fairhope", country: "United States" },
  ] as const;

  describe("Facebook discovery link (Google search restricted to facebook.com) across all ten Batch #1 and Batch #2 destinations", () => {
    for (const { key, publicName, country } of ALL_TEN_DESTINATIONS) {
      it(`${key}: receives a Google-restricted Facebook search with the correct public name and country, no destination_key exposed`, () => {
        const resources = buildGeneratedTravelResources({ publicName, country });
        const facebook = resources.find((r) => r.provider === "Facebook")!;
        expect(facebook).toBeDefined();
        expect(facebook.label).toBe("Search Facebook");
        expect(() => new URL(facebook.url)).not.toThrow();
        const parsed = new URL(facebook.url);
        expect(parsed.hostname).toBe("www.google.com");
        expect(parsed.pathname).toBe("/search");
        const q = parsed.searchParams.get("q") ?? "";
        expect(q).toContain("site:facebook.com");
        expect(q).toContain(publicName);
        expect(q).toContain(country);
        expect(facebook.url).not.toContain(key);
        expect(facebook.url.toLowerCase()).not.toContain("official");
        expect(facebook.url.toLowerCase()).not.toMatch(/\bverified\b/);
      });
    }
  });

  it("correctly URL-encodes Sarandë in the generated Facebook search query", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Sarandë", country: "Albania" });
    const facebook = resources.find((r) => r.provider === "Facebook")!;
    expect(facebook.url).toMatch(/Sarand%C3%AB/i);
    expect(() => new URL(facebook.url)).not.toThrow();
  });

  it("never marks the generated Facebook utility as official or verified and never fabricates provenance", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Ascoli Piceno", country: "Italy" });
    const facebook = resources.find((r) => r.provider === "Facebook")!;
    expect(facebook).not.toHaveProperty("official");
    expect(facebook).not.toHaveProperty("verified");
    expect(facebook.label.toLowerCase()).not.toMatch(/^official\b/);
  });

  it("does not change any other generated resource's URL or label (Facebook fix is isolated)", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    const byLabel = new Map(resources.map((r) => [r.label, r.url]));
    expect(byLabel.get("Search Google Maps")).toBe("https://www.google.com/maps/search/?api=1&query=Fairhope%20United%20States");
    expect(byLabel.get("Search Google Earth")).toBe("https://earth.google.com/web/search/Fairhope%20United%20States");
    expect(byLabel.get("Search hotels")).toBe("https://www.booking.com/searchresults.html?ss=Fairhope%20United%20States");
    expect(byLabel.get("Search Airbnb")).toBe("https://www.airbnb.com/s/Fairhope%2C%20United%20States/homes");
    expect(byLabel.get("Search Vrbo")).toBe("https://www.google.com/search?q=site%3Avrbo.com%20Fairhope%20United%20States");
    expect(byLabel.get("Search short-term rentals")).toBe("https://www.google.com/search?q=short-term%20rental%20Fairhope%20United%20States");
    expect(byLabel.get("Search long-term rentals")).toBe("https://www.google.com/search?q=long-term%20rental%20apartment%20Fairhope%20United%20States");
    expect(byLabel.get("Search property for sale")).toBe("https://www.google.com/search?q=property%20for%20sale%20Fairhope%20United%20States");
    expect(byLabel.get("Search rental cars")).toBe("https://www.google.com/search?q=rental%20cars%20Fairhope%20United%20States");
    expect(byLabel.get("Find airport transfers")).toBe("https://www.google.com/search?q=airport%20transfer%20Fairhope%20United%20States");
    expect(byLabel.get("Find local transportation")).toBe("https://www.google.com/search?q=public%20transportation%20Fairhope%20United%20States");
    expect(byLabel.get("Check destination weather")).toBe("https://www.google.com/search?q=weather%20Fairhope%20United%20States");
    expect(byLabel.get("Search local healthcare resources")).toBe("https://www.google.com/search?q=Fairhope%20United%20States%20hospitals%20and%20clinics");
    expect(byLabel.get("Search government and visa resources")).toBe("https://www.google.com/search?q=Fairhope%20United%20States%20residency%20and%20visa%20information");
    const scalarLinks = buildGeneratedScalarDiscoveryLinks({ publicName: "Fairhope", country: "United States" });
    expect(scalarLinks.youtubeUrl).toContain("youtube.com/results");
    expect(scalarLinks.tiktokUrl).toContain("tiktok.com/search");
    expect(scalarLinks.instagramUrl).toContain("instagram.com/explore/tags/");
    expect(scalarLinks.webcamUrl).toContain("google.com/search");
  });

  it("produces a weather resource generically", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    const weather = resources.find((r) => r.category === "weather");
    expect(weather).toBeDefined();
  });

  it("correctly URL-encodes accented/non-ASCII destination names such as Sarandë", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Sarandë", country: "Albania" });
    for (const resource of resources) {
      // Every generated URL must be well-formed and contain the percent-encoded form of "ë", never
      // a raw/invalid byte sequence.
      expect(() => new URL(resource.url)).not.toThrow();
    }
    const hotel = resources.find((r) => r.category === "hotels");
    expect(hotel!.url).toMatch(/Sarand%C3%AB|Sarand%C3%ab/i);
  });

  it("never marks a generated resource as official/verified (the resource shape has no such fields to begin with)", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Ascoli Piceno", country: "Italy" });
    for (const resource of resources) {
      expect(resource).not.toHaveProperty("official");
      expect(resource).not.toHaveProperty("verified");
      // A label may legitimately search FOR "official" info (e.g. "Search official tourism info"),
      // but must never claim the link itself IS the official/verified resource.
      expect(resource.label.toLowerCase()).not.toMatch(/^official\b/);
      expect(resource.label.toLowerCase()).not.toMatch(/\bverified\b/);
    }
  });

  it("never exposes a permanent destination_key in a generated label or URL", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Ascoli Piceno", country: "Italy" });
    for (const resource of resources) {
      expect(resource.label).not.toContain("ascoli-piceno-it");
      expect(resource.url).not.toContain("ascoli-piceno-it");
    }
  });

  it("returns an empty array (never a fabricated placeholder) for a destination with no real public name", () => {
    expect(buildGeneratedTravelResources({ publicName: "", country: "Italy" })).toEqual([]);
    expect(buildGeneratedTravelResources({ publicName: "   ", country: "Italy" })).toEqual([]);
  });

  it("uses a vacation-stays category that never collides with the pre-existing Housing group's broad /rental/ regex (regression for double-listed Airbnb/Vrbo items)", () => {
    const resources = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    const vacationItems = resources.filter((r) => /Airbnb|Vrbo|short-term rental/i.test(r.label));
    for (const item of vacationItems) {
      expect(item.category).not.toMatch(/housing|real estate|\brental\b|property/i);
      expect(item.category).toBe("vacation-stays");
    }
  });

  it("a synthetic future destination receives the exact same generated utilities with zero special-case code", () => {
    const real = buildGeneratedTravelResources({ publicName: "Ascoli Piceno", country: "Italy" });
    const synthetic = buildGeneratedTravelResources({ publicName: "Synthetic Future City", country: "Testland" });
    expect(synthetic.map((r) => r.category).sort()).toEqual(real.map((r) => r.category).sort());
    expect(synthetic.map((r) => r.label).sort()).toEqual(real.map((r) => r.label).sort());
  });
});

describe("destination-travel-resources: buildGeneratedScalarDiscoveryLinks", () => {
  it("produces YouTube/TikTok/Instagram/webcam discovery links without any workbook scalar column", () => {
    const links = buildGeneratedScalarDiscoveryLinks({ publicName: "Fairhope", country: "United States" });
    expect(links.youtubeUrl).toContain("youtube.com/results");
    expect(links.tiktokUrl).toContain("tiktok.com/search");
    expect(links.instagramUrl).toContain("instagram.com/explore/tags/");
    expect(links.webcamUrl).toContain("google.com/search");
  });

  it("produces googleMapsUrl/googleEarthUrl/wikipediaUrl utilities", () => {
    const links = buildGeneratedScalarDiscoveryLinks({ publicName: "Fairhope", country: "United States" });
    expect(links.googleMapsUrl).toContain("google.com/maps");
    expect(links.googleEarthUrl).toContain("earth.google.com");
    expect(links.wikipediaUrl).toContain("en.wikipedia.org/wiki/");
  });

  it("correctly URL-encodes Sarandë across every generated scalar link", () => {
    const links = buildGeneratedScalarDiscoveryLinks({ publicName: "Sarandë", country: "Albania" });
    for (const url of Object.values(links)) {
      expect(() => new URL(url)).not.toThrow();
    }
  });

  it("never exposes a permanent destination-key suffix (-it/-al/-ph/-do/-al-us) in a generated link", () => {
    const links = buildGeneratedScalarDiscoveryLinks({ publicName: "Ascoli Piceno", country: "Italy" });
    for (const url of Object.values(links)) {
      expect(url).not.toMatch(/ascoli-piceno-it/i);
    }
  });

  it("returns all-blank links (never fabricated) when there is no real public name", () => {
    const links = buildGeneratedScalarDiscoveryLinks({ publicName: "", country: "Italy" });
    expect(Object.values(links).every((url) => url === "")).toBe(true);
  });
});

describe("destination-travel-resources: mergeAuthoredAndGeneratedResources", () => {
  it("an authored resource overrides the generated utility for the same category", () => {
    const authored = [{ category: "hotels", label: "Grand Hotel Ascoli", url: "https://grandhotelascoli.example.com" }];
    const generated = buildGeneratedTravelResources({ publicName: "Ascoli Piceno", country: "Italy" });
    const merged = mergeAuthoredAndGeneratedResources(authored, generated);
    const hotelsInMerged = merged.filter((item) => item.category === "hotels");
    expect(hotelsInMerged).toHaveLength(1);
    expect(hotelsInMerged[0]).toBe(authored[0]);
  });

  it("does not suppress generated categories the authored set does not cover", () => {
    const authored = [{ category: "hotels", label: "Grand Hotel Ascoli", url: "https://grandhotelascoli.example.com" }];
    const generated = buildGeneratedTravelResources({ publicName: "Ascoli Piceno", country: "Italy" });
    const merged = mergeAuthoredAndGeneratedResources(authored, generated);
    expect(merged.some((item) => item.category === "transportation")).toBe(true);
    expect(merged.some((item) => item.category === "weather")).toBe(true);
  });

  it("eliminates duplicate links predictably (same URL never appears twice)", () => {
    const authored = [{ category: "maps", label: "Google Maps", url: "https://www.google.com/maps/search/?api=1&query=Ascoli%20Piceno%2C%20Italy" }];
    const generated = buildGeneratedTravelResources({ publicName: "Ascoli Piceno", country: "Italy" });
    const merged = mergeAuthoredAndGeneratedResources(authored, generated);
    const urls = merged.map((item) => item.url.toLowerCase());
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("a synthetic future destination with zero authored resources still receives the full generated set (no new loader code needed)", () => {
    const merged = mergeAuthoredAndGeneratedResources([], buildGeneratedTravelResources({ publicName: "Synthetic Future City", country: "Testland" }));
    expect(merged.length).toBeGreaterThan(10);
  });

  it("an authored Facebook (social-discovery) resource overrides the generated Facebook search utility", () => {
    const authored = [{ category: "social-discovery", label: "Fairhope, Alabama (Official Community Page)", url: "https://www.facebook.com/CityOfFairhopeAL" }];
    const generated = buildGeneratedTravelResources({ publicName: "Fairhope", country: "United States" });
    const merged = mergeAuthoredAndGeneratedResources(authored, generated);
    const socialDiscoveryItems = merged.filter((item) => item.category === "social-discovery");
    expect(socialDiscoveryItems).toHaveLength(1);
    expect(socialDiscoveryItems[0]).toBe(authored[0]);
    expect(socialDiscoveryItems.some((item) => item.url.includes("google.com/search"))).toBe(false);
  });

  it("a synthetic future destination receives the same generated Facebook search-restriction behavior with no loader changes", () => {
    const merged = mergeAuthoredAndGeneratedResources([], buildGeneratedTravelResources({ publicName: "Synthetic Future City", country: "Testland" }));
    const facebook = merged.find((item) => item.category === "social-discovery")!;
    expect(facebook.url).toContain("https://www.google.com/search?q=");
    expect(facebook.url).toContain("site%3Afacebook.com");
  });
});
