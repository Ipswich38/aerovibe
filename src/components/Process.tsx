"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Shoot",
    description:
      "We fly. DJI Neo & Neo 2 drones capture your property, event, or location from every angle. Multiple shot types — orbits, reveals, flyovers, slow-mo details.",
  },
  {
    number: "02",
    title: "Score",
    description:
      "AI vision analyzes every frame. Composition, lighting, horizon level, motion smoothness — each clip gets a quality score. Only the best footage makes the cut.",
  },
  {
    number: "03",
    title: "Edit",
    description:
      "Automated cinematic editing with professional LUT color grading, background music with perfectly timed fades, and precise pacing to your target duration.",
  },
  {
    number: "04",
    title: "Deliver",
    description:
      "Multiple formats ready to publish. 4K horizontal for websites, vertical 9:16 for social media, print-ready stills. Fast turnaround, no back-and-forth.",
  },
];

export default function Process() {
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
      id="process"
      ref={sectionRef}
      className="py-24 md:py-32 max-w-7xl mx-auto px-6"
    >
      <div className="fade-up mb-16">
        <div className="gold-line mb-4" />
        <h2 className="text-3xl md:text-5xl font-light tracking-tight">
          How It <span className="font-semibold">Works</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
        {steps.map((s, i) => (
          <div key={i} className="fade-up relative">
            {/* Connector line (desktop) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-aerovibe-accent/40 to-transparent" />
            )}
            <div className="text-4xl md:text-5xl font-light text-aerovibe-accent/20 mb-4">
              {s.number}
            </div>
            <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
            <p className="text-sm text-aerovibe-light leading-relaxed">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
