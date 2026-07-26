import { expect, test, type Page } from "@playwright/test";
import { publicDestinations } from "../../app/lib/public-destinations";

const CORE_ROUTES = [
  "/",
  "/destinations",
  "/about",
  "/compare",
  "/contact",
  "/life-match",
  "/login",
  "/pricing",
  "/privacy",
  "/profile",
  "/results",
  "/signup",
  "/terms",
  "/admin",
  "/admin/verification",
];

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

function isIgnorableConsoleError(text: string) {
  return text.includes("webpack-hmr") && text.includes("WebSocket connection");
}

async function collectConsoleIssues(page: Page, callback: () => Promise<void>) {
  const errors: string[] = [];

  const onConsole = (message: { type: () => string; text: () => string }) => {
    if (message.type() === "error") {
      const text = message.text();
      if (!isIgnorableConsoleError(text)) {
        errors.push(`console: ${text}`);
      }
    }
  };

  const onPageError = (error: Error) => {
    errors.push(`pageerror: ${error.message}`);
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  try {
    await callback();
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }

  return errors;
}

test.describe("Production quality audit", () => {
  test("core routes return successful HTTP responses", async ({ request }) => {
    const failures: Array<{ route: string; status: number }> = [];

    for (const route of CORE_ROUTES) {
      const response = await request.get(route);
      if (!response.ok()) {
        failures.push({ route, status: response.status() });
      }
    }

    expect(failures).toEqual([]);
  });

  test("every public destination route loads and publishes map resources", async ({ request }) => {
    test.setTimeout(8 * 60 * 1000);

    const routeFailures: Array<{ slug: string; status: number }> = [];
    const missingMapLinks: string[] = [];

    for (const destination of publicDestinations) {
      const response = await request.get(`/destinations/${destination.slug}`);
      if (!response.ok()) {
        routeFailures.push({ slug: destination.slug, status: response.status() });
        continue;
      }

      const html = await response.text();
      const hasGoogleMaps = html.includes("Google Maps");
      const hasGoogleEarth = html.includes("Google Earth");
      if (!hasGoogleMaps || !hasGoogleEarth) {
        missingMapLinks.push(destination.slug);
      }
    }

    expect(routeFailures).toEqual([]);
    expect(missingMapLinks).toEqual([]);
  });

  test("desktop and mobile render core navigation paths without console errors", async ({ page }) => {
    const routesToRender = ["/", "/destinations", "/compare", "/pricing", "/life-match"];

    for (const viewport of [DESKTOP_VIEWPORT, MOBILE_VIEWPORT]) {
      await page.setViewportSize(viewport);

      for (const route of routesToRender) {
        const errors = await collectConsoleIssues(page, async () => {
          await page.goto(route);
          await expect(page.locator("main").first()).toBeVisible();
        });

        expect(errors, `Console/runtime errors on ${route} at ${viewport.width}x${viewport.height}`).toEqual([]);
      }
    }
  });

  test("destination samples render without console errors", async ({ page }) => {
    const sample = [
      ...publicDestinations.slice(0, 4),
      ...publicDestinations.slice(Math.floor(publicDestinations.length / 2), Math.floor(publicDestinations.length / 2) + 4),
      ...publicDestinations.slice(-4),
    ];

    for (const destination of sample) {
      const errors = await collectConsoleIssues(page, async () => {
        await page.goto(`/destinations/${destination.slug}`);
        await expect(page.getByText("Rapid relocation answers")).toBeVisible();
      });

      expect(errors, `Console/runtime errors on destination ${destination.slug}`).toEqual([]);
    }
  });
});
