import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ headers: headersMock }));

const getAuthedAdminMock = vi.hoisted(() => vi.fn());
const loadCanonicalDestinationForAdminPreviewMock = vi.hoisted(() => vi.fn());
const notFoundMock = vi.hoisted(() => vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
}));

vi.mock("../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../lib/canonical-destination-admin-preview", () => ({
  loadCanonicalDestinationForAdminPreview: loadCanonicalDestinationForAdminPreviewMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

import AdminDestinationPreviewPage from "./page";

function buildTestDestination() {
  return {
    slug: "test-preview-destination",
    city: "Preview City",
    country: "Preview Country",
    title: "Preview City",
    subtitle: "Preview City, Preview Country",
    heroNarrative: "Real preview hero.",
    overview: "Real preview overview.",
    editorial: "Real preview editorial.",
    whyThisPlaceFeelsDistinct: "",
    dailyLife: "",
    climate: "",
    transportation: "",
    healthcare: "",
    costOfLiving: "",
    walkability: "",
    internet: "",
    safety: "",
    neighborhoods: [],
    restaurants: [],
    museums: [],
    golf: [],
    beaches: [],
    outdoorRecreation: [],
    pros: [],
    cons: [],
    retirement: "",
    digitalNomad: "",
    family: "",
    weather: "",
    monthlyBudgets: [],
    airportInfo: "",
    googleMapsUrl: "",
    googleEarthUrl: "",
    officialTourismUrl: "",
    wikipediaUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    instagramUrl: "",
    webcamUrl: "",
    resources: [],
    realEstateResources: [],
    rentalResources: [],
    healthcareResources: [],
    visaResources: [],
    weatherResources: [],
    structuredResources: [],
    videos: [],
    media: [],
    heroImages: [],
    mediaGallery: [],
    sections: {},
    ai: { status: "completed", version: "v1", lastUpdated: "2026-01-01", confidenceScore: 0.9, sourcesUsed: [], missingSections: [], promptVersion: "test", researchTimestamp: "2026-01-01" },
    scoring: [],
    aiScoringExplanation: "",
  } as never;
}

describe("admin destination preview route: security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headersMock.mockResolvedValue(new Headers({ host: "localhost:3110" }));
    notFoundMock.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("allows an explicit localhost development preview through the existing privileged loader", async () => {
    vi.stubEnv("NODE_ENV", "development");
    getAuthedAdminMock.mockResolvedValue({ user: null, adminRole: null });
    loadCanonicalDestinationForAdminPreviewMock.mockResolvedValue({ ok: true, destination: buildTestDestination() });
    render(await AdminDestinationPreviewPage({ params: Promise.resolve({ slug: "new-draft" }), searchParams: Promise.resolve({ local: "1" }) }));
    expect(loadCanonicalDestinationForAdminPreviewMock).toHaveBeenCalledWith("new-draft");
    expect(screen.getByText("Preview City")).toBeInTheDocument();
  });

  it.each([
    ["production", "localhost:3110", "1"],
    ["development", "example.com", "1"],
    ["development", "localhost.example.com", "1"],
    ["development", "localhost:3110", undefined],
  ])("denies anonymous preview for %s / %s / %s", async (environment, host, local) => {
    vi.stubEnv("NODE_ENV", environment);
    headersMock.mockResolvedValue(new Headers({ host }));
    getAuthedAdminMock.mockResolvedValue({ user: null, adminRole: null });
    await expect(AdminDestinationPreviewPage({ params: Promise.resolve({ slug: "new-draft" }), searchParams: Promise.resolve({ local }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(loadCanonicalDestinationForAdminPreviewMock).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated preview request (no user)", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: null, user: null, adminRole: null });

    await expect(
      AdminDestinationPreviewPage({ params: Promise.resolve({ slug: "the-villages-fl-us" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalled();
    expect(loadCanonicalDestinationForAdminPreviewMock).not.toHaveBeenCalled();
  });

  it("rejects an authenticated-but-non-admin preview request (user without admin role)", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: "token", user: { id: "user-1" }, adminRole: null });

    await expect(
      AdminDestinationPreviewPage({ params: Promise.resolve({ slug: "the-villages-fl-us" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(loadCanonicalDestinationForAdminPreviewMock).not.toHaveBeenCalled();
  });

  it("loads and renders the real persisted draft for an authorized admin", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: "token", user: { id: "admin-1" }, adminRole: "admin" });
    loadCanonicalDestinationForAdminPreviewMock.mockResolvedValue({ ok: true, destination: buildTestDestination() });

    const element = await AdminDestinationPreviewPage({ params: Promise.resolve({ slug: "the-villages-fl-us" }) });
    render(element as never);

    expect(loadCanonicalDestinationForAdminPreviewMock).toHaveBeenCalledWith("the-villages-fl-us");
    expect(screen.getByText("Preview City")).toBeInTheDocument();
  });

  it("shows an unavailable state (not a crash, not fabricated content) when the privileged lookup fails", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: "token", user: { id: "admin-1" }, adminRole: "admin" });
    loadCanonicalDestinationForAdminPreviewMock.mockResolvedValue({ ok: false, reason: "NOT_FOUND" });

    const element = await AdminDestinationPreviewPage({ params: Promise.resolve({ slug: "unknown-slug" }) });
    render(element as never);

    expect(screen.getByText("Preview unavailable")).toBeInTheDocument();
    expect(screen.getByText(/NOT_FOUND/)).toBeInTheDocument();
  });

  it("never renders a service-role key or credential value in the page output", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: "token", user: { id: "admin-1" }, adminRole: "admin" });
    loadCanonicalDestinationForAdminPreviewMock.mockResolvedValue({ ok: true, destination: buildTestDestination() });

    const element = await AdminDestinationPreviewPage({ params: Promise.resolve({ slug: "the-villages-fl-us" }) });
    const { container } = render(element as never);

    expect(container.innerHTML).not.toMatch(/service[_-]?role/i);
    expect(container.innerHTML).not.toMatch(/sb_secret|sb_publishable/i);
  });
});
