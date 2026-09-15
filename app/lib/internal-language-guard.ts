const INTERNAL_TOKENS = /\b(?:workbook|authoring(?:\s+methodology|\s+audit)?|importer|parser|validator|MERGE_NONBLANK|REPLACE_MODULE|destination_key|scaffold|source row)\b/i;

export function findInternalLanguage(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const match = value.match(INTERNAL_TOKENS);
  return match?.[0] ?? null;
}

export function hasRawImplementationValue(value: unknown): boolean {
  return value === true || value === false || (typeof value === "string" && /^[a-z]+(?:_[a-z]+)+$/i.test(value));
}
