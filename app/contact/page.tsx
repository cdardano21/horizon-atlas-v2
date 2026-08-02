import Contact from "../components/Contact";
import RouteFrame from "../components/RouteFrame";

export default function ContactPage() {
  return (
    <RouteFrame
      eyebrow="Contact"
      title="Talk to DestinationFinderAI"
      description="Questions about the catalog, the matching engine, or future account features can start here."
      primaryAction={{ href: "/life-match", label: "Take Life Match" }}
      secondaryAction={{ href: "/about", label: "Read about the product" }}
    >
      <Contact />
    </RouteFrame>
  );
}