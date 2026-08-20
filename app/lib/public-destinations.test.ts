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

// Pagination tests isolate Supabase-sourced rows from the real 973-entry legacy
// catalog so the expected counts stay exact regardless of legacy catalog size.
vi.mock("./destination-enrichment", () => ({
  enrichedDestinations: [],
}));

const mockedSupabaseFetch = vi.mocked(supabaseFetch);

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

const makeCatalogRow = (index: number) => ({
  id: `00000000-0000-0000-0000-${String(index).padStart(12, "0")}`,
  slug: `synthetic-city-${index}`,
  city: `Synthetic City ${index}`,
  country: "Testland",
  status: "published",
  description: `Synthetic overview ${index}`,
  overview: `Synthetic detail ${index}`,
  metadata: {},
});

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

describe("getPublicDestinations pagination", () => {
  beforeEach(() => {
    mockIsSupabaseConfigured.mockReset();
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockListAdminFallbackDestinations.mockReset();
    mockListAdminFallbackDestinations.mockReturnValue([]);
    mockedSupabaseFetch.mockReset();
  });

  it("retrieves exactly 1,000 rows across two requests (full page + empty page)", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => makeCatalogRow(index));
    mockedSupabaseFetch
      .mockResolvedValueOnce(jsonResponse(firstPage))
      .mockResolvedValueOnce(jsonResponse([]));

    const list = await getPublicDestinations();

    expect(mockedSupabaseFetch).toHaveBeenCalledTimes(2);
    expect(list).toHaveLength(1000);
    const uniqueSlugs = new Set(list.map((destination) => destination.slug));
    expect(uniqueSlugs.size).toBe(1000);
  });

  it("retrieves more than 1,000 rows completely across two pages (1,000 + 5)", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => makeCatalogRow(index));
    const secondPage = Array.from({ length: 5 }, (_, index) => makeCatalogRow(1000 + index));
    mockedSupabaseFetch
      .mockResolvedValueOnce(jsonResponse(firstPage))
      .mockResolvedValueOnce(jsonResponse(secondPage));

    const list = await getPublicDestinations();

    expect(mockedSupabaseFetch).toHaveBeenCalledTimes(2);
    expect(list).toHaveLength(1005);
    const uniqueSlugs = new Set(list.map((destination) => destination.slug));
    expect(uniqueSlugs.size).toBe(1005);
  });

  it("retrieves at least 2,005 synthetic rows across three pages with no duplicates or gaps", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => makeCatalogRow(index));
    const secondPage = Array.from({ length: 1000 }, (_, index) => makeCatalogRow(1000 + index));
    const thirdPage = Array.from({ length: 5 }, (_, index) => makeCatalogRow(2000 + index));
    mockedSupabaseFetch
      .mockResolvedValueOnce(jsonResponse(firstPage))
      .mockResolvedValueOnce(jsonResponse(secondPage))
      .mockResolvedValueOnce(jsonResponse(thirdPage));

    const list = await getPublicDestinations();

    expect(mockedSupabaseFetch).toHaveBeenCalledTimes(3);
    expect(list).toHaveLength(2005);
    const uniqueSlugs = new Set(list.map((destination) => destination.slug));
    expect(uniqueSlugs.size).toBe(2005);

    // No gaps: every expected synthetic index must be present exactly once.
    for (let index = 0; index < 2005; index += 1) {
      expect(uniqueSlugs.has(`synthetic-city-${index}`)).toBe(true);
    }
  });

  it("uses deterministic ordering and an incrementing cursor across pages", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => makeCatalogRow(index));
    const secondPage = Array.from({ length: 3 }, (_, index) => makeCatalogRow(1000 + index));
    mockedSupabaseFetch
      .mockResolvedValueOnce(jsonResponse(firstPage))
      .mockResolvedValueOnce(jsonResponse(secondPage));

    await getPublicDestinations();

    const [firstCallUrl] = mockedSupabaseFetch.mock.calls[0];
    const [secondCallUrl] = mockedSupabaseFetch.mock.calls[1];

    expect(firstCallUrl).toContain("order=id.asc");
    expect(firstCallUrl).toContain("limit=1000");
    expect(firstCallUrl).not.toContain("id=gt.");

    const lastIdOfFirstPage = firstPage[firstPage.length - 1].id;
    expect(secondCallUrl).toContain("order=id.asc");
    expect(secondCallUrl).toContain(`id=gt.${encodeURIComponent(lastIdOfFirstPage)}`);
  });

  it("falls back to legacy/local data on an empty Supabase result", async () => {
    mockedSupabaseFetch.mockResolvedValueOnce(jsonResponse([]));

    const list = await getPublicDestinations();

    expect(mockedSupabaseFetch).toHaveBeenCalledTimes(1);
    expect(list).toEqual([]);
  });

  it("does not return a partially truncated catalog when pagination fails mid-way", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => makeCatalogRow(index));
    mockedSupabaseFetch
      .mockResolvedValueOnce(jsonResponse(firstPage))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));

    const list = await getPublicDestinations();

    expect(mockedSupabaseFetch).toHaveBeenCalledTimes(2);
    // Fails entirely closed to legacy/local data rather than silently
    // returning the first page's synthetic rows.
    expect(list.some((destination) => destination.slug.startsWith("synthetic-city-"))).toBe(false);
  });

  it("falls back to legacy/local data when a page request throws", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => makeCatalogRow(index));
    mockedSupabaseFetch
      .mockResolvedValueOnce(jsonResponse(firstPage))
      .mockRejectedValueOnce(new Error("network down"));

    const list = await getPublicDestinations();

    expect(list.some((destination) => destination.slug.startsWith("synthetic-city-"))).toBe(false);
  });
});

