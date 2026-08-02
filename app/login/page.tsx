import Link from "next/link";
import RouteFrame from "../components/RouteFrame";
import AuthPanel from "../components/AuthPanel";

export default function LoginPage() {
  return (
    <RouteFrame
      eyebrow="Account access"
      title="Sign in to DestinationFinderAI"
      description="Private accounts, saved cities, and future concierge features are being staged behind this entry point. The route now exists and is ready for the full account system."
      primaryAction={{ href: "/signup", label: "Create an account" }}
      secondaryAction={{ href: "/life-match", label: "Try Life Match" }}
    >
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Welcome back</p>
          <h2 className="mt-4 text-3xl font-bold text-white">Use your DestinationFinderAI account</h2>
          <p className="mt-3 text-slate-400">This is the secure entry point for saved favorites, questionnaire history, and future premium tools.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <div className="rounded-3xl bg-white/5 p-4">Saved favorites and compare lists</div>
            <div className="rounded-3xl bg-white/5 p-4">Questionnaire history and match revisions</div>
            <div className="rounded-3xl bg-white/5 p-4">AI concierge and travel planning when enabled</div>
          </div>
        </div>

        <div>
          <AuthPanel mode="login" />
          <p className="mt-4 text-sm text-slate-400">
            No account yet? <Link href="/signup" className="text-cyan-300 hover:text-cyan-200">Create one now</Link>.
          </p>
        </div>
      </div>
    </RouteFrame>
  );
}