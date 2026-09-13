import { afterEach, describe, expect, it, vi } from "vitest";
const config = vi.hoisted(() => ({ configured: true, key: "server-secret" }));
vi.mock("./supabase", () => ({ isSupabaseConfigured: () => config.configured, getSupabaseServiceRoleKey: () => config.key, getSupabaseConfig: () => ({ url: "https://catalog.example" }) }));
import { getPublicDestinationEligibility } from "./public-destination-eligibility";
afterEach(() => { vi.unstubAllGlobals(); config.configured = true; config.key = "server-secret"; });
const response = (rows: unknown) => ({ ok: true, json: async () => rows });
describe("public catalog eligibility", () => {
  it.each(["draft", "review", "archived", "other", null])("blocks known %s identities using status-only uncached server reads", async status => {
    const fetcher = vi.fn().mockResolvedValue(response([{ status }])); vi.stubGlobal("fetch", fetcher);
    expect(await getPublicDestinationEligibility("wanaka-new-zealand")).toBe("NONPUBLIC");
    const [url, options] = fetcher.mock.calls[0];
    expect(new URL(url).searchParams.get("select")).toBe("status");
    expect(options.cache).toBe("no-store");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("allows published exact identities", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([{ status: "published" }])));
    expect(await getPublicDestinationEligibility("bariloche-argentina")).toBe("PUBLISHED");
  });
  it("checks exact key when slug does not resolve", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response([])).mockResolvedValueOnce(response([{ status: "draft" }])); vi.stubGlobal("fetch", fetcher);
    expect(await getPublicDestinationEligibility("wanaka-new-zealand")).toBe("NONPUBLIC");
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.get("destination_key")).toBe("eq.wanaka-new-zealand");
  });
  it("preserves unknown-slug fallback eligibility", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([])));
    expect(await getPublicDestinationEligibility("unknown-island")).toBe("UNKNOWN");
  });
  it.each([response([{ status: "published" }, { status: "draft" }]), { ok: false }, response({ invalid: true })])("fails closed on ambiguous or unavailable evidence", async reply => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply));
    expect(await getPublicDestinationEligibility("wanaka-new-zealand")).toBe("UNAVAILABLE");
  });
  it("does not confuse unavailable privileged access with an unknown slug", async () => {
    config.key = "";
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect(await getPublicDestinationEligibility("wanaka-new-zealand")).toBe("UNAVAILABLE");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("preserves the existing offline fallback mode when no catalog is configured", async () => {
    config.configured = false;
    expect(await getPublicDestinationEligibility("unknown-island")).toBe("UNKNOWN");
  });
  it("fails closed on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await getPublicDestinationEligibility("wanaka-new-zealand")).toBe("UNAVAILABLE");
  });
});
