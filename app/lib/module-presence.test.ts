import { describe, expect, it } from "vitest";
import { hasRenderableModuleData } from "./module-presence";

describe("hasRenderableModuleData", () => {
  it("treats null and undefined as absent", () => {
    expect(hasRenderableModuleData(null)).toBe(false);
    expect(hasRenderableModuleData(undefined)).toBe(false);
  });

  it("treats an empty array as absent", () => {
    expect(hasRenderableModuleData([])).toBe(false);
  });

  it("treats an array of only-empty items as absent", () => {
    expect(hasRenderableModuleData([{ summary: null }, { summary: "" }])).toBe(false);
  });

  it("treats an array with at least one meaningful item as present", () => {
    expect(hasRenderableModuleData([{ summary: null }, { summary: "Real content" }])).toBe(true);
  });

  it("treats an object where every field is blank as absent", () => {
    expect(hasRenderableModuleData({ summary: null, notes: "" })).toBe(false);
  });

  it("treats an object with at least one non-blank field as present", () => {
    expect(hasRenderableModuleData({ summary: null, notes: "Courts available downtown" })).toBe(true);
  });

  it("treats a non-empty string as present and a blank string as absent", () => {
    expect(hasRenderableModuleData("Some value")).toBe(true);
    expect(hasRenderableModuleData("   ")).toBe(false);
  });

  it("treats a truthy scalar as present and a falsy scalar as absent", () => {
    expect(hasRenderableModuleData(true)).toBe(true);
    expect(hasRenderableModuleData(false)).toBe(false);
    expect(hasRenderableModuleData(1)).toBe(true);
    expect(hasRenderableModuleData(0)).toBe(false);
  });
});
