import Link from "next/link";
import RouteFrame from "../components/RouteFrame";

export default function TermsPage() {
  return (
    <RouteFrame
      eyebrow="Terms"
      title="Terms of use"
      description="DestinationFinderAI is a planning and discovery tool. These terms set the route up now and can be expanded as account and payment features go live."
      primaryAction={{ href: "/privacy", label: "Read privacy policy" }}
      secondaryAction={{ href: "/contact", label: "Contact support" }}
    >
      <div className="space-y-6 text-slate-300 leading-8">
        <p>Use the product responsibly and verify immigration, tax, and housing details before making relocation decisions.</p>
        <p>Content is provided for planning assistance and should not replace local professional advice.</p>
        <p>Future premium features may have additional product-specific terms when they are released.</p>
        <p>
          <Link href="/" className="text-cyan-300 hover:text-cyan-200">Return to the homepage</Link>
        </p>
      </div>
    </RouteFrame>
  );
}