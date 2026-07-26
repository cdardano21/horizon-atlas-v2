# Destination Expansion Sweep/Enrich Plan

## Goal

Scale Horizon Atlas to 300+ destinations by separating what can be gathered in a broad automated sweep from what needs curated enrichment.

## Core Rule

Every destination gets a baseline record first. Structured facts are swept at scale. Subjective, fast-changing, or locally nuanced layers are enriched in priority order.

## Baseline Record For All Destinations

Each destination should have, at minimum:

- destination identity and slug
- country, region, and city/area labels
- monthly climate
- cost of living snapshot
- housing snapshot
- healthcare access summary
- airport access summary
- visa or residency notes
- tax notes
- practical info
- source attribution and freshness metadata

## Sweepable Fields

These are the best candidates for one broad pass across all destinations because they are structured, comparable, and relatively machine-friendly.

### Climate and cost

- monthly climate
- average grocery prices
- rental prices
- purchase prices
- utilities
- internet speeds
- tax information
- healthcare rankings
- crime statistics

### Mobility and access

- transit
- airport routes
- hospitals

### Structured commercial and service data

- top grocery chains

## Enrichment-First Fields

These need local research, judgment, map validation, or editorial selection.

- best restaurants
- coffee shops
- farmers markets
- beaches
- parks
- hiking
- museums
- expat communities
- local events
- neighborhood character notes

## Hybrid Fields

These can start with a sweep, then improve through enrichment.

- hospitals
- neighborhoods
- healthcare rankings
- transit
- practical info

## Recommended Rollout

1. Sweep all 300 destinations for the structured baseline.
2. Publish incomplete records only where the baseline is strong enough for rendering.
3. Enrich the top-priority destinations first:
   - flagship destinations
   - compare-set destinations
   - destinations with the highest user demand
4. Expand enrichment to the long tail in batches.
5. Regenerate narrative text only after the structured baseline changes materially.

## Source Guidance

### Good sweep sources

- climate APIs and public climate datasets
- statistical price datasets
- internet and infrastructure datasets
- transit and airport data sources
- government tax and residency sources
- healthcare directories and official registries
- crime and safety datasets

### Good enrichment sources

- OSM/Map data
- local city guides
- curated editorial research
- vetted provider feeds
- human review of neighborhood and lifestyle quality

## Field Split

### Sweep

These should be populated for every destination in a broad first pass.

| Field | Why it belongs in the sweep | Primary source family |
|---|---|---|
| Monthly climate | Stable, structured, and comparable across locations | Climate APIs and public climate datasets |
| Average grocery prices | Numeric and repeatable | Statistical price datasets, Numbeo-like sources |
| Rental prices | Comparable and high-signal for relocation | Statistical price datasets, rental market data |
| Purchase prices | Comparable and high-signal for relocation | Statistical price datasets, housing market data |
| Internet speeds | Structured infrastructure signal | Connectivity datasets, ISP aggregates |
| Utilities | Numeric and comparable | Cost-of-living datasets, utility datasets |
| Crime statistics | Structured safety signal | Official crime datasets, safety aggregators |
| Transit | Route and service structure can be normalized | Transit agencies, GTFS, official transit feeds |
| Airport routes | Structured route availability | Airport and airline route data |
| Tax information | Official and jurisdictional | Government tax portals, vetted summaries |
| Healthcare rankings | Rankable when sourced consistently | Official rankings, healthcare datasets |

### Hybrid

These can be swept first, then improved with local validation and editorial cleanup.

| Field | First-pass approach | Enrichment follow-up |
|---|---|---|
| Hospitals | Sweep directories and official listings | Validate service quality, specialties, and proximity |
| Neighborhoods | Sweep named areas and broad descriptors | Add livability notes, safety context, and positioning |
| Expat communities | Sweep community signals and clubs | Confirm active groups, channels, and density |
| Healthcare rankings | Sweep available rankings | Reconcile methodology and local relevance |

### Enrich

These are best handled after the baseline sweep because they depend on local judgment, freshness, or subjective quality.

| Field | Why it belongs in enrichment | Suggested source style |
|---|---|---|
| Best restaurants | Subjective and highly volatile | Local guides, curated editorial research |
| Coffee shops | Taste-driven and neighborhood-specific | Local guides, map validation |
| Farmers markets | Seasonal and locality-sensitive | City guides, local event calendars |
| Beaches | Depends on access, quality, and seasonality | Map data, travel guides, local reviews |
| Parks | Best with local context and proximity notes | Map data, city park directories |
| Hiking | Trail quality and accessibility need human judgment | Trail databases, local guides |
| Museums | Easy to list, but quality/fit is editorial | Cultural guides, official museum sites |
| Local events | Fast-changing and date-sensitive | City event calendars, venue listings |
| Neighborhood character notes | Requires lived-experience framing | Editorial synthesis from sweep data |

## Recommended Implementation Order

1. Sweep all structured fields for all 300 destinations.
2. Normalize and publish the baseline record.
3. Enrich hybrid fields for Tier 1 and Tier 2 destinations.
4. Add editorial lifestyle layers for the highest-value destinations only.
5. Expand enrichment to the long tail only after the baseline is stable.

## Operating Principle

If a field can be normalized consistently across 300 destinations, it belongs in the sweep.

If a field depends on taste, local context, or up-to-date lived experience, it belongs in enrichment.

If a field is both, sweep it first and enrich it later.
