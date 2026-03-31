"use client";

import { useEffect, useRef } from "react";

const projects = [
  {
    title: "Luxury Villa Showcase",
    category: "Real Estate",
    description:
      "Cinematic aerial tour of a beachfront property. 4K drone flyovers, slow orbits, and reveal shots with warm golden grading.",
    specs: "4K · 90 sec · DJI Neo 2",
    gradient: "from-amber-900/40 to-aerovibe-black",
  },
  {
    title: "Sunset Beach Wedding",
    category: "Events",
    description:
      "Golden hour ceremony captured from above. Sweeping establishing shots, gentle circles around the venue, and intimate detail passes.",
    specs: "4K · 120 sec · DJI Neo 2",
    gradient: "from-rose-900/30 to-aerovibe-black",
  },
  {
    title: "Resort Grand Opening",
    category: "Commercial",
    description:
      "Full property reveal — pools, gardens, architecture. Corporate-cool grading with precise timing for promotional use.",
    specs: "1080p · 60 sec · DJI Neo",
    gradient: "from-cyan-900/30 to-aerovibe-black",
  },
  {
    title: "Island Hopping Series",
    category: "Travel & Lifestyle",
    description:
      "Vibrant aerial captures across multiple locations. Quick cuts, high energy, optimized for Instagram Reels and TikTok.",
    specs: "9:16 Vertical · 30 sec · DJI Neo 2",
    gradient: "from-emerald-900/30 to-aerovibe-black",
  },
];

export default function Work() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements =
      sectionRef.current?.querySelectorAll(".fade-up") ?? [];
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="py-24 md:py-32 max-w-7xl mx-auto px-6"
    >
      <div className="fade-up mb-16">
        <div className="gold-line mb-4" />
        <h2 className="text-3xl md:text-5xl font-light tracking-tight">
          Selected <span className="font-semibold">Work</span>
        </h2>
        <p className="text-aerovibe-light mt-4 max-w-lg">
          Every project is AI-scored for composition, color-graded with
          cinematic LUTs, and cut to precise timing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p, i) => (
          <div
            key={i}
            className="fade-up group relative aspect-[16/10] overflow-hidden border border-aerovibe-gray/30 hover:border-aerovibe-accent/40 transition-all duration-500"
          >
            {/* Placeholder gradient — swap with real thumbnails */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`}
            />
            <div className="absolute inset-0 bg-aerovibe-black/20 group-hover:bg-aerovibe-black/10 transition-colors duration-500" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <span className="text-[10px] tracking-[0.3em] uppercase text-aerovibe-accent mb-2">
                {p.category}
              </span>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-aerovibe-light leading-relaxed max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {p.description}
              </p>
              <span className="text-xs text-aerovibe-muted mt-3 tracking-wider">
                {p.specs}
              </span>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-16 h-16 rounded-full border-2 border-aerovibe-accent/60 flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6 text-aerovibe-accent ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
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
