# Final Production Readiness Report

Generated at: 2026-07-26T08:18:19.224Z
Audit base URL: http://127.0.0.1:3001

## Validation Summary

- Core route HTTP checks: PASS (15/15)
- Destination route HTTP checks: PASS (600/600)
- Destination map-resource publish checks: PASS (600/600)
- Destination broken resource links: 0
- Destination broken image markup issues: 0
- Manual factual review required: 600
- Manual image verification required: 550

## Broken Links and Images

- Broken destination resource links: 0
- Broken image markup issues: 0
- Broken-link sample: None
- Broken-image sample: None

## Missing and Duplicate Content

- Missing destination field flags: 6000
- Missing destination narrative flags: 693
- Duplicate narrative flags: 18
- Destinations with duplicate narrative text: 16
- Duplicate-content sample: toledo-spain, helsinki-other-europe, tallinn-other-europe, budapest-other-europe, copenhagen-other-europe, stockholm-other-europe, san-jose-california-united-states, toledo-ohio-united-states, manchester-new-hampshire-united-states, manchester-united-kingdom, copenhagen-denmark, stockholm-sweden, helsinki-finland, tallinn-estonia, budapest-hungary, san-jose-costa-rica

## Photo Verification Status

- Verified photo status: 50
- Photo review required: 550

## Remaining Technical Debt

- External-link verification backlog exists for 300 destinations
- Image verification backlog exists for 550 destinations
- Low-confidence factual coverage exists for 59 destinations

## Remaining Data-Quality Issues

- Missing field flags: 6000
- Destinations missing monthly climate rows: 600
- Destinations with no external source links: 300
- Destinations flagged for low confidence: 59

## Manual Factual Review Destinations

- Total: 600
- Sample: a-coruna-spain, aarhus-denmark, abu-dhabi-united-arab-emirates, adelaide-australia, agios-nikolaos-greece, aix-en-provence-france, aix-les-bains-france, albufeira-portugal, albuquerque-new-mexico-united-states, alesund-other-europe, alexandria-virginia-united-states, alghero-italy, alicante-spain, almaty-kazakhstan, altea-spain, amarillo-texas-united-states, amsterdam-netherlands, anaheim-california-united-states, anchorage-alaska-united-states, angra-do-heroismo-portugal, annapolis-maryland-united-states, annecy-france, antalya-turkey, antibes-france, aomori-japan

## Manual Image Verification Destinations

- Total: 550
- Sample: a-coruna-spain, aarhus-denmark, abu-dhabi-united-arab-emirates, adelaide-australia, agios-nikolaos-greece, aix-en-provence-france, aix-les-bains-france, albufeira-portugal, albuquerque-new-mexico-united-states, alesund-other-europe, alexandria-virginia-united-states, almaty-kazakhstan, altea-spain, amarillo-texas-united-states, amsterdam-netherlands, anaheim-california-united-states, anchorage-alaska-united-states, angra-do-heroismo-portugal, annapolis-maryland-united-states, annecy-france, antalya-turkey, antibes-france, aosta-italy, arezzo-italy, arles-france

## Recommended Next Priorities

1. Close the image verification queue first, prioritizing destinations with missing image URLs or duplicate primary assets.
2. Add asynchronous external-link health probing with cached status history and retry windows for transient failures.
3. Backfill monthly climate rows and missing source links for destinations currently flagged with missing fields.
4. Promote deterministic UI selectors (data-testid) as a required convention for all new interactive components.
5. Run validate:all and production_readiness_audit on CI for every PR before merge.

