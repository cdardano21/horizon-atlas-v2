#!/usr/bin/env node

console.warn("build_destination_image_galleries.mjs now stages candidates only; direct production-map publishing has been retired.");
await import("./stage_destination_media_candidates.mjs");
