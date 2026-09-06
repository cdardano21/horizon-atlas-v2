import { notFound } from "next/navigation";
import SmartShortlistPrototype from "../components/smart-shortlist/SmartShortlistPrototype";
import { isSmartShortlistPrototypeEnabled } from "../lib/smart-shortlist/feature-flag";

export default function SmartShortlistPage() {
  if (!isSmartShortlistPrototypeEnabled()) notFound();
  return <SmartShortlistPrototype />;
}