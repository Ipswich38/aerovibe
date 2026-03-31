"use client";

import { useEffect, useRef } from "react";

const packages = [
  {
    name: "Quick Clip",
    duration: "30 seconds",
    ideal: "Social media highlight",
    includes: [
      "Drone shoot (up to 30 min)",
      "AI-scored best shots",
      "Cinematic color grade",
      "Background music",
      "1 format (16:9 or 9:16)",
    ],
    highlight: false,
  },
  {
    name: "Standard",
    duration: "60 seconds",
    ideal: "Property listings, events",
    includes: [
      "Drone shoot (up to 1 hour)",
      "AI-scored best shots",
      "Cinematic color grade",
      "Background music",
      "Both formats (16:9 + 9:16)",
      "3 aerial photo exports",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    duration: "90–120 seconds",
    ideal: "Full property tours, commercials",
    includes: [
      "Drone shoot (up to 2 hours)",
      "AI-scored best shots",
      "Premium cinematic LUT",
      "Licensed background music",
      "Both formats (16:9 + 9:16)",
      "10 aerial photo exports",
      "1 revision included",
    ],
    highlight: false,
  },
];

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    const elements = sectionRef.current?.querySelectorAll(".fade-up") ?? [];
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-24 md:py-32 bg-aerovibe-dark grid-pattern"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="fade-up mb-16">
          <div className="gold-line mb-4" />
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            Simple <span className="font-semibold">Pricing</span>
          </h2>
          <p className="text-aerovibe-light mt-4 max-w-lg">
            Transparent packages. No hidden fees. Custom quotes available for
            larger projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((p, i) => (
            <div
              key={i}
              className={`fade-up p-8 border transition-all duration-500 ${
                p.highlight
                  ? "border-aerovibe-accent/60 bg-aerovibe-black/80"
                  : "border-aerovibe-gray/30 bg-aerovibe-black/50 hover:border-aerovibe-accent/30"
              }`}
            >
              {p.highlight && (
                <span className="text-[10px] tracking-[0.3em] uppercase text-aerovibe-accent mb-4 block">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-semibold mb-1">{p.name}</h3>
              <p className="text-aerovibe-accent text-sm mb-1">{p.duration}</p>
              <p className="text-aerovibe-muted text-xs mb-6">{p.ideal}</p>

              <ul className="space-y-3 mb-8">
                {p.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-aerovibe-light"
                  >
                    <svg
                      className="w-4 h-4 text-aerovibe-accent mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`block text-center py-3 text-sm tracking-wider uppercase transition-colors ${
                  p.highlight
                    ? "bg-aerovibe-accent text-aerovibe-black hover:bg-aerovibe-accent-light font-semibold"
                    : "border border-aerovibe-gray hover:border-aerovibe-accent hover:text-aerovibe-accent text-aerovibe-white"
                }`}
              >
                Get Quote
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
