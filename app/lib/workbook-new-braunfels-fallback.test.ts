import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSupabase = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => false),
  supabaseFetch: vi.fn(),
}));

vi.mock("./supabase", () => mockSupabase);

import { getCanonicalDestination } from "./canonical-destination-loader";
import { getWorkbookFallbackDestinationData } from "./workbook-new-braunfels-fallback";

describe("workbook pilot fallback cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.isSupabaseConfigured.mockReturnValue(false);
  });

  it("does not provide temporary New Braunfels or Summerlin fallback content", () => {
    expect(getWorkbookFallbackDestinationData("new-braunfels-texas-united-states")).toBeNull();
    expect(getWorkbookFallbackDestinationData("summerlin-las-vegas-nevada")).toBeNull();
  });

  it(
    "still resolves New Braunfels and Summerlin from the authoritative workbook-backed canonical loader",
    async () => {
      const newBraunfels = await getCanonicalDestination("new-braunfels-texas-united-states");
      const summerlin = await getCanonicalDestination("summerlin-las-vegas-nevada");

      expect(newBraunfels?.city).toBe("New Braunfels");
      expect(newBraunfels?.country).toBe("United States");
      expect(newBraunfels?.heroNarrative).not.toBe("");

      expect(summerlin?.city).toContain("Summerlin");
      expect(summerlin?.country).toBe("United States");
      expect(summerlin?.heroNarrative).not.toBe("");
    },
    30000,
  );
});
