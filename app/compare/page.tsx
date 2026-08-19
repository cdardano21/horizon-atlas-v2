import Image from "next/image";
import Link from "next/link";
import { getPublicDestinations } from "../lib/public-destinations";
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

const selectDestinations = (publicDestinations: ReturnType<typeof getPublicDestinations> extends Promise<infer T> ? T : never, searchParams?: SearchParams) => {
  const requested = parseSlugs(searchParams?.slugs);
  const selected = requested.length
    ? publicDestinations.filter((destination) => requested.includes(destination.slug))
    : publicDestinations.slice(0, 3);
  return (selected.length ? selected : publicDestinations.slice(0, 3)).slice(0, 4);
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const publicDestinations = await getPublicDestinations();
  const selected = selectDestinations(publicDestinations, params);
  const initialSlugs = selected.map((destination) => destination.slug);

  return (
    <main className="min-h-screen bg-[#04162b] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <Image
          src="/images/compare-singapore-marina-bay-flyer-hero.jpg"
          alt="Singapore skyline at night with Marina Bay Sands, the downtown core, and the illuminated Singapore Flyer reflected across Marina Bay"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.82] contrast-[1.08]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,37,0.97)_0%,rgba(3,18,37,0.9)_35%,rgba(3,18,37,0.62)_58%,rgba(3,18,37,0.52)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,18,37,0.08),transparent_42%,rgba(3,18,37,0.42))]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,#04162b)]" />

        <div className="relative mx-auto flex min-h-[390px] max-w-[1440px] items-end px-5 py-12 sm:min-h-[330px] sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#58c7c4]">Destination decision cockpit</p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-[1.02] text-white sm:text-5xl lg:text-6xl">
              Compare the places that could become your life.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#c4d1dc] sm:text-lg sm:leading-8">
              Put up to four destinations side by side, then narrow the field through cost, climate, healthcare, mobility, lifestyle, and the tradeoffs that change a move.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/destinations" className="inline-flex min-h-11 items-center justify-center bg-[#e5b654] px-5 text-sm font-bold text-[#06172c] transition hover:bg-[#f0c66e]">
                Browse destinations
              </Link>
              <Link href="/life-match" className="inline-flex min-h-11 items-center justify-center border border-white/25 bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:border-[#58c7c4]">
                Run Life Match
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <CompareClient destinations={publicDestinations} initialSlugs={initialSlugs} />
      </section>
    </main>
  );
}