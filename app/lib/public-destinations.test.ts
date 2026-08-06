import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Destination } from "./destinations";
import { buildPublicDestinationCatalogList, getPublicDestinations } from "./public-destinations";
import { supabaseFetch } from "./supabase";

const { mockIsSupabaseConfigured, mockListAdminFallbackDestinations } = vi.hoisted(() => ({
  mockIsSupabaseConfigured: vi.fn(() => true),
  mockListAdminFallbackDestinations: vi.fn(() => []),
}));

vi.mock("./supabase", () => ({
  isSupabaseConfigured: mockIsSupabaseConfigured,
  supabaseFetch: vi.fn(),
}));

vi.mock("./admin-local-fallback", () => ({
  listAdminFallbackDestinations: mockListAdminFallbackDestinations,
}));

const mockedSupabaseFetch = vi.mocked(supabaseFetch);

describe("buildPublicDestinationCatalogList", () => {
  beforeEach(() => {
    mockIsSupabaseConfigured.mockReset();
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockListAdminFallbackDestinations.mockReset();
    mockListAdminFallbackDestinations.mockReturnValue([]);
    mockedSupabaseFetch.mockReset();
  });

  it("fetches a wider Supabase catalog window and filters published rows locally", async () => {
    mockedSupabaseFetch.mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "row-5",
            slug: "newly-imported-city",
            city: "Newly Imported City",
            country: "Portugal",
            status: "Published",
            description: "Published row overview",
            overview: "Published row detail",
            metadata: {},
          },
          {
            id: "row-6",
            slug: "draft-city",
            city: "Draft City",
            country: "Portugal",
            status: "draft",
            description: "Draft row overview",
            overview: "Draft row detail",
            metadata: {},
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const list = await getPublicDestinations();

    expect(mockedSupabaseFetch).toHaveBeenCalledWith(
      expect.stringContaining("limit=1000"),
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(list.some((destination) => destination.slug === "newly-imported-city")).toBe(true);
    expect(list.some((destination) => destination.slug === "draft-city")).toBe(false);
  });

  it("includes published destinations from the admin fallback store when Supabase is unavailable", async () => {
    mockIsSupabaseConfigured.mockReturnValue(false);
    mockListAdminFallbackDestinations.mockReturnValue([
      {
        id: "fallback-1",
        slug: "redmond-wa-usa",
        city: "Redmond",
        country: "United States",
        status: "published",
        description: "Fallback published overview",
        overview: "Fallback published detail",
        updated_at: "2024-01-01T00:00:00.000Z",
        metadata: null,
      },
    ]);

    const list = await getPublicDestinations();

    expect(list.some((destination) => destination.slug === "redmond-wa-usa")).toBe(true);
  });

  it("includes published catalog rows and excludes draft rows", () => {
    const localDestination: Destination = {
      slug: "test-city",
      city: "Test City",
      country: "Testland",
      emoji: "🌴",
      match: 0,
      description: "Local fallback description",
      overview: "Local fallback overview",
      climate: "Warm",
      lifestyle: "Relaxed",
      transportation: "Easy",
      images: [],
      tags: ["test"],
    };

    const list = buildPublicDestinationCatalogList(
      [
        {
          id: "row-1",
          slug: "test-city",
          city: "Test City",
          country: "Testland",
          status: "published",
          description: "Published row overview",
          overview: "Published row detail",
          metadata: {},
        },
        {
          id: "row-2",
          slug: "draft-city",
          city: "Draft City",
          country: "Testland",
          status: "draft",
          description: "Draft row overview",
          overview: "Draft row detail",
          metadata: {},
        },
      ],
      [localDestination],
    );

    expect(list.some((destination) => destination.slug === "test-city")).toBe(true);
    expect(list.some((destination) => destination.slug === "draft-city")).toBe(false);
    expect(list.find((destination) => destination.slug === "test-city")?.description).toContain("Published row overview");
  });

  it("keeps US destinations visible when the country includes a state suffix", () => {
    const localDestination: Destination = {
      slug: "devon-pa-usa",
      city: "Devon",
      country: "United States - Pennsylvania",
      emoji: "🇺🇸",
      match: 0,
      description: "Local fallback description",
      overview: "Local fallback overview",
      climate: "Warm",
      lifestyle: "Relaxed",
      transportation: "Easy",
      images: [],
      tags: ["expansion-candidate"],
    };

    const list = buildPublicDestinationCatalogList(
      [
        {
          id: "row-3",
          slug: "devon-pa-usa",
          city: "Devon",
          country: "United States - Pennsylvania",
          status: "published",
          description: "Published row overview",
          overview: "Published row detail",
          metadata: {},
        },
      ],
      [localDestination],
    );

    expect(list.some((destination) => destination.slug === "devon-pa-usa")).toBe(true);
  });

  it("keeps US destinations visible when the country uses the USA shorthand", () => {
    const localDestination: Destination = {
      slug: "miami-usa",
      city: "Miami",
      country: "USA",
      emoji: "🇺🇸",
      match: 0,
      description: "Local fallback description",
      overview: "Local fallback overview",
      climate: "Warm",
      lifestyle: "Relaxed",
      transportation: "Easy",
      images: [],
      tags: ["expansion-candidate"],
    };

    const list = buildPublicDestinationCatalogList(
      [
        {
          id: "row-4",
          slug: "miami-usa",
          city: "Miami",
          country: "USA",
          status: "published",
          description: "Published row overview",
          overview: "Published row detail",
          metadata: {},
        },
      ],
      [localDestination],
    );

    expect(list.some((destination) => destination.slug === "miami-usa")).toBe(true);
  });

  it("includes local fallback destinations that are not yet present in Supabase", () => {
    const localDestination: Destination = {
      slug: "devon-pa-usa",
      city: "Devon",
      country: "United States - Pennsylvania",
      emoji: "🇺🇸",
      match: 0,
      description: "Local fallback description",
      overview: "Local fallback overview",
      climate: "Warm",
      lifestyle: "Relaxed",
      transportation: "Easy",
      images: [],
      tags: ["affordable", "suburban"],
    };

    const list = buildPublicDestinationCatalogList([], [localDestination]);

    expect(list.some((destination) => destination.slug === "devon-pa-usa")).toBe(true);
  });
});
