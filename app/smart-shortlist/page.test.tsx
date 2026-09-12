import { afterEach, describe, expect, it, vi } from "vitest";

const { loadData, notFound, Shortlist } = vi.hoisted(() => ({
  loadData: vi.fn(),
  notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
  Shortlist: vi.fn(() => null),
}));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("../lib/smart-shortlist/server-data", () => ({ loadSmartShortlistData: loadData }));
vi.mock("../components/smart-shortlist/SmartShortlistPrototype", () => ({ default: Shortlist }));
import SmartShortlistPage from "./page";

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("Public Smart Shortlist route", () => {
  it.each(["development", "production"])("serves the existing flow in %s with the prototype flag disabled", async environment => {
    vi.stubEnv("NODE_ENV", environment);
    vi.stubEnv("SMART_SHORTLIST_LOCAL_PROTOTYPE", "0");
    const data = { candidates: [], intelligence: [], affordabilityRecords: [] };
    loadData.mockResolvedValue(data);
    const page = await SmartShortlistPage();
    expect(notFound).not.toHaveBeenCalled();
    expect(loadData).toHaveBeenCalledOnce();
    expect(page.type).toBe(Shortlist);
    expect(page.props).toMatchObject(data);
  });
});
