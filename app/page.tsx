import Contact from "./components/Contact";
import FeaturedDestinations from "./components/FeaturedDestinations";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HomepageGallery from "./components/HomepageGallery";
import HowItWorks from "./components/HowItWorks";
import LaunchBanner from "./components/LaunchBanner";
import Navbar from "./components/Navbar";
import Pricing from "./components/Pricing";
import ProductCTA from "./components/ProductCTA";
import ResourceLinks from "./components/ResourceLinks";
import Stats from "./components/Stats";
import Testimonials from "./components/Testimonials";
import WhyHorizon from "./components/WhyHorizon";

export default function HomePage() {
  return (
    <main className="atlas-shell overflow-hidden bg-[radial-gradient(circle_at_8%_10%,rgba(197,155,95,0.2),transparent_26%),radial-gradient(circle_at_86%_4%,rgba(31,95,99,0.14),transparent_32%),repeating-linear-gradient(125deg,rgba(255,255,255,0.14)_0px,rgba(255,255,255,0.14)_2px,transparent_2px,transparent_20px),linear-gradient(180deg,rgba(248,244,236,1)_0%,rgba(244,237,224,0.92)_52%,rgba(248,243,234,1)_100%)]">
      <Navbar />

      <Hero />

      <div className="atlas-soft-divider bg-[linear-gradient(180deg,rgba(255,250,240,0.9),rgba(247,238,223,0.7))]">
        <Stats />
      </div>

      <HowItWorks />

      <HomepageGallery />

      <ProductCTA />

      <LaunchBanner />

      <ResourceLinks />

      <WhyHorizon />

      <FeaturedDestinations />

      <Testimonials />

      <Pricing />

      <Contact />

      <Footer />
    </main>
  );
}
