import Image from "next/image";
import Link from "next/link";

const destinations = [
  {
    city: "Albufeira",
    country: "Portugal",
    match: "95% Match",
    note: "Coastal ease & sunshine",
    slug: "albufeira-portugal",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Albufeira_%28Portugal%29_%2810311600764%29.jpg/1280px-Albufeira_%28Portugal%29_%2810311600764%29.jpg",
  },
  {
    city: "Annecy",
    country: "France",
    match: "93% Match",
    note: "Lakeside calm & culture",
    slug: "annecy-france",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Lac_d%27Annecy.jpg/1280px-Lac_d%27Annecy.jpg",
  },
  {
    city: "Barcelona",
    country: "Spain",
    match: "92% Match",
    note: "Energy, food & design",
    slug: "barcelona-spain",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Evening_light_over_Barcelona.jpg/1280px-Evening_light_over_Barcelona.jpg",
  },
  {
    city: "Chania",
    country: "Greece",
    match: "91% Match",
    note: "Harbor life & warm days",
    slug: "chania-greece",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Aerial_view_of_the_Old_Venetian_Harbour_in_Chania%2C_Greece.jpg/1280px-Aerial_view_of_the_Old_Venetian_Harbour_in_Chania%2C_Greece.jpg",
  },
];

const comparison = [
  ["AI Match Score", "95%", "93%", "92%", "91%"],
  ["Monthly Cost", "$1,720", "$2,340", "$2,180", "$1,890"],
  ["Climate", "Warm", "Seasonal", "Sunny", "Warm"],
];

export default function HomepageShowcase() {
  return (
    <section className="bg-[linear-gradient(180deg,#03142a_0%,#061d37_100%)] px-5 pb-16 pt-7 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-4 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55c7c9]">Curated for your lifestyle</p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl">Top destinations for you</h2>
          </div>
          <Link href="/destinations" className="text-xs font-semibold text-[#eabc5b]">View all destinations →</Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination) => (
            <Link key={destination.slug} href={`/destinations/${destination.slug}`} className="group relative min-h-48 overflow-hidden rounded-lg border border-[#d8ad554f] bg-[#09223d] shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
              <Image src={destination.image} alt={`${destination.city}, ${destination.country}`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021326f5] via-[#031a3142] to-[#031a311a]" />
              <span className="absolute left-3 top-3 rounded-full bg-[#05243dd9] px-2.5 py-1 text-[10px] font-bold text-[#67d3c5] backdrop-blur">● {destination.match}</span>
              <span className="absolute right-3 top-3 text-xl text-white">♡</span>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-serif text-xl">{destination.city}, {destination.country}</h3>
                <p className="mt-1 text-xs text-[#d3deea]">{destination.note}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="overflow-hidden rounded-xl border border-[#d8ad5548] bg-[#061a32]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-serif text-2xl">Compare destinations side by side</h2>
              <p className="mt-1 text-xs text-[#9eb2c6]">See how your top choices stack up across what matters most.</p>
            </div>
            <div className="overflow-x-auto p-3 sm:p-5">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold text-[#f0c05f]">
                  <span />{destinations.map((destination) => <span key={destination.city}>{destination.city}</span>)}
                </div>
                <div className="mt-3 grid gap-2">
                  {comparison.map((row) => (
                    <div key={row[0]} className="grid grid-cols-5 gap-2 rounded-md bg-[#0a2745] px-3 py-2 text-center text-xs text-[#dce6ef]">
                      {row.map((value, index) => <span key={`${row[0]}-${value}`} className={index === 0 ? "text-left text-[#9fb4c9]" : index > 0 && row[0] === "AI Match Score" ? "font-bold text-[#54cfbf]" : ""}>{value}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-[#d8ad5548] bg-[linear-gradient(145deg,#08223f,#06182f)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55c7c9]">Real insights. Smarter decisions.</p>
            <h2 className="mt-2 font-serif text-2xl">Move from inspiration to a confident shortlist.</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["973", "Destinations"], ["50K+", "Data points"], ["18+", "Categories"], ["98%", "User clarity"]].map(([value, label]) => (
                <div key={label} className="border-l-2 border-[#e8b957] pl-3"><strong className="block text-xl text-[#f0c05f]">{value}</strong><span className="text-[10px] text-[#a8bacb]">{label}</span></div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-[#c7d5e2]">Explore verified destination imagery, meaningful tradeoffs, and AI-guided recommendations in one focused experience.</p>
            <Link href="/life-match" className="mt-5 inline-flex rounded-lg bg-[#12aeb5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1bc2c8]">Build my Life Match →</Link>
          </article>
        </div>
      </div>
    </section>
  );
}
