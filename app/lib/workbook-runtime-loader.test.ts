import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    execFileSync: vi.fn(),
  };
});

import { loadPremiumWorkbookDestinationData, normalizeWorkbookHeaderName, normalizeWorkbookPayload } from "./workbook-runtime-loader";

const execFileSyncMock = vi.mocked(execFileSync);

describe("workbook runtime loader helpers", () => {
  const tempDirs: string[] = [];
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    execFileSyncMock.mockReset();
    execFileSyncMock.mockReturnValue(JSON.stringify({
      destinations: [{
        destination_key: "demo-town",
        slug: "demo-town",
        destination_name: "Demo Town",
        city: "Demo Town",
        country: "Example",
        short_description: "Workbook-backed narrative",
        long_description: "Workbook-backed overview",
        hero_narrative: "Workbook-backed hero narrative",
        overview: "Workbook-backed overview",
        editorial: "Workbook-backed editorial",
        why_this_place_feels_distinct: "Workbook-backed distinct narrative",
        daily_life: "Workbook-backed daily life",
        climate: "Workbook-backed climate",
        transportation: "Workbook-backed transportation",
        healthcare: "Workbook-backed healthcare",
        cost_of_living: "Workbook-backed cost of living",
        walkability: "Workbook-backed walkability",
        internet: "Workbook-backed internet",
        safety: "Workbook-backed safety",
        official_tourism_url: "https://example.com/tourism",
        google_maps_url: "https://example.com/maps",
        google_earth_url: "https://example.com/earth",
        wikipedia_url: "https://example.com/wiki",
      }],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      cost_records: [],
      healthcare_records: [],
      transport_records: [],
      housing_records: [],
      reality_checks: [],
      sources: [],
      premium_editorial: {},
    }));
  });

  afterEach(() => {
    process.chdir(originalCwd);
    tempDirs.splice(0).forEach((tempDir) => rmSync(tempDir, { recursive: true, force: true }));
  });
  it("normalizes human-readable workbook headers into canonical snake_case keys", () => {
    expect(normalizeWorkbookHeaderName("Destination Key")).toBe("destination_key");
    expect(normalizeWorkbookHeaderName("Destination Name")).toBe("destination_name");
    expect(normalizeWorkbookHeaderName("Neighborhood Name")).toBe("neighborhood_name");
    expect(normalizeWorkbookHeaderName("Google Maps URL")).toBe("google_maps_url");
    expect(normalizeWorkbookHeaderName("Resource Name")).toBe("resource_name");
    expect(normalizeWorkbookHeaderName("Image URL")).toBe("image_url");
    expect(normalizeWorkbookHeaderName("Is Primary")).toBe("is_primary");
  });

  it("normalizes workbook payload rows that use spaced headers from the Premium workbook", () => {
    const payload = {
      destinations: [{
        "Destination Key": "new-braunfels-tx-us",
        "Destination Name": "New Braunfels",
        "City": "New Braunfels",
        "Country": "United States",
      }],
      neighborhoods: [{
        "Destination Key": "new-braunfels-tx-us",
        "Neighborhood Name": "Gruene",
        "Google Maps URL": "https://maps.example/gruene",
      }],
      places: [{
        "Destination Key": "new-braunfels-tx-us",
        "Place Name": "The Gristmill Restaurant & Bar",
        "Place Category": "Restaurants",
        "Website URL": "https://example.com/gristmill",
      }],
      resources: [{
        "Destination Key": "new-braunfels-tx-us",
        "Resource Name": "City of New Braunfels",
        "URL": "https://www.newbraunfels.gov/",
      }],
      media: [{
        "Destination Key": "new-braunfels-tx-us",
        "Image URL": "https://example.com/hero.jpg",
        "Is Primary": true,
      }],
    };

    const normalized = normalizeWorkbookPayload(payload as Record<string, unknown>);

    expect(normalized.destinations[0]).toMatchObject({
      destination_key: "new-braunfels-tx-us",
      destination_name: "New Braunfels",
      city: "New Braunfels",
      country: "United States",
    });
    expect(normalized.neighborhoods[0]).toMatchObject({
      neighborhood_name: "Gruene",
      google_maps_url: "https://maps.example/gruene",
    });
    expect(normalized.places[0]).toMatchObject({
      place_name: "The Gristmill Restaurant & Bar",
      place_category: "Restaurants",
      website_url: "https://example.com/gristmill",
    });
    expect(normalized.resources[0]).toMatchObject({
      resource_name: "City of New Braunfels",
      url: "https://www.newbraunfels.gov/",
    });
    expect(normalized.media[0]).toMatchObject({
      image_url: "https://example.com/hero.jpg",
      is_primary: true,
    });
  });

  it("discovers workbook files in parent directories when the app runs from a nested workspace folder", async () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), "workbook-loader-"));
    tempDirs.push(tempRoot);

    const workspaceDir = path.join(tempRoot, "workspace");
    const workbookDir = path.join(tempRoot, "workbooks");
    mkdirSync(workspaceDir, { recursive: true });
    mkdirSync(workbookDir, { recursive: true });
    writeFileSync(path.join(workbookDir, "81Horizon-Atlas-CLEAN.xlsx"), "placeholder workbook");
    process.chdir(workspaceDir);

    const destination = await loadPremiumWorkbookDestinationData("demo-town");

    expect(destination).not.toBeNull();
    expect(execFileSyncMock).toHaveBeenCalled();
    expect(destination?.heroNarrative).toContain("Workbook-backed hero narrative");
  });

  it("falls back to a real system python when the workspace venv symlink is broken", async () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), "workbook-loader-python-"));
    tempDirs.push(tempRoot);

    const workspaceDir = path.join(tempRoot, "workspace");
    mkdirSync(workspaceDir, { recursive: true });
    const venvDir = path.join(workspaceDir, ".venv", "bin");
    mkdirSync(venvDir, { recursive: true });
    symlinkSync("/tmp/does-not-exist", path.join(venvDir, "python"), "file");
    process.chdir(workspaceDir);

    const destination = await loadPremiumWorkbookDestinationData("demo-town");

    expect(destination).not.toBeNull();
    expect(execFileSyncMock).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.objectContaining({ cwd: workspaceDir }));
    const pythonCommand = execFileSyncMock.mock.calls[0]?.[0];
    expect(pythonCommand).toBeDefined();
    expect(pythonCommand).not.toContain(".venv/bin/python");
  });
});
