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
    emoji: "📲",
    title: "You Get It",
    color: "#2a6e4a",
    description:
      "Final content delivered via email or AirDrop — your choice. 4K horizontal, 9:16 vertical, print-ready stills. All formats, one shoot.",
  },
  {
    number: "05",
    emoji: "🖨️",
    title: "Print It",
    color: "#7832c8",
    description:
      "Optional add-on: get your favorite aerial shots printed on the spot. Bring your own photos too — we print anything. No studio needed.",
    optional: true,
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
            Five steps from raw drone footage to your hands. Content delivered
            digitally — with an optional print service if you want something
            you can hold.
          </p>
        </div>
      </ScrollReveal>

      {/* Steps 1-4: core flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {steps.filter((s) => !s.optional).map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.12}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative group"
            >
              {/* Connector line (desktop) */}
              {i < 3 && (
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

      {/* Step 5: Print — optional add-on, visually distinct */}
      {steps.filter((s) => s.optional).map((s, i) => (
        <ScrollReveal key={`opt-${i}`} delay={0.5}>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative group p-6 rounded-lg border border-dashed border-av-border hover:border-purple-500/30 bg-av-surface/50 transition-colors duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 shrink-0">
                <span
                  className="text-5xl font-black opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ fontFamily: "var(--font-cond)", color: s.color }}
                >
                  {s.number}
                </span>
                <span className="text-3xl">{s.emoji}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3
                    className="text-xl font-bold tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-cond)" }}
                  >
                    {s.title}
                  </h3>
                  <span className="pill bg-purple-500/10 border-purple-500/30 text-purple-400">
                    Optional Add-On
                  </span>
                </div>
                <p className="text-sm text-av-muted leading-relaxed max-w-xl">
                  {s.description}
                </p>
              </div>

              <a
                href="#contact"
                className="shrink-0 hover-lift inline-flex items-center justify-center px-6 py-3 border border-purple-500/30 text-purple-400 text-sm tracking-[2px] uppercase rounded-sm hover:bg-purple-500/10 transition-colors"
                style={{ fontFamily: "var(--font-cond)" }}
              >
                Add to Order
              </a>
            </div>
          </motion.div>
        </ScrollReveal>
      ))}
    </section>
  );
}
