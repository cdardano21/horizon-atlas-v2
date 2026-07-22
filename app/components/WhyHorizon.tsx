const reasons = [
  {
    title: "Personalized AI guidance",
    description:
      "Horizon Atlas matches your lifestyle priorities with destinations, not just cost metrics.",
  },
  {
    title: "Data you can trust",
    description:
      "Every recommendation is backed by lifestyle, healthcare, climate, and community insights.",
  },
  {
    title: "Move beyond generic rankings",
    description:
      "We help you answer the real question: could I actually build a life here?",
  },
];

export default function WhyHorizon() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-28">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="uppercase tracking-[0.35em] text-cyan-400">Why Horizon Atlas</p>
          <h2 className="mt-4 text-5xl font-black">
            Designed to help you find the right place for the next chapter.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Our platform combines AI scoring, destination intelligence, and real-world lifestyle factors so you can explore retirement and relocation options with confidence.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-white/[0.07]"
            >
              <h3 className="text-2xl font-bold text-white">{reason.title}</h3>
              <p className="mt-4 text-slate-400 leading-7">{reason.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
