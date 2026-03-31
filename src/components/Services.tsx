"use client";

import { useEffect, useRef } from "react";

const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "Aerial Video",
    description:
      "4K cinematic drone footage with professional color grading, music, and editing. Horizontal and vertical formats.",
    features: ["4K / 1080p", "Cinematic LUTs", "Music + Sound", "30-120 sec"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
    title: "Aerial Photography",
    description:
      "High-resolution aerial stills. Print-ready exports from DNG with professional color correction.",
    features: ["High-Res JPEG", "DNG Processing", "Color Corrected", "Print-Ready"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Social Media Cuts",
    description:
      "Vertical 9:16 edits optimized for Instagram Reels, TikTok, and YouTube Shorts. Fast-paced, scroll-stopping.",
    features: ["9:16 Vertical", "Quick Cuts", "Trending Audio", "Platform-Ready"],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI-Enhanced Editing",
    description:
      "Our AI scores every frame for composition, lighting, and motion. Only the best shots make the final cut.",
    features: ["Smart Selection", "Auto-Grading", "Scene Scoring", "Quality Control"],
  },
];

export default function Services() {
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
      id="services"
      ref={sectionRef}
      className="py-24 md:py-32 bg-aerovibe-dark grid-pattern"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="fade-up mb-16">
          <div className="gold-line mb-4" />
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">
            What We <span className="font-semibold">Deliver</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="fade-up group p-6 border border-aerovibe-gray/30 hover:border-aerovibe-accent/40 transition-all duration-500 bg-aerovibe-black/50"
            >
              <div className="text-aerovibe-accent mb-4">{s.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-aerovibe-light leading-relaxed mb-4">
                {s.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.features.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] tracking-wider uppercase px-2 py-1 border border-aerovibe-gray/40 text-aerovibe-muted"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
