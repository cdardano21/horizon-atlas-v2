// Shared "render only when valid module data exists" convention.
//
// Use this for any FUTURE optional destination module (pickleball, EV charging, wildfire risk,
// air quality, marina access, ski access, etc.) so a destination missing the module renders with
// the section omitted entirely, never as an empty/placeholder shell. This does not change any
// existing rendering - it is new, additive infrastructure for modules that don't exist yet.
//
// Usage:
//   if (hasRenderableModuleData(destination.pickleball)) {
//     // render the pickleball section
//   }
//
// A module is considered present only if it is a non-null object/array with at least one
// meaningful (non-blank) value - an object where every field is null/empty, or an empty array,
// is treated the same as "absent" so a partially-imported module never produces a visually empty card.
export function hasRenderableModuleData(value: unknown): boolean {
  if (value == null) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0 && value.some((item) => hasRenderableModuleData(item));
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((fieldValue) => {
      if (fieldValue == null) return false;
      if (typeof fieldValue === "string") return fieldValue.trim().length > 0;
      if (Array.isArray(fieldValue)) return fieldValue.length > 0;
      return true;
    });
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return Boolean(value);
}
