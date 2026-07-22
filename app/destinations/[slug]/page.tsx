import { destinations } from "../../lib/destinations";
import DestinationGallery from "../../components/DestinationGallery";

interface DestinationPageProps {
  params: { slug: string };
}

export default function DestinationPage({ params }: DestinationPageProps) {
  const destination = destinations.find((item) => item.slug === params.slug);

  if (!destination) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-8 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <h1 className="text-4xl font-black">Destination not found</h1>
          <p className="mt-4 text-slate-400">Try returning to the homepage and selecting another destination.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section
        className="relative overflow-hidden px-8 py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.82), rgba(15,23,42,0.82)), url(${destination.images[0]?.src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/40 p-10 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="uppercase tracking-[0.35em] text-cyan-400">{destination.country}</p>
              <h1 className="mt-4 text-5xl font-black">{destination.city}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{destination.overview}</p>
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-slate-900/80 px-6 py-4 text-slate-300">
              <span className="text-5xl">{destination.emoji}</span>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Horizon match</p>
                <p className="mt-2 text-4xl font-black text-cyan-400">{destination.match}%</p>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-semibold text-white">Overview</h2>
              <p className="mt-4 text-slate-300 leading-7">{destination.description}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-semibold text-white">Climate</h2>
              <p className="mt-4 text-slate-300 leading-7">{destination.climate}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-semibold text-white">Lifestyle</h2>
              <p className="mt-4 text-slate-300 leading-7">{destination.lifestyle}</p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            <h2 className="text-xl font-semibold text-white">Transportation</h2>
            <p className="mt-4 text-slate-300 leading-7">{destination.transportation}</p>
          </div>
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black text-white">Destination gallery & travel media</h2>
          <DestinationGallery destination={destination} />
        </div>
      </section>
    </main>
  );
}
