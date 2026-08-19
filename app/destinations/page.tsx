import Image from "next/image";
import DestinationSearch from "../components/DestinationSearch";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { getPublicDestinations } from "../lib/public-destinations";

type DestinationsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function DestinationsPage({ searchParams }: DestinationsPageProps) {
  const params = await searchParams;
  const publicDestinations = await getPublicDestinations();
  const featuredCountries = Array.from(new Set(publicDestinations.map((destination) => destination.country))).slice(0, 5);

  return (
    <main className="atlas-shell min-h-screen bg-[linear-gradient(180deg,#03142a_0%,#061d37_52%,#04152b_100%)] text-[#edf2fb]">
      <Navbar />

      <section className="relative isolate min-h-[610px] overflow-hidden border-b border-[#e4b85230] pt-[72px] sm:min-h-[650px]">
        <Image
          src="/images/destinations-explore-piran-hero.jpg"
          alt="Piran's terracotta old town above the bright blue Adriatic Sea"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[82%_50%] brightness-[1.08] contrast-[1.05] saturate-[1.18] sm:object-[64%_54%] lg:object-[58%_58%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,14,32,0.92)_0%,rgba(3,20,42,0.56)_48%,rgba(3,20,42,0.06)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,20,42,0.03)_0%,rgba(3,20,42,0.08)_58%,#03142a_100%)]" />

        <div className="relative mx-auto flex min-h-[538px] max-w-[1440px] items-center px-5 py-14 sm:min-h-[578px] sm:px-8 lg:px-10">
          <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55c7c9]">Destination discovery</p>
              <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.04] text-[#fff8ef] sm:text-6xl lg:text-7xl">
                Explore your next destination.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#d7e3ef] sm:text-lg">
                Discover places through the details that shape real life: climate, cost, healthcare, neighborhood feel, and everyday rhythm.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {featuredCountries.map((country) => (
                  <span key={country} className="rounded-full border border-[#f4d08b55] bg-[#031a31b8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f9deb0] backdrop-blur-md">
                    {country}
                  </span>
                ))}
              </div>
          </div>
        </div>

        <p className="absolute right-5 top-[84px] z-10 max-w-[220px] text-right text-[9px] text-[#d7e3efb8] sm:right-8 lg:right-10">
          <a href="https://commons.wikimedia.org/wiki/File:Piran,_Slovenia,_Viewpoint.jpg" target="_blank" rel="noreferrer" className="underline decoration-[#d7e3ef66] underline-offset-2 hover:text-white">Piran, Slovenia · Etienne O. Dallaire</a>
          {" · "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline decoration-[#d7e3ef66] underline-offset-2 hover:text-white">CC BY 4.0</a>
          {" · resized"}
        </p>
      </section>

      <DestinationSearch destinations={publicDestinations} initialQuery={params.q ?? ""} />
      <Footer />
    </main>
  );
}
