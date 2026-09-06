import { notFound } from "next/navigation";
import SmartShortlistPrototype from "../components/smart-shortlist/SmartShortlistPrototype";
import { isSmartShortlistPrototypeEnabled } from "../lib/smart-shortlist/feature-flag";
import { loadSmartShortlistIntelligence } from "../lib/smart-shortlist/server-data";

export default async function SmartShortlistPage() {
  if (!isSmartShortlistPrototypeEnabled()) notFound();
  const intelligence = await loadSmartShortlistIntelligence();
  return <SmartShortlistPrototype intelligence={intelligence} />;
}