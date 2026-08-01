# Destination editorial migration implementation map

## Phase 1 status

Completed: inventory and impact analysis only. No runtime behavior changes yet.

## Architectural goal

Make one destination object the single owner of all visible editorial copy, and turn the destination page into a renderer with almost no writing logic.

## Current source-of-truth findings

The visible destination page copy is currently assembled in the page layer by helper functions such as:

- buildEditorialOverview
- buildMagazineDescription
- buildDayMoments
- buildLifeScenarios
- buildRapidAnswers
- buildCoreRelocationQa
- buildPracticalTopLinks

Those helpers produce prose from a mix of:

- structured command-center facts
- destination fields from the content layer
- hard-coded city branches
- page-local fallback templates

## Files directly affected by the migration

### Core content model and destination schema

- [app/lib/destinations.ts](../app/lib/destinations.ts)
  - Defines the current `Destination` type and the base catalog records.
  - This is the primary place where the new editorial-field schema must be introduced.

- [app/lib/destination-enrichment.ts](../app/lib/destination-enrichment.ts)
  - Supplies the destination-specific narrative overrides used by the current content pipeline.
  - This will become the canonical place for destination-owned editorial data.

- [app/lib/destination-content.ts](../app/lib/destination-content.ts)
  - Loads and merges destination content from local and Supabase-backed sources.
  - This must be updated so the destination object carries the new editorial-field schema.

### Page rendering and prose generation

- [app/destinations/[slug]/page.tsx](../app/destinations/[slug]/page.tsx)
  - Contains the page-level helper builders that currently synthesize copy.
  - This is the main target for removing writing logic and switching to direct field reads.

### Structured facts and intelligence layer

- [app/lib/destination-command-center.ts](../app/lib/destination-command-center.ts)
  - Supplies the structured relocation facts used by the page helpers.
  - It should continue to provide facts and metrics, but stop generating visible prose.

- [app/lib/destination-intelligence.ts](../app/lib/destination-intelligence.ts)
  - Provides intelligence summaries and signals that may still be useful, but should no longer be the source of visible editorial prose.

## Files indirectly affected because they consume Destination shape

These files will require compatibility checks when the destination type changes:

- [app/components/CompareClient.tsx](../app/components/CompareClient.tsx)
- [app/components/DestinationSearch.tsx](../app/components/DestinationSearch.tsx)
- [app/components/FavoritesPanel.tsx](../app/components/FavoritesPanel.tsx)
- [app/components/ProfileClient.tsx](../app/components/ProfileClient.tsx)
- [app/components/destinationCardFacts.ts](../app/components/destinationCardFacts.ts)
- [app/results/page.tsx](../app/results/page.tsx)
- [app/lib/public-destinations.ts](../app/lib/public-destinations.ts)
- [app/lib/flagship-destinations.ts](../app/lib/flagship-destinations.ts)
- [app/lib/recommendation-engine.ts](../app/lib/recommendation-engine.ts)
- [app/lib/destination-verification.ts](../app/lib/destination-verification.ts)
- [app/lib/destination-quality-baseline.ts](../app/lib/destination-quality-baseline.ts)

## Tests and validation files affected by the migration

- [app/lib/destination-enrichment.test.ts](../app/lib/destination-enrichment.test.ts)
- [app/lib/destination-command-center.test.ts](../app/lib/destination-command-center.test.ts)
- [app/lib/destination-intelligence.test.ts](../app/lib/destination-intelligence.test.ts)
- [app/components/destinationCardFacts.test.ts](../app/components/destinationCardFacts.test.ts)

## Migration phases planned

1. Introduce the destination editorial schema in the destination model.
2. Migrate initial destination content into the new schema without changing rendering behavior.
3. Replace page-generated prose with direct field reads from the destination object.
4. Remove helper functions one by one only after their outputs are fully migrated.
5. Keep UI rendering helpers intact and simplify them where appropriate.
6. Verify pages and run lint/type/build checks after each phase.

## Phase 1 outcome

The impact surface is now explicit and bounded. The next phase will introduce the new destination editorial schema in the data model without changing page rendering behavior.
