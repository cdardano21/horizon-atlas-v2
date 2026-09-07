import { notFound } from "next/navigation";
import SmartShortlistPrototype from "../components/smart-shortlist/SmartShortlistPrototype";
import { isSmartShortlistPrototypeEnabled } from "../lib/smart-shortlist/feature-flag";
import { loadSmartShortlistData } from "../lib/smart-shortlist/server-data";

export default async function SmartShortlistPage() {
  if (!isSmartShortlistPrototypeEnabled()) notFound();
  const { candidates, intelligence, affordabilityRecords } = await loadSmartShortlistData();
  return <SmartShortlistPrototype candidates={candidates} intelligence={intelligence} affordabilityRecords={affordabilityRecords} />;
}