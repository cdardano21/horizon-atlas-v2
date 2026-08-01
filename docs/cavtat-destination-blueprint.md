# Cavtat Destination Blueprint (Master Standard)

This document saves the Cavtat destination implementation as the baseline standard for all destination pages.

## Canonical Rendering Path

All destination pages must render through the shared dynamic route and shared section components:

- `app/destinations/[slug]/page.tsx`
- `app/components/DestinationGallery.tsx`
- `app/components/destination/NeighborhoodExplorer.tsx`

Do not create one-off destination page variants that bypass this shared path.

## Core Experience Standard

Every destination page must include the same practical, premium structure demonstrated in Cavtat:

1. Credible hero and local context positioning.
2. Monthly climate highs/lows and planning-grade practical detail.
3. Cost and day-to-day living signals with explicit caveats.
4. Neighborhood explorer with readable contrast and clear chips.
5. Practical Top 10 links (restaurants, shopping, services) with clickable links.
6. Media and resources sidebar including:
   - Google Maps
   - Google Earth
   - Live webcams
   - Published destination resources (airport, transit, healthcare, tax, etc.)
7. Practical pinboard and orientation tools instead of redundant duplicate map embeds.

## Data Completeness Standard

For each destination slug, command-center data should include (when available):

- `practicalInfo`
- `pros`
- `tradeoffs`
- `resources`
- `monthlyClimate`
- `costOfLiving`
- `neighborhoods`

Goal: avoid weak empty states and reduce "not verified" placeholders by supplying published references and practical records.

## Verification Standard

- Prefer official or clearly attributable sources.
- Use verification metadata for confidence and recency.
- Mark estimated data explicitly when direct verification is pending.

## Rollout Rule For New Destinations

When adding a destination:

1. Add/expand seed coverage in `app/lib/local-command-center-seeds.ts` and/or generated/regional seeds.
2. Validate the shared page sections render complete practical content.
3. Confirm the gallery sidebar shows Maps, Earth, Live webcams, and relevant category links.
4. Ensure contrast/readability in dark panels meets Cavtat quality.

## Automated Validation

Run blueprint checks:

```bash
npm run validate:destination-blueprint
```

Strict mode (fail on every destination with missing Cavtat-standard fields):

```bash
npm run validate:destination-blueprint:strict
```

## Why This Is Already Global

The UI structure is already shared by route architecture. Cavtat is now the documented quality and content blueprint for all slugs rendered through the same components.
