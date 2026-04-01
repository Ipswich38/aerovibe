"use client";

import { useEffect, useRef } from "react";

const projects = [
  {
    title: "Luxury Villa Showcase",
    category: "Real Estate",
    categoryColor: "#c9342a",
    description:
      "Beachfront property aerial tour — slow orbits, reveal shots, golden hour.",
    specs: "4K · 90s · Warm Golden LUT",
    gradient: "from-[#1a0f0f] to-av-bg",
  },
  {
    title: "Sunset Beach Wedding",
    category: "Events",
    categoryColor: "#d4730f",
    description:
      "Golden hour ceremony from above — sweeping establishing shots, intimate details.",
    specs: "4K · 120s · Warm Soft LUT",
    gradient: "from-[#1a1200] to-av-bg",
  },
  {
    title: "Resort Grand Opening",
    category: "Commercial",
    categoryColor: "#1a4e8c",
    description:
      "Full property reveal — pools, gardens, architecture. Corporate-cool edit.",
    specs: "1080p · 60s · Cool Crisp LUT",
    gradient: "from-[#0a0f1a] to-av-bg",
  },
  {
    title: "Island Hopping Reels",
    category: "Travel",
    categoryColor: "#2a6e4a",
    description:
      "Multi-location aerials — quick cuts, high energy, scroll-stopping vertical.",
    specs: "9:16 · 30s · Vibrant LUT",
    gradient: "from-[#0a1a0f] to-av-bg",
  },
];

export default function Work() {
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
      id="work"
      ref={sectionRef}
      className="py-20 md:py-28 max-w-[1180px] mx-auto px-4 md:px-6"
    >
      <div className="fade-up mb-12">
        <div className="accent-bar mb-4" />
        <h2 className="headline text-3xl md:text-5xl font-bold">
          Selected <span className="text-av-red">Work</span>
        </h2>
        <p className="text-av-muted mt-3 max-w-md text-sm leading-relaxed">
          Every shot AI-scored for composition. Every edit color-graded with
          cinematic LUTs. Every second precisely timed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p, i) => (
          <div
            key={i}
            className="fade-up group relative aspect-[16/10] overflow-hidden rounded-lg border border-av-border hover:border-av-red/30 transition-all duration-300 cursor-pointer"
          >
            {/* Background gradient — swap with real thumbnails */}
            <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
            {/* Ambient glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"
              style={{ background: p.categoryColor }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6">
              {/* Top — category pill */}
              <div>
                <span
                  className="pill"
                  style={{
                    borderColor: `${p.categoryColor}40`,
                    color: p.categoryColor,
                    background: `${p.categoryColor}10`,
                  }}
                >
                  {p.category}
                </span>
              </div>

              {/* Bottom — title + details */}
              <div>
                <h3
                  className="text-xl md:text-2xl font-bold tracking-[1px] uppercase mb-1"
                  style={{ fontFamily: "var(--font-cond)" }}
                >
                  {p.title}
                </h3>
                <p className="text-sm text-av-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2">
                  {p.description}
                </p>
                <span className="label-mono text-av-muted">{p.specs}</span>
              </div>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm hover-lift"
                style={{
                  background: `${p.categoryColor}20`,
                  border: `1.5px solid ${p.categoryColor}60`,
                }}
              >
                <svg
                  className="w-5 h-5 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: p.categoryColor }}
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
