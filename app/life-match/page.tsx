import LifeMatchApp from "../components/LifeMatchApp";
import { LAUNCH_CATALOG_SIZE } from "../lib/destinations";
import { RETIREMENT_DNA_TOTAL_QUESTIONS } from "../lib/retirement-dna";

export const metadata = {
  title: "Life Match | DestinationFinderAI",
  description:
    `Take the ${RETIREMENT_DNA_TOTAL_QUESTIONS}-question DestinationFinderAI Retirement DNA assessment to identify the top 10 retirement destinations from ${LAUNCH_CATALOG_SIZE} verified global locations.`,
};

export default function LifeMatchPage() {
  return (
    <main className="atlas-shell min-h-screen">
      <LifeMatchApp />
    </main>
  );
}
