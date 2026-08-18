import Image from "next/image";
import Link from "next/link";

const AMALFI_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Albufeira_%28Portugal%29_%2810311600764%29.jpg/1280px-Albufeira_%28Portugal%29_%2810311600764%29.jpg";

const steps = [
  ["01", "Tell us about you", "Lifestyle, goals and priorities"],
  ["02", "AI analyzes matches", "Destinations scored against you"],
  ["03", "See your top matches", "A focused shortlist with context"],
  ["04", "Plan with confidence", "Compare, save and explore"],
];

export default function Hero() {
  return (
    <section className="relative min-h-[740px] overflow-hidden bg-[#03142a] pt-[72px] text-white lg:min-h-[780px]">
      <Image src="/images/costa-del-sol-hero.jpg" alt="Sunlit Mediterranean coast" fill priority unoptimized sizes="100vw" className="object-cover object-[52%_72%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,13,29,0.96)_0%,rgba(3,18,38,0.78)_38%,rgba(3,15,31,0.18)_73%,rgba(3,13,27,0.48)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,12,27,0.12)_40%,rgba(2,13,29,0.96)_100%)]" />

      <div className="relative mx-auto flex min-h-[668px] max-w-[1440px] flex-col px-5 pb-5 pt-8 sm:px-8 lg:min-h-[708px] lg:px-10 lg:pt-12">
        <div className="grid flex-1 items-center gap-8 md:grid-cols-[1.05fr_0.72fr] lg:gap-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e7b64f66] bg-[#03172dbd] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f3c968] backdrop-blur-md">
              <span>✦</span> AI-powered travel planning
            </div>
            <h1 className="mt-5 font-serif text-[3.3rem] font-semibold leading-[0.88] sm:text-6xl lg:text-[5.8rem]">
              Find where<span className="block text-[#f0bd56]">life fits best.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#e5edf6] sm:text-base">
              <span className="sr-only">DestinationFinderAI helps you discover, compare, and confidently choose places that fit your life.</span>
              <span aria-hidden="true">Personalized destination recommendations and smart planning tools to help you live your ideal journey.</span>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/life-match" data-testid="hero-cta-life-match" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#f5cb6c,#dda23a)] px-6 text-sm font-bold text-[#09213b] shadow-[0_16px_35px_-18px_#e7ad41] transition hover:-translate-y-0.5 hover:brightness-105">
                Start Your Journey <span className="ml-3">→</span>
              </Link>
              <Link href="#how-it-works" data-testid="hero-cta-explore-atlas" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#a8c4d963] bg-[#04192ebd] px-6 text-sm font-semibold text-white backdrop-blur transition hover:border-[#f0bd56]">
                See How It Works <span className="ml-3 text-[#66cbd0]">▶</span>
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#d9e5f0]">
              <span><b className="mr-2 text-[#f0bd56]">✣</b> AI-personalized</span>
              <span><b className="mr-2 text-[#f0bd56]">◉</b> Real destination data</span>
              <span><b className="mr-2 text-[#f0bd56]">◇</b> Built for confident choices</span>
            </div>
          </div>

          <aside className="relative mx-auto hidden w-full max-w-[390px] overflow-hidden rounded-2xl border border-[#d7ae5b78] bg-[#03152bea] shadow-[0_28px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:block">
            <div className="relative h-28 overflow-hidden">
              <Image src={AMALFI_IMAGE} alt="Mediterranean coast" fill sizes="390px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03152b] to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-[#06203cd9] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f3c968]">Your ideal getaway</span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-serif text-2xl">Albufeira, Portugal</h2><p className="mt-1 text-xs text-[#9eb7cb]">AI Match Score</p></div>
                <strong className="text-4xl text-[#42d1be]">96%</strong>
              </div>
              <div className="mt-4 grid gap-2 border-y border-white/10 py-4 text-xs">
                {[["Lifestyle Match", "Excellent"], ["Budget Fit", "Great"], ["Safety", "Excellent"], ["Weather", "Ideal"]].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between"><span className="text-[#c9d8e6]">{label}</span><span className="font-semibold text-[#f1c567]">{value} <b className="text-[#48d4b7]">●</b></span></div>
                ))}
              </div>
              <Link href="/life-match" className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#11aeb6] py-3 text-sm font-bold text-white transition hover:bg-[#19c2c8]">View Full Plan <span className="ml-3">→</span></Link>
            </div>
          </aside>
        </div>

        <div id="how-it-works" className="rounded-xl border border-[#caa6525c] bg-[#03172eed] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="font-serif text-lg text-[#f6ddb0]">How DestinationFinderAI Works</h2>
            <Link href="/life-match" className="hidden text-xs font-semibold text-[#62cbd0] sm:block">Find your match →</Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, description]) => (
              <div key={number} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#08223cbb] p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#45b7ba] text-[10px] font-bold text-[#69d5d4]">{number}</span>
                <div><h3 className="text-xs font-bold text-white">{title}</h3><p className="mt-1 text-[10px] leading-4 text-[#9fb3c7]">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
