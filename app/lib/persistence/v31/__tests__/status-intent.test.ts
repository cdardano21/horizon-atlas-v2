import { describe, expect, it } from "vitest";
import { validateStatusIntent } from "../status-intent";

describe("explicit destination status intent", () => {
  it("preserves every existing UPDATE status", () => {
    for (const status of ["draft", "review", "published"] as const) {
      expect(validateStatusIntent({ operation: "UPDATE", behavior: "PRESERVE_EXISTING_STATUS" }, status, status)).toBe(true);
      expect(validateStatusIntent({ operation: "UPDATE", behavior: "PRESERVE_EXISTING_STATUS" }, status, "published")).toBe(status === "published");
    }
  });
  it("keeps CREATE rows draft until explicit promotion", () => {
    expect(validateStatusIntent({ operation: "CREATE", behavior: "CREATE_AS_DRAFT_PENDING_VISUAL_APPROVAL" }, null, "draft")).toBe(true);
    expect(validateStatusIntent({ operation: "CREATE", behavior: "CREATE_AS_DRAFT_PENDING_VISUAL_APPROVAL" }, null, "published")).toBe(false);
    expect(validateStatusIntent({ operation: "PROMOTE_CREATE", behavior: "PUBLISH_AFTER_VISUAL_APPROVAL" }, "draft", "published")).toBe(true);
  });
});
