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
});
