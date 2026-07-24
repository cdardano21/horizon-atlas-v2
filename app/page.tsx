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
    <main className="min-h-full overflow-hidden bg-slate-950 text-white">
      <Navbar />

      <Hero />

      <div className="border-y border-white/10 bg-slate-900/40">
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
