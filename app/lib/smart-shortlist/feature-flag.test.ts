import { afterEach, describe, expect, it, vi } from "vitest";
import { isSmartShortlistPrototypeEnabled } from "./feature-flag";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Smart Shortlist local prototype flag", () => {
  it("defaults off", () => {
    delete process.env.SMART_SHORTLIST_LOCAL_PROTOTYPE;
    expect(isSmartShortlistPrototypeEnabled()).toBe(false);
  });

  it("requires the exact value 1 outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMART_SHORTLIST_LOCAL_PROTOTYPE", "true");
    expect(isSmartShortlistPrototypeEnabled()).toBe(false);
    vi.stubEnv("SMART_SHORTLIST_LOCAL_PROTOTYPE", "1");
    expect(isSmartShortlistPrototypeEnabled()).toBe(true);
  });

  it("is hard-disabled in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMART_SHORTLIST_LOCAL_PROTOTYPE", "1");
    expect(isSmartShortlistPrototypeEnabled()).toBe(false);
  });
});