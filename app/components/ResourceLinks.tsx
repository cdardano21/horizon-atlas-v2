import Link from "next/link";

type Resource = { title: string; description: string; href: string; scope: string; source: string; official?: boolean };
type ResourceGroup = { id: string; number: string; title: string; description: string; resources: Resource[] };

const groups: ResourceGroup[] = [
  { id: "visa", number: "01", title: "Visa & residency", description: "Start with primary government guidance for entry, residence, and long-stay pathways.", resources: [
    { title: "AIMA migration authority", description: "Residence and integration pathways from Portugal's migration authority.", href: "https://aima.gov.pt/en", scope: "Portugal", source: "Government portal", official: true },
    { title: "Immigration Services Agency", description: "Immigration and residence procedures for foreign nationals.", href: "https://www.moj.go.jp/isa/?hl=en", scope: "Japan", source: "Government portal", official: true },
  ] },
  { id: "finance", number: "02", title: "Taxes, cost & housing", description: "Frame the questions to take to a qualified adviser, then pressure-test day-to-day costs.", resources: [
    { title: "Portugal residence summary", description: "Tax-residency framework covering the 183-day and habitual-residence tests.", href: "https://taxsummaries.pwc.com/portugal/individual/residence", scope: "Portugal", source: "PwC Tax Summaries" },
    { title: "Valencia cost of living", description: "User-contributed baseline for food, utilities, transport, and rent.", href: "https://www.numbeo.com/cost-of-living/in/Valencia", scope: "Valencia, Spain", source: "User-contributed database" },
    { title: "Valencia property prices", description: "User-contributed rent and purchase baseline by central and outer areas.", href: "https://www.numbeo.com/property-investment/in/Valencia", scope: "Valencia, Spain", source: "User-contributed database" },
  ] },
  { id: "health", number: "03", title: "Healthcare & safety", description: "Understand national systems, emergency access, and the institutions behind local planning.", resources: [
    { title: "SNS 24", description: "Portugal's National Health Service digital and contact gateway.", href: "https://www.sns24.gov.pt/en/", scope: "Portugal", source: "Government portal", official: true },
    { title: "Spanish Ministry of Health", description: "National health-system information and citizen guidance.", href: "https://www.sanidad.gob.es/en/home.htm", scope: "Spain", source: "Government portal", official: true },
    { title: "European emergency number 112", description: "Italy's official service and operational guidance for the 112 emergency number.", href: "https://www.112.gov.it/en/", scope: "Italy", source: "Government portal", official: true },
  ] },
  { id: "mobility", number: "04", title: "Transportation & access", description: "Check the networks that determine everyday mobility and wider regional reach.", resources: [
    { title: "ANA Portugal airports", description: "Official airport-network and passenger gateway for Portugal.", href: "https://www.ana.pt/en", scope: "Portugal", source: "Official operator", official: true },
    { title: "Trenitalia", description: "National and regional rail planning across Italy.", href: "https://www.trenitalia.com/en.html", scope: "Italy", source: "Official operator", official: true },
  ] },
  { id: "local", number: "05", title: "Local & climate research", description: "Move from national policy into local orientation, seasonality, and place-specific context.", resources: [
    { title: "Visit Kanazawa", description: "Official destination planning and local orientation portal.", href: "https://visitkanazawa.jp/en", scope: "Kanazawa, Japan", source: "Official destination site", official: true },
    { title: "Valencia monthly climate", description: "Month-by-month temperature, rainfall, and sunshine planning reference.", href: "https://www.weather2travel.com/spain/valencia/climate/", scope: "Valencia, Spain", source: "Climate guide" },
    { title: "Porto Montenegro", description: "Official district reference for residences, marina access, and local services.", href: "https://www.portomontenegro.com/", scope: "Tivat, Montenegro", source: "Official district site", official: true },
  ] },
];

