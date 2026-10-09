import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

describe("supabase environment loading", () => {
  const originalEnv = { ...process.env };
  const originalCwd = process.cwd();

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    process.chdir(originalCwd);
  });

  it("loads Supabase config from .env.local when process.env is empty", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ha-supabase-"));
    fs.writeFileSync(path.join(tempDir, ".env.local"), 'SUPABASE_URL="https://example.supabase.co"\nSUPABASE_PUBLISHABLE_KEY="demo-key"\n');

    process.chdir(tempDir);

    try {
      const { isSupabaseConfigured, getSupabaseConfig } = await import("./supabase");

      expect(isSupabaseConfigured()).toBe(true);
      expect(getSupabaseConfig()).toEqual({
        url: "https://example.supabase.co",
        anonKey: "demo-key",
      });
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  it("reports effective configuration provenance without exposing keys and keeps request headers unchanged", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ha-supabase-"));
    process.chdir(tempDir);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "  sb_publishable_fixture  ";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "lower-priority-fixture";
    const fetchMock = vi.fn().mockResolvedValue({ status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const { createHash } = await import("node:crypto");
      const { getSupabaseConfigurationPresence, supabaseFetch } = await import("./supabase");
      const expected = {
        urlPresent: true, publicKeyPresent: true, projectReference: "example",
        publicKeyVariable: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        publicKeySha256: createHash("sha256").update("sb_publishable_fixture").digest("hex"),
        branchOverrideStatus: "UNVERIFIED",
      };
      expect(getSupabaseConfigurationPresence()).toEqual(expected);
      expect(JSON.stringify(expected)).not.toContain("sb_publishable_fixture");
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "changed-after-initialization";
      expect(getSupabaseConfigurationPresence()).toEqual(expected);
      await supabaseFetch("/rest/v1/destinations_catalog", { cache: "no-store" });
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://example.supabase.co/rest/v1/destinations_catalog");
      expect(options.headers.get("apikey")).toBe("sb_publishable_fixture");
      expect(options.headers.get("Authorization")).toBe("Bearer sb_publishable_fixture");
      expect(options.cache).toBe("no-store");
    } finally {
      vi.unstubAllGlobals();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

});
