import SmartShortlistPrototype from "../components/smart-shortlist/SmartShortlistPrototype";
import { loadSmartShortlistData } from "../lib/smart-shortlist/server-data";

export default async function SmartShortlistPage() {
  const { candidates, intelligence, affordabilityRecords } = await loadSmartShortlistData();
  return <SmartShortlistPrototype candidates={candidates} intelligence={intelligence} affordabilityRecords={affordabilityRecords} />;
}