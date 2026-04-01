"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const projects = [
  {
    title: "Luxury Villa Showcase",
    category: "Real Estate",
    categoryColor: "#c9342a",
    description:
      "Beachfront property aerial tour — slow orbits, reveal shots, golden hour.",
    specs: "4K · 90s · Warm Golden LUT",
    gradient: "from-[#2a1508] via-[#1a0d05] to-[#12110e]",
    glow: "bg-amber-600/15",
  },
  {
    title: "Sunset Beach Wedding",
    category: "Events",
    categoryColor: "#d4730f",
    description:
      "Golden hour ceremony from above — sweeping establishing shots, intimate details.",
    specs: "4K · 120s · Warm Soft LUT",
    gradient: "from-[#1a1200] via-[#1a0a05] to-[#12110e]",
    glow: "bg-orange-500/12",
  },
  {
    title: "Resort Grand Opening",
    category: "Commercial",
    categoryColor: "#1a4e8c",
    description:
      "Full property reveal — pools, gardens, architecture. Corporate-cool edit.",
    specs: "1080p · 60s · Cool Crisp LUT",
    gradient: "from-[#0a0f1a] via-[#05101a] to-[#12110e]",
    glow: "bg-blue-500/12",
  },
  {
    title: "Island Hopping Reels",
    category: "Travel",
    categoryColor: "#2a6e4a",
    description:
      "Multi-location aerials — quick cuts, high energy, scroll-stopping vertical.",
    specs: "9:16 · 30s · Vibrant LUT",
    gradient: "from-[#0a1a0f] via-[#051a10] to-[#12110e]",
    glow: "bg-emerald-500/12",
  },
];

export default function Work() {
  return (
    <section id="work" className="py-20 md:py-28 max-w-[1180px] mx-auto px-4 md:px-6">
      <ScrollReveal>
        <div className="mb-12">
          <div className="accent-bar mb-4" />
          <h2 className="headline text-3xl md:text-5xl font-bold">
            Selected <span className="text-av-red">Work</span>
          </h2>
          <p className="text-av-muted mt-3 max-w-md text-sm leading-relaxed">
            Every shot AI-scored for composition. Every edit color-graded with
            cinematic LUTs. Every second precisely timed.
          </p>
        </div>
      </ScrollReveal>

      {/* Featured — full width with parallax effect */}
      <ScrollReveal className="mb-4">
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.4 }}
          className="group relative aspect-[21/9] overflow-hidden rounded-lg border border-av-border hover:border-av-red/30 transition-colors duration-500 cursor-pointer"
        >
          {/* Background — swap with real image */}
          <div className={`absolute inset-0 bg-gradient-to-br ${projects[0].gradient}`} />
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className={`absolute top-1/3 right-1/4 w-[400px] h-[400px] ${projects[0].glow} rounded-full blur-[100px] group-hover:blur-[80px] transition-all duration-700`} />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
            <span
              className="pill w-fit mb-3"
              style={{
                borderColor: `${projects[0].categoryColor}40`,
                color: projects[0].categoryColor,
                background: `${projects[0].categoryColor}10`,
              }}
            >
              {projects[0].category}
            </span>
            <h3
              className="text-2xl md:text-4xl font-bold tracking-[2px] uppercase mb-2"
              style={{ fontFamily: "var(--font-cond)" }}
            >
              {projects[0].title}
            </h3>
            <p className="text-sm text-av-light max-w-md mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {projects[0].description}
            </p>
            <span className="label-mono text-av-muted">
              {projects[0].specs}
            </span>
          </div>

          {/* Play button — glassmorphism */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-20 h-20 rounded-full backdrop-blur-md bg-av-bg/30 border border-av-text/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-av-text ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </ScrollReveal>

      {/* Grid — 3 remaining projects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.slice(1).map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-av-border hover:border-av-red/30 transition-colors duration-500 cursor-pointer"
            >
              {/* Background — swap with real images */}
              <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
              <div className="absolute inset-0 grid-pattern opacity-15" />
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] ${p.glow} rounded-full blur-[80px] group-hover:blur-[60px] transition-all duration-700`} />

              <div className="absolute inset-0 flex flex-col justify-between p-5">
                <span
                  className="pill w-fit"
                  style={{
                    borderColor: `${p.categoryColor}40`,
                    color: p.categoryColor,
                    background: `${p.categoryColor}10`,
                  }}
                >
                  {p.category}
                </span>
                <div>
                  <h3
                    className="text-lg font-bold tracking-[1px] uppercase mb-1"
                    style={{ fontFamily: "var(--font-cond)" }}
                  >
                    {p.title}
                  </h3>
                  <span className="label-mono text-av-muted">{p.specs}</span>
                </div>
              </div>

              {/* Hover play */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full backdrop-blur-md bg-av-bg/30 border border-av-text/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-av-text ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
