export function isSmartShortlistPrototypeEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.SMART_SHORTLIST_LOCAL_PROTOTYPE === "1";
}

export function getMatchingExperience() {
  return isSmartShortlistPrototypeEnabled()
    ? { href: "/smart-shortlist", label: "Smart Shortlist" }
    : { href: "/life-match", label: "Life Match" };
}