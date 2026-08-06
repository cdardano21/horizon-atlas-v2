import { describe, expect, it } from "vitest";
import { enrichDestination, enrichedDestinations } from "./destination-enrichment";
import { destinations } from "./destinations";
import { getDestinationResearchProfile } from "./destination-research";
import { buildExternalNarrativeSet } from "../../scripts/external-source-narrative.mjs";

describe("destination enrichment", () => {
  it("builds destination prose from external-source evidence rather than fallback phrasing", () => {
    const narrative = buildExternalNarrativeSet(
      "Nafplio",
      "Greece",
      "Nafplio is a historic coastal city known for its Venetian architecture, the Palamidi fortress, the Bourtzi island castle, and a walkable old town.",
      "Google results mention the Arvanitia Promenade, the archaeological museum, and the nearby Mycenae and Epidaurus sites.",
    );

    expect(narrative.description).toContain("Nafplio");
    expect(narrative.description).toContain("historic");
    expect(narrative.description).toContain("fortress");
    expect(narrative.overview).toContain("longer stays");
    expect(narrative.description).not.toMatch(/placeholder|fallback|city center/i);
  });

  it("uses place-specific catalog prose for major destinations instead of boilerplate", () => {
    const nafplio = destinations.find((destination) => destination.slug === "nafplio-greece");
    const rome = destinations.find((destination) => destination.slug === "rome-italy");
    const braga = destinations.find((destination) => destination.slug === "braga-portugal");

    expect(nafplio?.description).toContain("fortress");
    expect(nafplio?.description).toContain("harbor");
    expect(rome?.description).toContain("ancient");
    expect(rome?.description).toContain("piazza");
    expect(braga?.description).toContain("churches");
    expect(braga?.description).toContain("squares");
  });

  it("surfaces Nafplio’s landmark-led description details instead of generic coastal phrasing", () => {
    const destination = destinations.find((item) => item.slug === "nafplio-greece");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const narrative = `${enriched.description} ${enriched.overview}`.toLowerCase();

    expect(narrative).toContain("palamidi");
    expect(narrative).toContain("bourtzi");
    expect(narrative).toContain("akronafplia");
    expect(narrative).toContain("arvanitia");
    expect(narrative).toContain("mycenae");
    expect(narrative).toContain("epidaurus");
  });

  it("replaces legacy narrative templates with destination-specific prose", () => {
    const seed = destinations.find((destination) => /long-stay-first DRI 9\.0 model|long-stay model|verify before commitment/i.test(destination.overview))
      ?? destinations.find((destination) => Boolean(destination.overview))
      ?? destinations[0];

    expect(seed).toBeDefined();

    const enriched = enrichDestination(seed!);

    expect(enriched.description).not.toMatch(/Residency context|Tax context|ordinary weekday|compare daily life|test whether/i);
    expect(enriched.description).toContain(seed!.city);
    expect(enriched.overview).not.toMatch(/Residency context|Tax context|ordinary weekday/i);
  });

  it("avoids generic city-center placeholders in generated narratives", () => {
    const destination = destinations.find((item) => item.slug === "cape-town-south-africa");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const description = enriched.description.toLowerCase();

    expect(description).not.toContain("cape town center");
    expect(description).not.toContain("cape town dining scene");
    expect(description).not.toContain("cape town waterfront");
  });

  it("uses geography-aware cues for coastal destinations", () => {
    const destination = destinations.find((item) => item.slug === "cavtat-croatia");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const description = enriched.description.toLowerCase();

    expect(description).toMatch(/harbor|shore|waterfront|promenade|bay|sea/i);
  });

  it("uses seeded neighborhood and transport anchors in fallback narratives", () => {
    const destination = destinations.find((item) => item.slug === "bologna-italy");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const combined = `${enriched.description} ${enriched.overview}`.toLowerCase();

    expect(combined).toMatch(/bologna|neighborhood|transport|daily rhythm|food/i);
    expect(combined).not.toContain("city center");
  });

  it("uses a destination-specific voice for Cascais rather than generic coastal copy", () => {
    const destination = destinations.find((item) => item.slug === "cascais-portugal");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const narrative = `${enriched.description} ${enriched.overview}`.toLowerCase();

    expect(narrative).toMatch(/estuary|atlantic|promenade|seafront|marina|cascais/i);
  });

  it("uses a destination-specific voice for Monopoli rather than generic coastal copy", () => {
    const destination = destinations.find((item) => item.slug === "monopoli-italy");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const narrative = `${enriched.description} ${enriched.overview}`.toLowerCase();

    expect(narrative).toMatch(/harbor|promenade|sea|monopoli|waterfront/i);
  });

  it("keeps Barcelona anchored to the specific art, architecture, and museum details you provided", () => {
    const destination = destinations.find((item) => item.slug === "barcelona-spain");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const narrative = `${enriched.description} ${enriched.overview}`.toLowerCase();

    expect(narrative).toContain("sagrada família");
    expect(narrative).toContain("gaudí");
    expect(narrative).toContain("museu picasso");
    expect(narrative).toContain("fundació joan miró");
    expect(narrative).toContain("muhba");
    expect(narrative).toContain("roman archaeological");
  });

  it("uses place-specific language in the raw catalog rather than generic location boilerplate", () => {
    const cavtat = destinations.find((item) => item.slug === "cavtat-croatia")?.description ?? "";
    const rome = destinations.find((item) => item.slug === "rome-italy")?.description ?? "";
    const cascais = destinations.find((item) => item.slug === "cascais-portugal")?.description ?? "";

    expect(cavtat).toMatch(/harbor|waterfront|bay|promenade|adriatic|coast/i);
    expect(rome).toMatch(/piazza|district|neighborhood|ancient|daily rhythm|river|café/i);
    expect(cascais).toMatch(/atlantic|promenade|marina|seafront|estuary|coast/i);
  });

  it("uses place-specific anchors for a broader set of destinations", () => {
    const cavtat = enrichDestination(destinations.find((item) => item.slug === "cavtat-croatia")!);
    const porto = enrichDestination(destinations.find((item) => item.slug === "porto-portugal")!);
    const hiroshima = enrichDestination(destinations.find((item) => item.slug === "hiroshima-japan")!);
    const kobe = enrichDestination(destinations.find((item) => item.slug === "kobe-japan")!);
    const tivat = enrichDestination(destinations.find((item) => item.slug === "tivat-montenegro")!);
    const monolpoli = enrichDestination(destinations.find((item) => item.slug === "monopoli-italy")!);
    const braga = enrichDestination(destinations.find((item) => item.slug === "braga-portugal")!);

    expect(cavtat.description).toMatch(/rat peninsula|promenade|adriatic|harbor/i);
    expect(porto.description).toMatch(/douro|tiled|market streets|river city/i);
    expect(hiroshima.description).toMatch(/river paths|tram corridors|neighborhood services/i);
    expect(kobe.description).toMatch(/hillside|harbor city|food|waterfront/i);
    expect(tivat.description).toMatch(/marina|bay|yacht|bridge views/i);
    expect(monolpoli.description).toMatch(/whitewashed|harbor|stone alleys|market/i);
    expect(braga.description).toMatch(/hilltop|churches|shaded lanes|squares/i);
  });

  it("frames flagship narratives around relocation and long-stay living rather than retirement", () => {
    const cavtat = enrichDestination(destinations.find((item) => item.slug === "cavtat-croatia")!);
    const hiroshima = enrichDestination(destinations.find((item) => item.slug === "hiroshima-japan")!);
    const kobe = enrichDestination(destinations.find((item) => item.slug === "kobe-japan")!);
    const combined = `${cavtat.description} ${cavtat.overview} ${hiroshima.description} ${kobe.overview}`.toLowerCase();

    expect(combined).toMatch(/long-stay|long stay|relocation/i);
    expect(combined).not.toMatch(/retirees?|retirement/i);
  });

  it("uses place-specific anchors for Tivat and Todos Santos rather than generic coastal copy", () => {
    const tivat = enrichDestination(destinations.find((item) => item.slug === "tivat-montenegro")!);
    const todosSantos = enrichDestination(destinations.find((item) => item.slug === "todos-santos-mexico")!);

    const tivatNarrative = `${tivat.description} ${tivat.overview}`.toLowerCase();
    const todosNarrative = `${todosSantos.description} ${todosSantos.overview}`.toLowerCase();

    expect(tivatNarrative).toMatch(/marina|bay|yacht|bridge views|waterfront/i);
    expect(todosNarrative).toMatch(/desert|pacific|art|gallery|surf|baja/i);
  });

  it("replaces generic catalog boilerplate with more place-led narrative copy", () => {
    const genericMatches = destinations.filter((destination) => {
      const combined = `${destination.description} ${destination.overview} ${destination.climate} ${destination.lifestyle} ${destination.transportation}`.toLowerCase();
      return /the climate shapes daily life and comfort planning|daily life usually centers on local routines|mobility is strongest when the home base keeps everyday services and arrivals close/i.test(combined);
    }).slice(0, 5).map((destination) => destination.slug);

    expect(genericMatches).toEqual([]);
  });

  it("uses city-specific copy in every destination entry rather than generic fallback templates", () => {
    const genericMatches = destinations.filter((destination) => {
      const combined = `${destination.description} ${destination.overview}`.toLowerCase();
      return /is a destination in/.test(combined) || /works well for longer stays because it combines/.test(combined);
    }).map((destination) => destination.slug);

    expect(genericMatches).toEqual([]);
  });

  it("prefers richer catalog prose when a destination already has place-specific narrative copy", () => {
    const destination = destinations.find((item) => item.slug === "maringa-brazil");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const narrative = `${enriched.description} ${enriched.overview}`.toLowerCase();

    expect(narrative).toMatch(/compact streets|small local shops|maringa/i);
  });

  it("keeps the broader catalog free of retirement framing in enriched narratives", () => {
    const matches = enrichedDestinations
      .filter((destination) => {
        const combined = `${destination.description} ${destination.overview} ${destination.lifestyle} ${destination.transportation} ${destination.climate}`.toLowerCase();
        return /retirees?|retirement/i.test(combined);
      })
      .map((destination) => destination.slug);

    expect(matches).toEqual([]);
  });

  it("keeps Barcelona available as a public destination", () => {
    const barcelona = destinations.find((destination) => destination.slug === "barcelona-spain");
    const publicBarcelona = enrichedDestinations.find((destination) => destination.slug === "barcelona-spain");

    expect(barcelona).toBeDefined();
    expect(publicBarcelona?.city).toBe("Barcelona");
    expect(publicBarcelona?.country).toBe("Spain");
  });

  it("gives Barcelona neighborhood-level detail rather than generic city copy", () => {
    const barcelona = destinations.find((destination) => destination.slug === "barcelona-spain");

    expect(barcelona).toBeDefined();

    const combined = `${barcelona?.description} ${barcelona?.overview} ${barcelona?.lifestyle} ${barcelona?.transportation}`.toLowerCase();

    expect(combined).toMatch(/gràcia|poblenou|montjuïc|eixample|sant antoni|sarrià/i);
    expect(combined).toMatch(/metro|bus|tram|airport/i);
  });

  it("applies relocation-first practical language to every destination in the catalog", () => {
    const misses = enrichedDestinations.filter((destination) => {
      const combined = `${destination.description} ${destination.overview}`.toLowerCase();
      return !/(daily|district|routine|home base|home-base|neighborhood|errands|transport|mobility|long-stay|long stay|housing)/i.test(combined);
    }).slice(0, 10).map((destination) => destination.slug);

    expect(misses).toEqual([]);
  });

  it("keeps the raw destination catalog free of retirement-facing wording", () => {
    const matches = destinations
      .filter((destination) => {
        const combined = `${destination.description} ${destination.overview} ${destination.lifestyle} ${destination.transportation} ${destination.climate}`.toLowerCase();
        return /retirees?|retirement/i.test(combined);
      })
      .map((destination) => destination.slug);

    expect(matches).toEqual([]);
  });

  it("maps existing destination content into the new editorial schema", () => {
    const destination = enrichDestination(destinations.find((item) => item.slug === "valencia-spain")!);

    expect(destination.title).toBe(destination.city);
    expect(destination.introduction).toBe(destination.description);
    expect(destination.heroNarrative).toBe(destination.overview);
    expect(destination.lifestyleNarrative).toBe(destination.lifestyle);
    expect(destination.climateNarrative).toBe(destination.climate);
    expect(destination.transportationNarrative).toBe(destination.transportation);
    expect(destination.verdict).toBe(destination.description);
  });

  it("gives Rome place-specific long-stay copy rather than generic city-center prose", () => {
    const destination = destinations.find((item) => item.slug === "rome-italy");

    expect(destination).toBeDefined();
    expect(destination?.description).toContain("Trastevere");
    expect(destination?.description).toContain("Tiber");
    expect(destination?.overview).toContain("Trastevere");
    expect(destination?.overview).toContain("Tiber");
    expect(destination?.description).not.toContain("city center");
  });

  it("uses a destination-specific voice for Rome rather than generic city copy", () => {
    const destination = destinations.find((item) => item.slug === "rome-italy");

    expect(destination).toBeDefined();

    const enriched = enrichDestination(destination!);
    const narrative = `${enriched.description} ${enriched.overview}`.toLowerCase();

    expect(narrative).toMatch(/rome|neighborhood|piazza|daily rhythm|ancient/i);
  });

  it("builds a research profile for destinations from the catalog even without an explicit profile record", () => {
    const destination = destinations.find((item) => item.slug === "valencia-spain");

    expect(destination).toBeDefined();

    const profile = getDestinationResearchProfile(destination!);

    expect(profile.overview).toContain(destination!.city);
    expect(profile.bestNeighborhoods?.length).toBeGreaterThan(0);
    expect(profile.pros?.length).toBeGreaterThan(0);
  });

  it("uses the specific Cavtat landmarks surfaced in research rather than generic coastal placeholders", () => {
    const destination = destinations.find((item) => item.slug === "cavtat-croatia");

    expect(destination).toBeDefined();

    const profile = getDestinationResearchProfile(destination!);
    const combinedText = [profile.attractions, profile.hiddenGems, profile.museums, profile.parks].flat().join(" ").toLowerCase();

    expect(combinedText).toContain("rat peninsula");
    expect(combinedText).toContain("bukovac house museum");
    expect(combinedText).toContain("cavtat harbor");
  });

  it("keeps Rome, Chiang Mai, and Mexico City anchored in city-specific research details", () => {
    const rome = getDestinationResearchProfile(destinations.find((item) => item.slug === "rome-italy")!);
    const chiangMai = getDestinationResearchProfile(destinations.find((item) => item.slug === "chiang-mai-thailand")!);
    const mexicoCity = getDestinationResearchProfile(destinations.find((item) => item.slug === "mexico-city-mexico")!);

    const romeText = [rome.attractions, rome.hiddenGems, rome.museums, rome.food].flat().join(" ").toLowerCase();
    const chiangMaiText = [chiangMai.attractions, chiangMai.hiddenGems, chiangMai.food, chiangMai.bestNeighborhoods].flat().join(" ").toLowerCase();
    const mexicoCityText = [mexicoCity.attractions, mexicoCity.hiddenGems, mexicoCity.museums, mexicoCity.food].flat().join(" ").toLowerCase();

    expect(romeText).toContain("trastevere");
    expect(chiangMaiText).toContain("temples");
    expect(mexicoCityText).toContain("centro histórico");
  });

  it("preserves explicit research profiles for Málaga and Penang", () => {
    const malaga = getDestinationResearchProfile(destinations.find((item) => item.slug === "malaga-spain")!);
    const penang = getDestinationResearchProfile(destinations.find((item) => item.slug === "penang-malaysia")!);

    expect(malaga.overview).toContain("Málaga");
    expect(malaga.bestNeighborhoods).toContain("The historic center");
    expect(penang.overview).toContain("Penang");
    expect(penang.food).toContain("Street food and hawker culture");
  });

  it("preserves explicit research profiles for Hiroshima, Kobe, and Zagreb", () => {
    const hiroshima = getDestinationResearchProfile(destinations.find((item) => item.slug === "hiroshima-japan")!);
    const kobe = getDestinationResearchProfile(destinations.find((item) => item.slug === "kobe-japan")!);
    const zagreb = getDestinationResearchProfile(destinations.find((item) => item.slug === "zagreb-croatia")!);

    expect(hiroshima.overview).toContain("Hiroshima");
    expect(hiroshima.attractions).toContain("Peace Memorial Park");
    expect(kobe.overview).toContain("Kobe");
    expect(kobe.food).toContain("Seafood and harbor dining");
    expect(zagreb.overview).toContain("Zagreb");
    expect(zagreb.bestNeighborhoods).toContain("Upper Town");
  });

  it("keeps the full destination catalog free of legacy narrative patterns", () => {
    const legacyMatches = enrichedDestinations.flatMap((destination) => {
      const fields = [destination.description, destination.overview, destination.climate, destination.lifestyle, destination.transportation];
      return fields
        .filter((value): value is string => Boolean(value))
        .filter((value) => /Residency context|Tax context|ordinary weekday|week after week|test everyday essentials|run a normal day|lived-in place|DRI signal|source expansion underway|professional review needed/i.test(value))
        .map((value) => `${destination.slug}: ${value}`);
    });

    expect(legacyMatches).toEqual([]);
  });
});
