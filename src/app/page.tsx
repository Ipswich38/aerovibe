import Navigation from "@/components/Navigation";
import WhyUs from "@/components/WhyUs";
import Work from "@/components/Work";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Hero from "@/components/Hero";
import WebPortfolio from "@/components/WebPortfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navigation />
      <WhyUs />
      <Work />
      <Services />
      <Process />
      <Hero />
      <WebPortfolio />
      <Contact />
      <Footer />
    </main>
  );
}
