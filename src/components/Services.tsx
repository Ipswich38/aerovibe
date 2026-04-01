"use client";

import { useEffect, useRef } from "react";

const services = [
  {
    icon: "🎬",
    title: "Aerial Video",
    color: "#c9342a",
    description:
      "4K cinematic drone footage with professional color grading, music, and editing. Horizontal + vertical formats.",
    tags: ["4K / 1080p", "Cinematic LUTs", "Music", "30-120s"],
  },
  {
    icon: "📸",
    title: "Aerial Photography",
    color: "#d4730f",
    description:
      "High-resolution aerial stills. DNG processing with professional color correction. Print-ready.",
    tags: ["High-Res", "DNG → JPEG", "Color Corrected", "Print-Ready"],
  },
  {
    icon: "📱",
    title: "Social Media Cuts",
    color: "#2a6e4a",
    description:
      "Vertical 9:16 edits for Instagram Reels, TikTok, and YouTube Shorts. Fast-paced, scroll-stopping.",
    tags: ["9:16 Vertical", "Quick Cuts", "Platform-Ready", "Trending"],
  },
  {
    icon: "🤖",
    title: "AI-Enhanced Editing",
    color: "#1a4e8c",
    description:
      "Our AI scores every frame for composition, lighting, and motion. Only the best shots make the cut.",
    tags: ["Smart Selection", "Auto-Grade", "Scene Scoring", "QC"],
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
      className="py-20 md:py-28 bg-av-surface grid-pattern"
    >
      <div className="max-w-[1180px] mx-auto px-4 md:px-6">
        <div className="fade-up mb-12">
          <div className="accent-bar mb-4" />
          <h2 className="headline text-3xl md:text-5xl font-bold">
            What We <span className="text-av-red">Deliver</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <div
              key={i}
              className="fade-up group p-5 rounded-lg border border-av-border bg-av-bg/60 hover:border-av-red/30 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle ambient glow on hover */}
              <div
                className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ background: s.color }}
              />

              <div className="relative">
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3
                  className="text-lg font-bold tracking-[1px] uppercase mb-2"
                  style={{ fontFamily: "var(--font-cond)" }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-av-muted leading-relaxed mb-4">
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span key={t} className="pill text-av-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
