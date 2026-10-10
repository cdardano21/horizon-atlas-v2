import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ eligibility: vi.fn(), canonical: vi.fn() }));
vi.mock("../../lib/public-destination-eligibility", () => ({ getPublicDestinationEligibility: mocks.eligibility }));
vi.mock("../../lib/canonical-destination-loader", () => ({ getCanonicalDestination: mocks.canonical }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); }, useRouter: () => ({}) }));
vi.mock("../../components/destination/CanonicalDestinationPage", () => ({ default: ({ destination }: { destination: { title: string } }) => <h1>{destination.title}</h1> }));
import DestinationPage from "./page";
beforeEach(() => { vi.clearAllMocks(); mocks.canonical.mockResolvedValue({ title: "Authored public content", v31Modules: {} }); });
afterEach(() => vi.restoreAllMocks());
describe("public destination route eligibility boundary", () => {
  it.each(["NONPUBLIC", "UNAVAILABLE"])("stops %s before loading draft or generated content", async eligibility => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.eligibility.mockResolvedValue(eligibility);
    await expect(DestinationPage({ params: Promise.resolve({ slug: "wanaka-new-zealand" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.canonical).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("[destination-404]", expect.stringContaining('"gate":"PUBLICATION"'));
  });
  it("renders published authored content", async () => {
    mocks.eligibility.mockResolvedValue("PUBLISHED");
    render(await DestinationPage({ params: Promise.resolve({ slug: "bariloche-argentina" }) }));
    expect(screen.getByRole("heading", { name: "Authored public content" })).toBeTruthy();
  });

  it("allows the Whitefish lean prototype to load locally when catalog eligibility is unavailable", async () => {
    mocks.eligibility.mockResolvedValue("UNAVAILABLE");
    mocks.canonical.mockResolvedValue({ title: "Whitefish prototype" });
    render(await DestinationPage({ params: Promise.resolve({ slug: "whitefish-montana-united-states" }) }));
    expect(screen.getByRole("heading", { name: "Whitefish prototype" })).toBeTruthy();
    expect(mocks.canonical).toHaveBeenCalledWith("whitefish-montana-united-states", expect.any(Object));
  });
  it("preserves canonical generation for unknown non-catalog slugs", async () => {
    mocks.eligibility.mockResolvedValue("UNKNOWN"); mocks.canonical.mockResolvedValue({ title: "Existing fallback" });
    render(await DestinationPage({ params: Promise.resolve({ slug: "unknown-island" }) }));
    expect(screen.getByRole("heading", { name: "Existing fallback" })).toBeTruthy();
  });
});

it("shows safe runtime provenance only in developer view", async () => {
  mocks.eligibility.mockResolvedValue("PUBLISHED");
  mocks.canonical.mockImplementation(async (_slug, diagnostics) => {
    if (diagnostics) Object.assign(diagnostics, { configured: true, branch: "persisted-bundle", persistedOutcome: "SUCCESS" });
    return { title: "Authored public content", v31Modules: {} };
  });
  const view = render(await DestinationPage({ params: Promise.resolve({ slug: "makarska-croatia" }), searchParams: Promise.resolve({ developer: "1" }) }));
  expect(screen.getByLabelText("V3.1 runtime diagnostics").textContent).toContain('"v31ModulesAtRenderer": true');
  expect(screen.getByLabelText("V3.1 runtime diagnostics").textContent).toContain('"persistedOutcome": "SUCCESS"');
  view.unmount();
  render(await DestinationPage({ params: Promise.resolve({ slug: "makarska-croatia" }) }));
  expect(screen.queryByLabelText("V3.1 runtime diagnostics")).toBeNull();
});

it.each([null, { title: "Legacy fallback" }])("blocks registered identities before secondary Legacy fallback: %j", async result => {
  mocks.eligibility.mockResolvedValue("PUBLISHED");
  const log = vi.spyOn(console, "warn").mockImplementation(() => {});
  mocks.canonical.mockResolvedValue(result);
  await expect(DestinationPage({ params: Promise.resolve({ slug: "makarska-croatia" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  expect(log).toHaveBeenCalledWith("[destination-404]", expect.stringContaining('"gate":"RENDERER"'));
});

it("blocks resolved authoritative aliases before secondary fallback", async () => {
  const { AuthoritativeDestinationUnavailableError } = await import("../../lib/authoritative-destination-identity");
  mocks.eligibility.mockResolvedValue("PUBLISHED");
  mocks.canonical.mockRejectedValue(new AuthoritativeDestinationUnavailableError());
  await expect(DestinationPage({ params: Promise.resolve({ slug: "catalog-alias" }) })).rejects.toThrow("NEXT_NOT_FOUND");
});

it.each(["CATALOG", "PERSISTED_BUNDLE"])("logs %s failure before the same 404 without requiring developer mode", async gate => {
  const { AuthoritativeDestinationUnavailableError } = await import("../../lib/authoritative-destination-identity");
  const log = vi.spyOn(console, "warn").mockImplementation(() => {});
  mocks.eligibility.mockResolvedValue("PUBLISHED");
  mocks.canonical.mockImplementation(async (_slug, diagnostics) => {
    Object.assign(diagnostics, { persistedOutcome: gate === "CATALOG" ? "NOT_ATTEMPTED" : "FAILED", fallbackReason: "authoritative-persisted-bundle-unavailable", catalogQueries: [{ outcome: "HTTP_ERROR", httpStatus: 401 }], persistedHttpStatus: 403 });
    throw new AuthoritativeDestinationUnavailableError();
  });
  await expect(DestinationPage({ params: Promise.resolve({ slug: "makarska-croatia" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  expect(log).toHaveBeenCalledWith("[destination-404]", expect.stringContaining(`"gate":"${gate}"`));
  log.mockRestore();
});
