import RouteFrame from "../components/RouteFrame";
import { destinations } from "../lib/destinations";
import CompareClient from "../components/CompareClient";

type SearchParams = Record<string, string | string[] | undefined>;
type ComparePageProps = {
  searchParams?: Promise<SearchParams>;
};

const parseSlugs = (value: string | string[] | undefined) => {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
};

const selectDestinations = (searchParams?: SearchParams) => {
  const requested = parseSlugs(searchParams?.slugs);
  const selected = requested.length
    ? destinations.filter((destination) => requested.includes(destination.slug))
    : destinations.slice(0, 3);
  return (selected.length ? selected : destinations.slice(0, 3)).slice(0, 4);
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selected = selectDestinations(params);
  const initialSlugs = selected.map((destination) => destination.slug);

  return (
    <RouteFrame
      eyebrow="Compare cities"
      title="Compare destinations side by side"
      description="Use this route to compare monthly cost, safety, healthcare, walkability, climate, taxes, internet, beaches, and golf for the destinations you care about."
      primaryAction={{ href: "/destinations", label: "Browse all destinations" }}
      secondaryAction={{ href: "/life-match", label: "Run Life Match" }}
    >
      <CompareClient destinations={destinations} initialSlugs={initialSlugs} />
    </RouteFrame>
  );
}