import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";
import Work from "@/components/Work";
import WebPortfolio from "@/components/WebPortfolio";
import Services from "@/components/Services";
// import DroneShowcase from "@/components/DroneShowcase";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <WhyUs />
      <Work />
      <WebPortfolio />
      <Services />
      {/* <DroneShowcase /> */}
      <Process />
      <Contact />
      <Footer />
    </main>
  );
}
