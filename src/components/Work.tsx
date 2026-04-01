"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const projects = [
  {
    title: "Luxury Villa Showcase",
    category: "Real Estate",
    description: "Beachfront property aerial tour — wide shots, close passes, multiple angles.",
    specs: "4K · 60s",
    gradient: "from-[#2a1508] via-[#1a0d05] to-[#191919]",
  },
  {
    title: "Sunset Beach Wedding",
    category: "Events",
    description: "Ceremony captured from above — wide establishing shots and detail passes.",
    specs: "4K · 60s",
    gradient: "from-[#1a1200] via-[#1a0a05] to-[#191919]",
  },
  {
    title: "Resort Grand Opening",
    category: "Commercial",
    description: "Full property reveal — pools, gardens, architecture from every angle.",
    specs: "1080p · 60s",
    gradient: "from-[#0a0f1a] via-[#05101a] to-[#191919]",
  },
  {
    title: "Island Hopping Reels",
    category: "Travel",
    description: "Multi-location aerials — quick cuts, vertical format for social media.",
    specs: "9:16 · 30s",
    gradient: "from-[#0a1a0f] via-[#051a10] to-[#191919]",
  },
];

export default function Work() {
  return (
    <section id="work" className="dark-section py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-14">
            <span className="label-mono text-av-muted block mb-4">Selected Work</span>
            <h2
              className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1]"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              Clean edits, ready to use
            </h2>
          </div>
        </ScrollReveal>

        {/* Featured — wide */}
        <ScrollReveal className="mb-4">
          <motion.div
            whileHover={{ scale: 1.003 }}
            transition={{ duration: 0.3 }}
            className="group relative aspect-[21/9] overflow-hidden rounded-xl inner-glow cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${projects[0].gradient}`} />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <span className="pill w-fit text-av-muted border-av-border-light mb-3">
                {projects[0].category}
              </span>
              <h3
                className="text-xl md:text-2xl mb-1"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
              >
                {projects[0].title}
              </h3>
              <p className="text-sm text-av-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-md">
                {projects[0].description}
              </p>
              <span className="text-[11px] text-av-muted/60 mt-2 uppercase tracking-wider">
                {projects[0].specs}
              </span>
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.slice(1).map((p, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl inner-glow cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <span className="pill w-fit text-av-muted border-av-border-light">
                    {p.category}
                  </span>
                  <div>
                    <h3
                      className="text-lg mb-1"
                      style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
                    >
                      {p.title}
                    </h3>
                    <span className="text-[11px] text-av-muted/60 uppercase tracking-wider">
                      {p.specs}
                    </span>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
