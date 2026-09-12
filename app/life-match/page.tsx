import { redirect } from "next/navigation";

export const metadata = {
  title: "Life Match | DestinationFinderAI",
  description: "Build a focused destination shortlist with Smart Shortlist.",
};

export default function LifeMatchPage() {
  redirect("/smart-shortlist");
}
