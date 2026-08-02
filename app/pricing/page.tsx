import Pricing from "../components/Pricing";
import RouteFrame from "../components/RouteFrame";

export default function PricingPage() {
  return (
    <RouteFrame
      eyebrow="Pricing"
      title="Choose the DestinationFinderAI plan that fits your workflow"
      description="The pricing route now exists and reuses the premium product section already used on the homepage."
      primaryAction={{ href: "/life-match", label: "Try Life Match" }}
      secondaryAction={{ href: "/contact", label: "Contact us" }}
    >
      <Pricing />
    </RouteFrame>
  );
}