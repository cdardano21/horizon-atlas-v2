import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import LifestyleRecreationSection from "./LifestyleRecreationSection";

type LifestyleFeature = ComponentProps<typeof LifestyleRecreationSection>["lifestyleFeatures"][number];

function feature(overrides: Partial<LifestyleFeature>): LifestyleFeature {
  return {
    recordKey: "feature-1",
    featureGroup: null,
    featureKey: "community",
    featureValue: null,
    availabilityLevel: null,
    proximityBand: null,
    displayLabel: "Community & social life",
    evidenceSummary: "A meaningful community summary.",
    sourceName: null,
    sourceUrl: null,
    confidence: null,
    matchingEnabled: null,
    displayEnabled: "YES",
    ...overrides,
  };
}

describe("LifestyleRecreationSection", () => {
  it("shows separate website and Maps actions for a named place with both stored links", () => {
    render(
      <LifestyleRecreationSection
        destinationCity="Alghero"
        destinationCountry="Italy"
        lifestyleFeatures={[feature({ featureKey: "dining", displayLabel: "Dining" })]}
        places={[{
          placeKey: "alghero-restaurant",
          category: "restaurant",
          name: "Al Tuguri",
          description: "A named dining recommendation.",
          neighborhoodKey: "centro-storico",
          websiteUrl: "https://altuguri.example-test.invalid/",
          googleMapsUrl: "https://maps.example-test.invalid/al-tuguri",
          sourceUrl: "https://altuguri.example-test.invalid/",
          address: null,
          phone: null,
          displayOrder: "1",
        }]}
      />,
    );

    expect(screen.getByRole("link", { name: "Visit website" })).toHaveAttribute("href", "https://altuguri.example-test.invalid/");
    expect(screen.getByRole("link", { name: "Open on Google Maps" })).toHaveAttribute("href", "https://maps.example-test.invalid/al-tuguri");
  });

  it("allows a long availability pill to wrap within a narrow card", () => {
    render(
      <LifestyleRecreationSection
        lifestyleFeatures={[feature({ availabilityLevel: "LIMITED", proximityBand: "WITHIN_30_MIN" })]}
      />,
    );

    const pill = screen.getByText("Available, but limited — within about 30 minutes");
    expect(pill).toHaveClass("max-w-full", "whitespace-normal", "break-words");
    expect(pill).toHaveClass("sm:max-w-none", "sm:shrink-0", "sm:whitespace-nowrap");
    expect(pill).not.toHaveClass("shrink-0");
  });

  it("does not render a label-only card after duplicate evidence is suppressed", () => {
    const overview = "This approved overview is long enough to be compared and should not appear in a hollow card.";
    render(
      <LifestyleRecreationSection
        overviewText={overview}
        lifestyleFeatures={[
          feature({ recordKey: "empty-card", evidenceSummary: overview }),
          feature({ recordKey: "real-card", featureKey: "dining", displayLabel: "Dining", evidenceSummary: "Independent dining evidence remains visible." }),
        ]}
      />,
    );

    expect(screen.queryByText("Community & social life")).not.toBeInTheDocument();
    expect(screen.getByText("Independent dining evidence remains visible.")).toBeInTheDocument();
  });

  it("removes only an earlier card's repeated leading prose from a later card", () => {
    const shared = "This destination has a compact center, active public spaces, and a strong everyday identity.";
    render(
      <LifestyleRecreationSection
        lifestyleFeatures={[
          feature({ recordKey: "community", displayLabel: "Community & setting", evidenceSummary: shared }),
          feature({ recordKey: "nature", featureKey: "natural_setting", displayLabel: "Nature & surroundings", evidenceSummary: `${shared} River paths and wooded hills add distinct outdoor context.` }),
        ]}
      />,
    );

    expect(screen.getByText(shared)).toBeInTheDocument();
    expect(screen.getByText("River paths and wooded hills add distinct outdoor context.")).toBeInTheDocument();
    expect(screen.queryByText(`${shared} River paths and wooded hills add distinct outdoor context.`)).not.toBeInTheDocument();
  });
});