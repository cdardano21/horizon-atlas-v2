import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HomepageShowcase from "./components/HomepageShowcase";
import Navbar from "./components/Navbar";

export default function HomePage() {
  return (
    <main className="atlas-shell overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(244,208,139,0.2),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(47,152,163,0.18),transparent_34%),linear-gradient(180deg,#040f25_0%,#071b38_48%,#071a34_100%)] text-[#edf2fb]">
      <Navbar />

      <Hero />

      <HomepageShowcase />

      <Footer />
    </main>
  );
}
