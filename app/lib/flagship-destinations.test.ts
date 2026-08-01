import { describe, expect, it } from "vitest";
import type { Destination } from "./destinations";
import { sortDestinationsForFeaturedPlacement } from "./flagship-destinations";

const makeDestination = (overrides: Partial<Destination>): Destination => ({
  slug: "sample-city",
  city: "Sample City",
  country: "Sample Country",
  emoji: "🌍",
  match: 0,
  description: "A calm retirement destination with strong daily routines.",
  overview: "A strong destination overview.",
  climate: "Comfortable climate.",
  lifestyle: "Balanced lifestyle.",
  transportation: "Easy transport links.",
  images: [],
  tags: [],
  ...overrides,
});

describe("sortDestinationsForFeaturedPlacement", () => {
  it("promotes flagship destinations and richer content ahead of generic placeholders", () => {
    const destinations = [
      makeDestination({ slug: "zanzibar-tanzania", city: "Zanzibar", country: "Tanzania", images: [] }),
      makeDestination({ slug: "valencia-spain", city: "Valencia", country: "Spain", images: [{ src: "/valencia.jpg", alt: "Valencia", caption: "Valencia" }], tags: ["safety", "healthcare", "walkability"] }),
      makeDestination({ slug: "porto-portugal", city: "Porto", country: "Portugal", images: [{ src: "/porto.jpg", alt: "Porto", caption: "Porto" }], tags: ["culture"] }),
      makeDestination({ slug: "nantes-france", city: "Nantes", country: "France", images: [] }),
      makeDestination({ slug: "cartago-costa-rica", city: "Cartago", country: "Costa Rica", images: [] }),
    ];

    const ordered = sortDestinationsForFeaturedPlacement(destinations);

    expect(ordered[0]?.slug).toBe("valencia-spain");
    expect(ordered[1]?.slug).toBe("porto-portugal");
    expect(ordered[2]?.slug).toBe("cartago-costa-rica");
    expect(ordered[3]?.slug).toBe("zanzibar-tanzania");
    expect(ordered[4]?.slug).toBe("nantes-france");
  });
});
