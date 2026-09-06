export function isSmartShortlistPrototypeEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.SMART_SHORTLIST_LOCAL_PROTOTYPE === "1";
}