export const FLAGSHIP_DESTINATION_SLUGS = [
  "valencia-spain",
  "porto-portugal",
  "matera-italy",
  "chiang-mai-thailand",
  "lisbon-portugal",
  "tivat-montenegro",
  "rovinj-croatia",
  "trieste-italy",
] as const;

const FLAGSHIP_SET = new Set<string>(FLAGSHIP_DESTINATION_SLUGS);

export function isFlagshipDestination(slug: string): boolean {
  return FLAGSHIP_SET.has(slug);
}
