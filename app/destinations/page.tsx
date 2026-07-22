import DestinationSearch from "../components/DestinationSearch";
import { destinations } from "../lib/destinations";

export default function DestinationsPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <DestinationSearch destinations={destinations} initialQuery={searchParams.q ?? ""} />
    </main>
  );
}
