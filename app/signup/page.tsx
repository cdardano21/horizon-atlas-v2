import Link from "next/link";
import RouteFrame from "../components/RouteFrame";
import AuthPanel from "../components/AuthPanel";

export default function SignupPage() {
  return (
    <RouteFrame
      eyebrow="Create account"
      title="Join DestinationFinderAI"
      description="Set up your account to save cities, compare favorites, and receive future personalized updates."
      primaryAction={{ href: "/life-match", label: "Start Life Match" }}
      secondaryAction={{ href: "/login", label: "I already have an account" }}
    >
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Why create an account</p>
          <h2 className="mt-4 text-3xl font-bold text-white">Save the places that fit your next chapter</h2>
          <p className="mt-3 text-slate-400">Accounts are staged for the next phase of the product and will unlock favorites, compare lists, and concierge tools.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <div className="rounded-3xl bg-white/5 p-4">Save destinations you want to revisit</div>
            <div className="rounded-3xl bg-white/5 p-4">Share your shortlist with a partner or advisor</div>
            <div className="rounded-3xl bg-white/5 p-4">Resume your questionnaire later</div>
          </div>
        </div>

        <div>
          <AuthPanel mode="signup" />
          <p className="mt-4 text-sm text-slate-400">
            Already started? <Link href="/login" className="text-cyan-300 hover:text-cyan-200">Log in here</Link>.
          </p>
        </div>
      </div>
    </RouteFrame>
  );
}