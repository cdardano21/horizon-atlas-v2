"use client";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-8 py-28">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="atlas-kicker">Contact</p>
          <h2 className="mt-4 text-5xl leading-tight text-[var(--atlas-ink)]">
            Ready to find your ideal retirement destination?
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--atlas-muted)]">
            Send us a message and a DestinationFinderAI specialist will guide you through the next steps.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,251,242,0.9)] p-8 shadow-[0_28px_60px_-36px_rgba(38,31,20,0.7)] backdrop-blur">
          <form onSubmit={(event) => event.preventDefault()} className="space-y-6">
            <label className="block text-sm font-semibold text-[var(--atlas-ink)]">
              Full name
              <input
                type="text"
                placeholder="Jane Doe"
                className="mt-3 w-full rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.82)] px-4 py-4 text-[var(--atlas-ink)] outline-none transition focus:border-[rgba(31,95,99,0.6)]"
              />
            </label>

            <label className="block text-sm font-semibold text-[var(--atlas-ink)]">
              Email address
              <input
                type="email"
                placeholder="jane@example.com"
                className="mt-3 w-full rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.82)] px-4 py-4 text-[var(--atlas-ink)] outline-none transition focus:border-[rgba(31,95,99,0.6)]"
              />
            </label>

            <label className="block text-sm font-semibold text-[var(--atlas-ink)]">
              Message
              <textarea
                rows={5}
                placeholder="Tell us what matters most for your retirement"
                className="mt-3 w-full rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.82)] px-4 py-4 text-[var(--atlas-ink)] outline-none transition focus:border-[rgba(31,95,99,0.6)]"
              />
            </label>

            <button
              type="submit"
              className="atlas-button-primary w-full"
            >
              Send message
            </button>

            <p className="text-sm leading-6 text-[var(--atlas-muted)]">
              We’ll respond within 1 business day to help you start your retirement search.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
