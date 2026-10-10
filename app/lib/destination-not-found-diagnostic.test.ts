import { afterEach, expect, it, vi } from "vitest";
vi.mock("./supabase", () => ({
  getSupabaseConfigurationPresence: () => ({ projectReference: "project", publicKeySha256: "a".repeat(64), secret: "must-not-log" }),
  getSupabaseServiceRoleKey: () => "must-not-log",
}));
import { logDestinationNotFound } from "./destination-not-found-diagnostic";
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
it("logs only allowed fields and fixed reasons, never credentials or arbitrary errors", () => {
  const log = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("VERCEL_ENV", "production"); vi.stubEnv("VERCEL_REGION", "sfo1");
  logDestinationNotFound("PUBLICATION", "HTTP_ERROR", 401);
  expect(JSON.parse(log.mock.calls[0][1])).toEqual({ gate: "PUBLICATION", reason: "HTTP_ERROR", httpStatus: 401, environment: "production", region: "sfo1", projectReference: "project", publicKeySha256: "a".repeat(64), serverCredentialPresent: true });
  logDestinationNotFound("CATALOG", "must-not-log");
  expect(JSON.stringify(log.mock.calls)).not.toContain("must-not-log");
  expect(JSON.parse(log.mock.calls[1][1]).reason).toBe("UNCLASSIFIED");
});
it("does not throw when logging fails", () => {
  vi.spyOn(console, "warn").mockImplementation(() => { throw new Error("logging failed"); });
  expect(() => logDestinationNotFound("RENDERER", "MISSING_V31_MODULES")).not.toThrow();
});
