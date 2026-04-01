"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    number: "01",
    emoji: "🚁",
    title: "We Fly",
    color: "#c9342a",
    description:
      "DJI Neo & Neo 2 drones capture your location from every angle. Orbits, reveals, flyovers, slow-mo details — we get it all.",
  },
  {
    number: "02",
    emoji: "🧠",
    title: "AI Scores",
    color: "#1a4e8c",
    description:
      "Every frame gets analyzed — composition, lighting, horizon, motion smoothness. Bad shots? Gone. Only the best make the cut.",
  },
  {
    number: "03",
    emoji: "🎨",
    title: "We Edit",
    color: "#d4730f",
    description:
      "Cinematic LUT grading, background music with timed fades, precise pacing. Your footage goes from raw to wow.",
  },
  {
    number: "04",
    emoji: "🚀",
    title: "You Post",
    color: "#2a6e4a",
    description:
      "4K horizontal for websites. 9:16 vertical for Reels. Print-ready stills. Multiple formats, one shoot, fast turnaround.",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="py-20 md:py-28 max-w-[1180px] mx-auto px-4 md:px-6"
    >
      <ScrollReveal>
        <div className="mb-12">
          <div className="accent-bar mb-4" />
          <h2 className="headline text-3xl md:text-5xl font-bold">
            How It <span className="text-av-red">Works</span>
          </h2>
          <p className="text-av-muted mt-3 max-w-md text-sm leading-relaxed">
            Four steps from raw drone footage to publish-ready content. No
            back-and-forth. No waiting weeks.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.12}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative group"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+4px)] w-[calc(100%-8px)] h-px bg-gradient-to-r from-av-border to-transparent" />
              )}

              {/* Number + emoji */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-5xl font-black opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ fontFamily: "var(--font-cond)", color: s.color }}
                >
                  {s.number}
                </span>
                <span className="text-2xl">{s.emoji}</span>
              </div>

              <h3
                className="text-xl font-bold tracking-[2px] uppercase mb-3"
                style={{ fontFamily: "var(--font-cond)" }}
              >
                {s.title}
              </h3>
              <p className="text-sm text-av-muted leading-relaxed">
                {s.description}
              </p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
