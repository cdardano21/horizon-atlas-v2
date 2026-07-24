import Link from "next/link";
import RouteFrame from "../components/RouteFrame";

export default function PrivacyPage() {
  return (
    <RouteFrame
      eyebrow="Privacy"
      title="Privacy policy"
      description="Horizon Atlas is designed to minimize data collection while the product evolves. This page establishes the route and a clear baseline for the eventual full policy."
      primaryAction={{ href: "/terms", label: "Read terms" }}
      secondaryAction={{ href: "/contact", label: "Contact us" }}
    >
      <div className="space-y-6 text-slate-300 leading-8">
        <p>We only ask for the information needed to deliver destination matching, account access, or support communication.</p>
        <p>Saved questionnaire data and favorites will be treated as account-level product data when those features are enabled.</p>
        <p>We do not sell personal data. If that ever changes, the policy will be updated before any new feature launches.</p>
        <p>
          <Link href="/" className="text-cyan-300 hover:text-cyan-200">Return to the homepage</Link>
        </p>
      </div>
    </RouteFrame>
  );
}