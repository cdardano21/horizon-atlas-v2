export default function MissingDataState({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-cyan-950/35 p-6 shadow-lg shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">{title ?? "No verified information currently available"}</p>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        {description ?? "This destination section does not yet have enough verified records to publish confidently."}
      </p>
    </div>
  );
}
