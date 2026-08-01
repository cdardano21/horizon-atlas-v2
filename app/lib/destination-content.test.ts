import { describe, expect, it } from "vitest";
import { buildVisibleEditorialNarratives, resolveDestinationSlug, selectEditorialNarrative } from "./destination-content";

describe("destination content narrative selection", () => {
  it("prefers the source-backed catalog narrative when it is strong", () => {
    const selected = selectEditorialNarrative(
      "Cavtat is an Adriatic harbor town where the promenade, the old center, and the Rat Peninsula walk all shape the same calm daily loop.",
      "Porto is a city of river light, tiled facades, and streets that make you slow down.",
      "Fallback narrative",
    );

    expect(selected).toContain("Cavtat");
    expect(selected).not.toContain("Porto");
  });

  it("returns empty text when the catalog copy is weak and no source-only narrative exists", () => {
    const selected = selectEditorialNarrative(
      "A tier destination with standout scores for walkability and safety.",
      "A polished coastal city with strong weather, easy cafés, and a daily rhythm that feels graceful rather than hectic.",
      "Fallback narrative",
    );

    expect(selected).toBe("");
  });

  it("does not use legacy local fallback copy when no source-backed narrative is available", () => {
    const selected = selectEditorialNarrative(
      null,
      "This is a generic local fallback narrative that should not be used for source-only destinations.",
      "",
    );

    expect(selected).toBe("");
  });

  it("uses description and overview before older intro and hero narrative fields", () => {
    const result = buildVisibleEditorialNarratives(
      {
        description: "Cavtat is an Adriatic harbor town where the promenade, the old center, and the Rat Peninsula walk all shape the same calm daily loop.",
        overview: "Cavtat works best when the long-stay case is built around a compact waterfront base, easy walks, and a simple routine that feels local rather than resort-like.",
        lifestyle: "A good week here usually means harbor breakfasts, a swim, a slow promenade stroll, a coffee, and dinner within a short radius of home.",
        climate: "The Adriatic climate keeps summer warm and bright while the shoulder seasons stay long enough for outdoor living, swimming, and evening walks without much fuss.",
        transportation: "Mobility is strongest when your base keeps the harbor, daily services, cafés, and the Dubrovnik connection within a compact and manageable loop.",
        introduction: "This is an old intro that should not override the new narrative.",
        heroNarrative: "This is an old hero narrative that should not override the new narrative.",
        lifestyleNarrative: "",
        climateNarrative: "",
        transportationNarrative: "",
        verdict: "",
      },
      null,
      {
        intro: "Fallback intro",
        follow: "Fallback follow",
        dek: "Fallback dek",
        quote: "Fallback quote",
      },
    );

    expect(result.editorial.intro).toContain("Cavtat is an Adriatic harbor town");
    expect(result.editorial.follow).toContain("Cavtat works best");
    expect(result.magazine.opening).toContain("A good week here usually means harbor breakfasts");
  });

  it("avoids repeating the same paragraph across editorial narrative slots", () => {
    const result = buildVisibleEditorialNarratives(
      {
        description: "This is the same paragraph repeated across the page.",
        overview: "This is the same paragraph repeated across the page.",
        lifestyle: "This is the same paragraph repeated across the page.",
        climate: "This is the same paragraph repeated across the page.",
        transportation: "This is the same paragraph repeated across the page.",
      },
      null,
      {
        intro: "Fallback intro",
        follow: "Fallback follow",
        dek: "Fallback dek",
        quote: "Fallback quote",
      },
    );

    expect(result.editorial.intro).toContain("same paragraph");
    expect(result.editorial.follow).not.toBe(result.editorial.intro);
    expect(result.editorial.dek).not.toBe(result.editorial.intro);
    expect(result.magazine.opening).not.toBe(result.magazine.middle);
  });

  it("resolves city-only aliases to the canonical destination slug", () => {
    expect(resolveDestinationSlug("cavtat")).toBe("cavtat-croatia");
    expect(resolveDestinationSlug("hiroshima")).toBe("hiroshima-japan");
  });
});
