# Destination workbook import plan

## Source
- Workbook: 22destinations-added-50-international-external-research.xlsx
- Worksheet: destinations
- Expected import target: app/lib/destinations.ts

## Findings
- The workbook contains a single worksheet with 1000 data rows plus a header row.
- The workbook exposes 972 unique destination slugs after duplicate-slug resolution.
- The current DestinationFinderAI destination catalog is loaded from app/lib/destinations.ts.
- The current app already contains the same destination slug set, so the import will preserve existing destination content and use the workbook as the canonical source for core fields.

## Import approach
1. Back up the destination data modules before editing.
2. Read the workbook rows and normalize each destination entry.
3. Resolve duplicate slugs by keeping the first valid row per slug.
4. Merge workbook values into the existing destination catalog while preserving existing image references and destination-specific app content where available.
5. Validate that the generated destination array remains TypeScript-safe and that the app still builds.
