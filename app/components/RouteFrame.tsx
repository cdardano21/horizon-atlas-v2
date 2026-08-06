import Link from "next/link";
import type { ReactNode } from "react";
import HorizonAtlasLogo from "./HorizonAtlasLogo";

type RouteFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
  children?: ReactNode;
};

export default function RouteFrame({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}: RouteFrameProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.8),rgba(2,6,23,1))]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
          <div className="max-w-4xl rounded-[2rem] border border-white/10 bg-slate-950/75 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/25 bg-white/10 p-3 shadow-lg shadow-cyan-500/10 backdrop-blur">
              <HorizonAtlasLogo layout="horizontal" tone="light" className="max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]" />
            </div>
            <p className="uppercase tracking-[0.35em] text-cyan-400">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>

            {(primaryAction || secondaryAction) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {primaryAction ? (
                  <Link
                    href={primaryAction.href}
                    className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    {primaryAction.label}
                  </Link>
                ) : null}
                {secondaryAction ? (
                  <Link
                    href={secondaryAction.href}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    {secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          {children ? (
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-xl shadow-cyan-500/5 backdrop-blur-xl sm:p-8">
              {children}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}