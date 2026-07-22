import LifeMatchApp from "../components/LifeMatchApp";
import { destinations } from "../lib/destinations";

export const metadata = {
  title: "Life Match | Horizon Atlas",
  description:
    "Take the Horizon Atlas Life Match to identify the top 10 retirement destinations from 500 global locations.",
};

export default function LifeMatchPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <LifeMatchApp destinations={destinations} />
    </main>
  );
}
