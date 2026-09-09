import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Destination } from "../../lib/destinations";
import DestinationSearch from "../DestinationSearch";

vi.mock("../FavoriteButton", () => ({
  default: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

const destinations: Destination[] = [
  {
    slug: "alba-coast-portugal",
    city: "Alba Coast",
    country: "Portugal",
    emoji: "",
    match: 91,
    description: "A walkable coastal city.",
    overview: "Atlantic living.",
    climate: "Warm",
    lifestyle: "Relaxed",
    transportation: "Connected",
    images: [],
    tags: ["beach", "walkability"],
  },
  {
    slug: "cedar-hills-france",
    city: "Cedar Hills",
    country: "France",
    emoji: "",
    match: 86,
    description: "A mountain city.",
    overview: "Alpine living.",
    climate: "Seasonal",
    lifestyle: "Active",
    transportation: "Connected",
    images: [],
    tags: ["mountains", "healthcare"],
  },
];

const destinationWithImages = (
  slug: string,
  city: string,
  imageUrls: string[],
): Destination => ({
  slug,
  city,
  country: "Portugal",
  emoji: "",
  match: 90,
  description: `${city} destination description.`,
  overview: `${city} destination overview.`,
  climate: "Warm",
  lifestyle: "Relaxed",
  transportation: "Connected",
  images: imageUrls.map((src, index) => ({
    src,
    alt: `${city} view ${index + 1}`,
    caption: `${city}, Portugal`,
  })),
  tags: ["coastal"],
});

const imageSource = (slug: string) =>
  decodeURIComponent(screen.getByTestId(`destination-image-${slug}`).getAttribute("src") ?? "");

describe("DestinationSearch", () => {
  it("preserves query, tag, clear, and destination-link behavior", () => {
    render(<DestinationSearch destinations={destinations} />);

    expect(screen.getByTestId("destination-card-alba-coast-portugal")).toHaveAttribute("href", "/destinations/alba-coast-portugal");
    expect(screen.getByTestId("destination-card-cedar-hills-france")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("destination-search-input"), { target: { value: "Alba" } });
    expect(screen.getByTestId("destination-card-alba-coast-portugal")).toBeInTheDocument();
    expect(screen.queryByTestId("destination-card-cedar-hills-france")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("destination-filters-clear"));
    fireEvent.click(screen.getByTestId("destination-filter-healthcare"));
    expect(screen.queryByTestId("destination-card-alba-coast-portugal")).not.toBeInTheDocument();
    expect(screen.getByTestId("destination-card-cedar-hills-france")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("destination-filters-clear"));
    expect(screen.getByTestId("destination-card-alba-coast-portugal")).toBeInTheDocument();
    expect(screen.getByTestId("destination-card-cedar-hills-france")).toBeInTheDocument();
  });

  it("stores query and filter state in the URL for navigation restoration", async () => {
    window.history.replaceState({}, "", "/destinations");
    render(<DestinationSearch destinations={destinations} />);

    fireEvent.change(screen.getByTestId("destination-search-input"), { target: { value: "Alba" } });
    fireEvent.click(screen.getByTestId("destination-filter-beach"));

    await waitFor(() => expect(window.location.search).toBe("?q=Alba&tag=beach"));
  });

  it("restores initial query and filter state from page props", () => {
    render(<DestinationSearch destinations={destinations} initialQuery="Alba" initialTags={["beach"]} />);

    expect(screen.getByTestId("destination-search-input")).toHaveValue("Alba");
    expect(screen.getByTestId("destination-filter-beach")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("destination-card-alba-coast-portugal")).toBeInTheDocument();
    expect(screen.queryByTestId("destination-card-cedar-hills-france")).not.toBeInTheDocument();
  });

  it("restores and consumes one-time session state after returning from a destination in Strict Mode", async () => {
    window.history.replaceState({}, "", "/destinations");
    window.sessionStorage.setItem("destinationfinder:explore-state", JSON.stringify({ query: "Alba", activeTags: ["beach"] }));

    const { unmount } = render(
      <StrictMode>
        <DestinationSearch destinations={destinations} />
      </StrictMode>,
    );

    await waitFor(() => expect(screen.getByTestId("destination-search-input")).toHaveValue("Alba"));
    expect(screen.getByTestId("destination-filter-beach")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("destination-card-alba-coast-portugal")).toBeInTheDocument();
    expect(screen.queryByTestId("destination-card-cedar-hills-france")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem("destinationfinder:explore-state")).toBeNull();

    unmount();
    window.history.replaceState({}, "", "/destinations");
    render(<DestinationSearch destinations={destinations} />);

    expect(screen.getByTestId("destination-search-input")).toHaveValue("");
    expect(screen.getByTestId("destination-filter-beach")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("destination-card-alba-coast-portugal")).toBeInTheDocument();
    expect(screen.getByTestId("destination-card-cedar-hills-france")).toBeInTheDocument();
  });

  it("stores current state when a destination opens", () => {
    window.sessionStorage.clear();
    render(<DestinationSearch destinations={destinations} initialQuery="Alba" initialTags={["beach"]} />);

    const destinationLink = screen.getByTestId("destination-card-alba-coast-portugal");
    destinationLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(destinationLink);

    expect(JSON.parse(window.sessionStorage.getItem("destinationfinder:explore-state") ?? "{}")).toEqual({
      query: "Alba",
      activeTags: ["beach"],
    });
  });

  it("does not expose internal catalog metadata as lifestyle filters", () => {
    const internal = { ...destinations[0], tags: ["official-sources", "verified-profile", "coastal"] };
    render(<DestinationSearch destinations={[internal]} />);

    expect(screen.queryByTestId("destination-filter-official-sources")).not.toBeInTheDocument();
    expect(screen.queryByTestId("destination-filter-verified-profile")).not.toBeInTheDocument();
    expect(screen.getByTestId("destination-filter-beach")).toBeInTheDocument();
  });

  it("renders the first verified image candidate", () => {
    const firstImage = "https://example.com/images/harbor-point-first.jpg";
    const destination = destinationWithImages("harbor-point-portugal", "Harbor Point", [firstImage]);

    render(<DestinationSearch destinations={[destination]} />);

    expect(imageSource(destination.slug)).toContain(firstImage);
  });

  it("advances to the next deduplicated same-destination image after a failure", () => {
    const firstImage = "https://example.com/images/harbor-point-first.jpg";
    const secondImage = "https://example.com/images/harbor-point-second.jpg";
    const destination = destinationWithImages("harbor-point-portugal", "Harbor Point", [firstImage, firstImage, secondImage]);

    render(<DestinationSearch destinations={[destination]} />);
    fireEvent.error(screen.getByTestId(`destination-image-${destination.slug}`));

    expect(imageSource(destination.slug)).toContain(secondImage);
  });

  it("shows the honest fallback after every verified image fails", () => {
    const destination = destinationWithImages("harbor-point-portugal", "Harbor Point", [
      "https://example.com/images/harbor-point-first.jpg",
      "https://example.com/images/harbor-point-second.jpg",
    ]);

    render(<DestinationSearch destinations={[destination]} />);
    fireEvent.error(screen.getByTestId(`destination-image-${destination.slug}`));
    fireEvent.error(screen.getByTestId(`destination-image-${destination.slug}`));

    expect(screen.queryByTestId(`destination-image-${destination.slug}`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`destination-image-fallback-${destination.slug}`)).toHaveTextContent("Imagery pending verification");
  });

  it("shows the honest fallback immediately for an empty verified candidate set", () => {
    const destination = destinationWithImages("harbor-point-portugal", "Harbor Point", []);

    render(<DestinationSearch destinations={[destination]} />);

    expect(screen.queryByTestId(`destination-image-${destination.slug}`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`destination-image-fallback-${destination.slug}`)).toHaveTextContent("Imagery pending verification");
  });

  it("never attempts an image owned by another destination", () => {
    const harborPoint = destinationWithImages("harbor-point-portugal", "Harbor Point", ["https://example.com/images/harbor-point.jpg"]);
    const riverGate = destinationWithImages("river-gate-portugal", "River Gate", ["https://example.com/images/river-gate.jpg"]);

    render(<DestinationSearch destinations={[harborPoint, riverGate]} />);
    expect(imageSource(harborPoint.slug)).toContain("harbor-point.jpg");
    fireEvent.error(screen.getByTestId(`destination-image-${harborPoint.slug}`));

    expect(screen.queryByTestId(`destination-image-${harborPoint.slug}`)).not.toBeInTheDocument();
    expect(imageSource(riverGate.slug)).toContain("river-gate.jpg");
  });
});