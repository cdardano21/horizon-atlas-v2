# Destination media candidate workflow

This workflow separates automated discovery from production adoption:

```text
DISCOVER -> VALIDATE -> HUMAN REVIEW -> APPROVE -> ADOPTION PLAN -> SEPARATE PRODUCTION CHANGE
```

Discovery never edits `app/lib/curatedCityImages.ts`, `app/lib/curatedCityImageGalleries.ts`, destination data, Supabase, or workbooks. The production maps are read only to stop if a pilot destination already has media.

## 1. Discover and validate

```sh
npm run media:discover
```

The ten-destination pilot is defined in `pilot-10-destinations.json`. Discovery has a hard maximum of 25 destinations and accepts one to three candidates per destination. It writes:

- `pilot-10-media-candidates.json`: complete staged evidence and validation state.
- `pilot-10-dry-run.md`: human-readable pilot summary.

Candidates that pass deterministic checks remain `needs_review`; they are not approved automatically.

## 2. Human review

Review exactly one candidate at a time:

```sh
npm run media:review -- \
  --manifest=docs/media-pipeline/pilot-10-media-candidates.json \
  --candidate=<candidate-id> \
  --decision=approved \
  --reviewer=<reviewer-name>
```

A rejection also requires `--reason=...`. Validation failures cannot be approved through this command.

## 3. Build an adoption plan

```sh
npm run media:adoption-plan -- \
  --manifest=docs/media-pipeline/pilot-10-media-candidates.json \
  --out=docs/media-pipeline/pilot-10-adoption-plan.json \
  --reviewer=<publisher-name>
```

The command fails if the manifest contains no explicitly approved candidates. The plan records `productionWritePerformed: false`; adopting it into runtime maps requires a separate reviewed implementation change.

## Deterministic validation

The validator checks:

- Exact slug, city, and country ownership evidence.
- Same-name-city ambiguity with country evidence.
- HTTPS and trusted Wikimedia hosts.
- Canonical source page.
- Creator and required attribution.
- Compatible Creative Commons or public-domain license and canonical license URL.
- HTTP status, redirect destination, MIME type, minimum dimensions, and SHA-256 checksum.
- Normalized URL duplicates and checksum duplicates.
- Explicit review and adoption state transitions.

## Residual risk

Cryptographic checksums catch byte-identical files but not visually equivalent resizes or crops. Perceptual hashing is intentionally deferred because the repository has no existing image-hash dependency. Add it only after reviewing a maintained dependency and defining a false-positive threshold; human visual review remains mandatory meanwhile.
