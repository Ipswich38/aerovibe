import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Services from "@/components/Services";
import DroneShowcase from "@/components/DroneShowcase";
import Process from "@/components/Process";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Work />
      <Services />
      <DroneShowcase />
      <Process />
      <Pricing />
      <Contact />
      <Footer />
    </main>
  );
}
