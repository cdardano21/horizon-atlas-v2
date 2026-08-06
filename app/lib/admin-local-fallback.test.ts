import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsSupabaseConfigured } = vi.hoisted(() => ({
  mockIsSupabaseConfigured: vi.fn(() => false),
}));

vi.mock("./supabase", () => ({
  isSupabaseConfigured: mockIsSupabaseConfigured,
}));

import {
  createAdminFallbackDestination,
  deleteAdminFallbackDestination,
  getAdminLocalFallbackStore,
  listAdminFallbackDestinations,
  shouldUseAdminLocalFallback,
  updateAdminFallbackDestination,
} from "./admin-local-fallback";

describe("admin local fallback", () => {
  beforeEach(() => {
    mockIsSupabaseConfigured.mockReset();
    mockIsSupabaseConfigured.mockReturnValue(false);

    const store = getAdminLocalFallbackStore();
    store.destinations = [];
    store.assets = [];
    store.tags = new Map();
    store.datasets = new Map();
    delete (globalThis as typeof globalThis & { __haAdminLocalFallbackStore?: unknown }).__haAdminLocalFallbackStore;
  });

  it("enables local fallback in development without auth", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    try {
      expect(shouldUseAdminLocalFallback(null, null, null)).toBe(true);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it("disables local fallback when a server-side Supabase service role key is available", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousSecretKey = process.env.SUPABASE_SECRET_KEY;
    process.env.NODE_ENV = "development";
    process.env.SUPABASE_SECRET_KEY = "service-role-key";

    try {
      expect(shouldUseAdminLocalFallback(null, null, null)).toBe(false);
    } finally {
      if (previousSecretKey === undefined) {
        delete process.env.SUPABASE_SECRET_KEY;
      } else {
        process.env.SUPABASE_SECRET_KEY = previousSecretKey;
      }
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it("disables local fallback when Supabase is configured in development", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    mockIsSupabaseConfigured.mockReturnValue(true);

    try {
      expect(shouldUseAdminLocalFallback(null, null, null)).toBe(false);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it("creates, updates, lists, and deletes destinations from the fallback store", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    try {
      const created = createAdminFallbackDestination({ city: "Athens", country: "Greece", slug: "athens-greece" });
      expect(created.id).toMatch(/^local-/);
      expect(listAdminFallbackDestinations()).toHaveLength(1);

      const updated = updateAdminFallbackDestination(created.id, {
        city: "Athens",
        country: "Greece",
        description: "A lively historic capital",
        status: "review",
      });

      expect(updated?.description).toBe("A lively historic capital");
      expect(updated?.status).toBe("review");

      const removed = deleteAdminFallbackDestination(created.id);
      expect(removed).toBe(true);
      expect(listAdminFallbackDestinations()).toHaveLength(0);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it("merges destination metadata across subsequent fallback updates", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    try {
      const created = createAdminFallbackDestination({ city: "Lisbon", country: "Portugal", slug: "lisbon-portugal" });

      updateAdminFallbackDestination(created.id, {
        metadata: {
          relocationProfile: { aiSummary: "A strong fit for retirees who want walkability and healthcare." },
        } as never,
      });

      const updated = updateAdminFallbackDestination(created.id, {
        metadata: {
          editorialContent: { title: "Lisbon for slow living" },
        } as never,
      });

      expect(updated?.metadata?.relocationProfile).toMatchObject({ aiSummary: "A strong fit for retirees who want walkability and healthcare." });
      expect(updated?.metadata?.editorialContent).toMatchObject({ title: "Lisbon for slow living" });
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });
});
