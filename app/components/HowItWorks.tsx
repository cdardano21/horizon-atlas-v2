import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    number: "01",
    eyebrow: "Your priorities",
    title: "Tell us what matters",
    description: "Life Match turns your preferences across lifestyle, cost, climate, healthcare, mobility, and everyday rhythm into a clear decision profile.",
    image: "/images/product-previews/life-match-crop.jpg",
    alt: "The real DestinationFinderAI Life Match welcome screen",
    href: "/life-match",
    linkLabel: "Start Life Match",
  },
  {
    number: "02",
    eyebrow: "A ranked shortlist",
    title: "Discover your strongest matches",
    description: "Your completed assessment ranks destinations around the priorities you selected, with enough context to understand why each place rose to the top.",
    image: "/images/product-previews/life-match-results-crop.jpg",
    alt: "The real DestinationFinderAI recommendation results surface",
    href: "/results",
    linkLabel: "See the results experience",
  },
  {
    number: "03",
    eyebrow: "Evidence, not postcards",
    title: "Explore destinations deeply",
    description: "Move from a shortlist into practical detail: neighborhoods, climate, healthcare, mobility, costs, local character, and the tradeoffs worth investigating.",
    image: "/images/product-previews/lisbon-destination-crop.jpg",
    alt: "The real DestinationFinderAI Lisbon destination guide",
    href: "/destinations/lisbon-portugal",
    linkLabel: "Explore Lisbon",
  },
  {
    number: "04",
    eyebrow: "Decision mode",
    title: "Compare your finalists",
    description: "Put up to four places side by side. Shared categories, leading scores, and honest missing-data states make the differences easier to see.",
    image: "/images/product-previews/compare-board-crop.jpg",
    alt: "The real DestinationFinderAI Compare experience",
    href: "/compare",
    linkLabel: "Open Compare",
  },
];

export default function HowItWorks() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#04162b] text-white">
      <section className="relative min-h-[620px] overflow-hidden border-b border-white/10">
        <Image src="/images/how-it-works-cape-town-aerial-hero.jpg" alt="Aerial view of Cape Town where coastline, roads, and city meet" fill priority sizes="100vw" className="object-cover object-[66%_52%] sm:object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,37,0.97)_0%,rgba(3,18,37,0.88)_40%,rgba(3,18,37,0.22)_75%,rgba(3,18,37,0.32)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,18,37,0.08),transparent_52%,#04162b_100%)]" />
        <div className="relative mx-auto flex min-h-[620px] max-w-[1440px] items-end px-5 pb-16 pt-24 sm:px-8 lg:px-10 lg:pb-20">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#62d0cc]">How DestinationFinderAI works</p>
            <h1 className="mt-5 max-w-2xl text-5xl leading-[0.96] sm:text-6xl lg:text-7xl">From possibilities to the place that fits.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#d5e1eb] sm:text-lg sm:leading-8">Five clear steps turn personal priorities into a shortlist you can investigate, compare, and act on with more confidence.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/life-match" className="inline-flex min-h-11 items-center justify-center bg-[#e5b654] px-5 text-sm font-bold text-[#06172c] transition hover:bg-[#f0c66e]">Start Life Match <span className="ml-3" aria-hidden="true">&rarr;</span></Link>
              <Link href="#journey" className="inline-flex min-h-11 items-center justify-center border border-white/25 bg-[#03172dc7] px-5 text-sm font-semibold text-white transition hover:border-[#62d0cc]">See the journey</Link>
            </div>
          </div>
        </div>
        <a href="https://commons.wikimedia.org/wiki/File:Aerial_View_of_Cape_Town_(iau2305a).jpg" target="_blank" rel="noreferrer" className="absolute bottom-4 right-5 text-[9px] text-white/55 hover:text-white">Cape Town aerial: Marlin Clark / Unsplash, CC BY 4.0</a>
      </section>

      <section id="journey" className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mb-12 grid gap-6 border-b border-white/10 pb-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#e5b654]">One connected workflow</p>
          <div>
            <h2 className="text-4xl leading-tight sm:text-5xl">A decision journey you can understand in under a minute.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#aebdca]">Each stage builds on the last. The screens below are live product surfaces captured from this app, not concept mockups.</p>
          </div>
        </div>

        <div className="space-y-14 sm:space-y-20">
          {steps.map((step, index) => (
            <article key={step.number} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-[#e5b654]">{step.number}</span>
                  <span className="h-px w-10 bg-[#58c7c4]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#58c7c4]">{step.eyebrow}</p>
                </div>
                <h3 className="mt-5 text-4xl leading-tight sm:text-5xl">{step.title}</h3>
                <p className="mt-5 max-w-lg text-base leading-7 text-[#b9c7d3]">{step.description}</p>
                <Link href={step.href} className="mt-7 inline-flex items-center border-b border-[#e5b654]/60 pb-1 text-sm font-bold text-[#f0c66e] transition hover:border-[#f0c66e]">{step.linkLabel} <span className="ml-3" aria-hidden="true">&rarr;</span></Link>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <div className="overflow-hidden border border-white/15 bg-[#071b31] shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
                  <div className="flex h-9 items-center gap-1.5 border-b border-white/10 bg-[#0a223b] px-4"><span className="h-2 w-2 rounded-full bg-[#e5b654]" /><span className="h-2 w-2 rounded-full bg-[#58c7c4]" /><span className="h-2 w-2 rounded-full bg-white/25" /><span className="ml-3 text-[9px] uppercase tracking-[0.18em] text-[#8fa4b6]">DestinationFinderAI</span></div>
                  <div className="relative aspect-[16/10] overflow-hidden"><Image src={step.image} alt={step.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover object-top" /></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#061c33]">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10 lg:py-20">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#58c7c4]">Step 05 / Move forward with confidence</p><h2 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">A better decision starts with knowing what “better” means for you.</h2><p className="mt-5 max-w-2xl leading-7 text-[#aebdca]">Start with your priorities or browse the catalog first. Either path brings you into the same connected decision workflow.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/life-match" className="inline-flex min-h-11 items-center justify-center bg-[#e5b654] px-5 text-sm font-bold text-[#06172c]">Take Life Match</Link><Link href="/destinations" className="inline-flex min-h-11 items-center justify-center border border-white/20 px-5 text-sm font-semibold text-white">Explore destinations</Link></div>
        </div>
      </section>
    </main>
  );
}
