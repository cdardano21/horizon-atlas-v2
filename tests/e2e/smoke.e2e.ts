import { expect, test } from "@playwright/test";

test.describe("Horizon Atlas smoke suite", () => {
  test("home page loads and routes into catalog", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Don't just retire." })).toBeVisible();
    const exploreAtlas = page.getByTestId("hero-cta-explore-atlas");
    await expect(exploreAtlas).toBeVisible();

    await exploreAtlas.click();
    await expect(page).toHaveURL(/\/destinations/);
    await expect(page.getByRole("heading", { name: /Explore destinations the way people actually choose a future/i })).toBeVisible();
  });

  test("catalog search and filters work", async ({ page }) => {
    await page.goto("/destinations");

    const beachFilter = page.getByTestId("destination-filter-beach").first();
    const clearAllButton = page.getByTestId("destination-filters-clear");
    await expect(beachFilter).toBeVisible();
    await beachFilter.click();

    const searchInput = page.getByTestId("destination-search-input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("valencia");

    await expect(page.getByTestId("destination-card-valencia-spain").first()).toBeVisible();
    await expect(page.getByTestId("destination-results-count")).toContainText("Showing");

    await expect(clearAllButton).toBeVisible();
  });

  test("destination cards surface a clear route to detail data", async ({ page }) => {
    await page.goto("/destinations");

    await page.getByTestId("destination-search-input").fill("valencia");

    await expect(page.getByTestId("destination-open-valencia-spain")).toBeVisible();
  });

  test("search returns Chicago and remains case-insensitive", async ({ page }) => {
    await page.goto("/destinations");

    await page.getByTestId("destination-search-input").fill("chicago");

    await expect(page.getByTestId("destination-card-chicago-illinois-united-states").first()).toBeVisible();
    await expect(page.getByTestId("destination-results-count")).toContainText("Showing");
  });

  test("suggested filters change the visible catalog and clear all restores results", async ({ page }) => {
    await page.goto("/destinations");

    const resultsCount = page.getByTestId("destination-results-count").locator("span").first();
    const initialCount = Number(await resultsCount.textContent());

    await page.getByTestId("destination-filter-golf").first().click();

    const filteredCount = Number(await resultsCount.textContent());
    expect(filteredCount).toBeLessThan(initialCount);

    await page.getByTestId("destination-filters-clear").click();
    await expect(page.getByTestId("destination-search-input")).toHaveValue("");
    await expect(page.getByTestId("destination-card-chicago-illinois-united-states").first()).toBeVisible();
  });

  test("Open guide links open the correct destination page", async ({ page }) => {
    await page.goto("/destinations");

    await page.getByTestId("destination-open-guide-nafplio-greece").click();
    await expect(page).toHaveURL(/\/destinations\/nafplio-greece/);
  });

  test("View full guide still works", async ({ page }) => {
    await page.goto("/destinations");

    await page.getByTestId("destination-open-valencia-spain").click();
    await expect(page).toHaveURL(/\/destinations\/valencia-spain/);
  });

  test("newly surfaced destinations appear in the catalog highlights", async ({ page }) => {
    await page.goto("/destinations");

    await expect(page.getByText("Freshly surfaced destinations")).toBeVisible();
    await expect(page.getByText("Todos Santos").first()).toBeVisible();
  });

  test("clicking a destination card routes to the destination detail page", async ({ page }) => {
    await page.goto("/destinations");

    await page.getByTestId("destination-card-todos-santos-mexico").first().click({ position: { x: 20, y: 20 } });

    await expect(page).toHaveURL(/\/destinations\/todos-santos-mexico/);
  });

  test("destination page exposes relocation details and map resources", async ({ page }) => {
    await page.goto("/destinations/valencia-spain");

    await expect(page.getByText("Core relocation Q&A")).toBeVisible();
    await expect(page.getByText("Map and media")).toBeVisible();
    await expect(page.getByRole("link", { name: /Google Earth/i }).first()).toBeVisible();
  });

  test("primary navigation can move between major pages", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("hero-cta-explore-atlas").click();
    await expect(page).toHaveURL(/\/destinations/);

    await page.getByTestId("destination-open-valencia-spain").click();
    await expect(page).toHaveURL(/\/destinations\/.+/);
  });

  test("mobile layout opens and uses the nav menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const toggle = page.getByTestId("navbar-mobile-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();

    const mobileDestinationLink = page.locator('a[href="/destinations"]').last();
    await expect(mobileDestinationLink).toBeVisible();
    await mobileDestinationLink.click();
    await expect(page).toHaveURL(/\/destinations/);
  });
});
