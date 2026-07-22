"use client";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-8 py-28">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="uppercase tracking-[0.35em] text-cyan-400">Contact</p>
          <h2 className="mt-4 text-5xl font-black">
            Ready to find your ideal retirement destination?
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Send us a message and a Horizon Atlas specialist will guide you through the next steps.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-lg shadow-slate-950/30 backdrop-blur">
          <form onSubmit={(event) => event.preventDefault()} className="space-y-6">
            <label className="block text-sm font-semibold text-slate-100">
              Full name
              <input
                type="text"
                placeholder="Jane Doe"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-100">
              Email address
              <input
                type="email"
                placeholder="jane@example.com"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-100">
              Message
              <textarea
                rows={5}
                placeholder="Tell us what matters most for your retirement"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Send message
            </button>

            <p className="text-sm leading-6 text-slate-500">
              We’ll respond within 1 business day to help you start your retirement search.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
