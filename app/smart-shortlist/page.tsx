import SmartShortlistPrototype from "../components/smart-shortlist/SmartShortlistPrototype";
import { loadPublishedSmartShortlistData } from "../lib/smart-shortlist/server-data";

export default async function SmartShortlistPage() {
  const { candidates, intelligence, affordabilityRecords } = await loadPublishedSmartShortlistData();
  return <SmartShortlistPrototype candidates={candidates} intelligence={intelligence} affordabilityRecords={affordabilityRecords} />;
}