export default function ResourceLinks() {
  return (
    <main className="min-h-screen bg-[#eef0eb] text-[#122434]">
      <section className="relative overflow-hidden border-b border-[#183a4b]/15 bg-[#061a2e] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(88,199,196,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(88,199,196,0.18)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative mx-auto grid min-h-[540px] max-w-[1440px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div className="max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#62d0cc]">Destination research desk</p><h1 className="mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">Research the move, not just the view.</h1><p className="mt-6 max-w-xl text-base leading-7 text-[#c6d3de] sm:text-lg sm:leading-8">A structured starting point for the policy, cost, health, housing, safety, and mobility questions behind a serious relocation decision.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="#resource-index" className="inline-flex min-h-11 items-center justify-center bg-[#e5b654] px-5 text-sm font-bold text-[#06172c]">Open research index</Link><Link href="/destinations" className="inline-flex min-h-11 items-center justify-center border border-white/20 px-5 text-sm font-semibold text-white">Browse destination guides</Link></div></div>
          <div className="border border-white/15 bg-[#0a243a]/90 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#58c7c4]">Research file</p><p className="mt-1 font-serif text-2xl">Decision due diligence</p></div><span className="font-mono text-xs text-[#e5b654]">DF / 05</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{groups.map((group) => <a key={group.id} href={`#${group.id}`} className="group border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#58c7c4]/60"><div className="flex items-start justify-between gap-3"><span className="font-mono text-[10px] text-[#e5b654]">{group.number}</span><span className="text-sm text-[#58c7c4] transition group-hover:translate-x-0.5" aria-hidden="true">&rarr;</span></div><p className="mt-4 text-sm font-bold text-white">{group.title}</p><p className="mt-1 text-xs leading-5 text-[#91a7b9]">{group.resources.length} starting points</p></a>)}</div>
            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-[#91a7b9]">Source labels reflect the repository record. Third-party references are identified and are not presented as official guidance.</p>
          </div>
        </div>
      </section>

      <section id="resource-index" className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 sm:py-18 lg:px-10">
        <div className="grid gap-6 border-b border-[#183a4b]/15 pb-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-end"><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1d7473]">Curated research index</p><div><h2 className="text-4xl leading-tight sm:text-5xl">Begin with primary sources. Keep the caveats visible.</h2><p className="mt-4 max-w-2xl leading-7 text-[#4a5d67]">These links already support DestinationFinderAI destination research. They are starting points, not legal, tax, medical, or financial advice.</p></div></div>
        <div className="mt-12 space-y-14">{groups.map((group) => <section key={group.id} id={group.id} className="scroll-mt-8"><div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr]"><div><div className="flex items-center gap-3"><span className="font-mono text-xs font-bold text-[#b17b27]">{group.number}</span><span className="h-px w-10 bg-[#1d7473]" /></div><h3 className="mt-4 text-3xl sm:text-4xl">{group.title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-[#54666f]">{group.description}</p></div><div className="grid gap-px overflow-hidden border border-[#183a4b]/15 bg-[#183a4b]/15 md:grid-cols-3">{group.resources.map((resource) => <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer" className="group flex min-h-[230px] flex-col bg-[#f7f8f3] p-5 transition hover:bg-white"><div className="flex items-start justify-between gap-3"><span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#1d7473]">{resource.scope}</span><span className="text-lg text-[#b17b27] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">&#8599;</span></div><h4 className="mt-6 text-2xl leading-tight">{resource.title}</h4><p className="mt-3 text-sm leading-6 text-[#53636b]">{resource.description}</p><div className="mt-auto flex flex-wrap items-center gap-2 pt-6"><span className="border border-[#183a4b]/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#53636b]">{resource.source}</span>{resource.official ? <span className="bg-[#dcebe5] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#1b625f]">Official source</span> : null}</div></a>)}</div></div></section>)}</div>
      </section>

      <section className="border-t border-[#183a4b]/15 bg-[#dfe6df]"><div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1d7473]">Put the research in context</p><h2 className="mt-3 text-4xl">See how these questions change by destination.</h2></div><div className="flex flex-wrap gap-3"><Link href="/destinations" className="inline-flex min-h-11 items-center justify-center bg-[#0b3145] px-5 text-sm font-bold text-white">Explore destinations</Link><Link href="/compare" className="inline-flex min-h-11 items-center justify-center border border-[#0b3145]/30 px-5 text-sm font-bold text-[#0b3145]">Compare finalists</Link></div></div></section>
    </main>
  );
}
