"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const packages = [
  {
    name: "Quick Clip",
    duration: "30 sec",
    color: "#2a6e4a",
    ideal: "Social media highlight reel",
    includes: [
      "Drone shoot (up to 30 min)",
      "AI-scored best shots",
      "Cinematic color grade",
      "Background music",
      "1 format (16:9 or 9:16)",
      "Delivered via email or AirDrop",
    ],
    highlight: false,
  },
  {
    name: "Standard",
    duration: "60 sec",
    color: "#c9342a",
    ideal: "Property listings, events, promos",
    includes: [
      "Drone shoot (up to 1 hour)",
      "AI-scored best shots",
      "Cinematic LUT grade",
      "Background music",
      "Both formats (16:9 + 9:16)",
      "3 aerial photo exports",
      "Delivered via email or AirDrop",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    duration: "90–120 sec",
    color: "#d4730f",
    ideal: "Full property tours, commercials",
    includes: [
      "Drone shoot (up to 2 hours)",
      "AI-scored best shots",
      "Premium cinematic LUT",
      "Licensed background music",
      "Both formats (16:9 + 9:16)",
      "10 aerial photo exports",
      "Delivered via email or AirDrop",
      "1 revision included",
    ],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 max-w-[1180px] mx-auto px-4 md:px-6">
      <ScrollReveal>
        <div className="mb-12">
          <div className="accent-bar mb-4" />
          <h2 className="headline text-3xl md:text-5xl font-bold">
            Simple <span className="text-av-red">Pricing</span>
          </h2>
          <p className="text-av-muted mt-3 max-w-md text-sm leading-relaxed">
            No hidden fees. No surprise charges. Pick your package, book the
            shoot, get your content.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((p, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`p-6 rounded-lg border transition-colors duration-300 relative overflow-hidden h-full ${
                p.highlight
                  ? "border-av-red/40 bg-av-surface"
                  : "border-av-border bg-av-surface/50 hover:border-av-red/20"
              }`}
            >
              {p.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-av-red/[0.04] rounded-full blur-[60px]" />
              )}

              <div className="relative">
                {p.highlight && (
                  <span className="pill bg-av-red/10 border-av-red/30 text-av-red mb-4 inline-block">
                    Most Popular
                  </span>
                )}

                <h3
                  className="text-2xl font-bold tracking-[2px] uppercase"
                  style={{ fontFamily: "var(--font-cond)" }}
                >
                  {p.name}
                </h3>
                <div
                  className="text-lg font-bold mt-1"
                  style={{ fontFamily: "var(--font-cond)", color: p.color }}
                >
                  {p.duration}
                </div>
                <p className="label-mono text-av-muted mt-1 mb-6">{p.ideal}</p>

                <ul className="space-y-2.5 mb-6">
                  {p.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-av-light"
                    >
                      <span className="text-av-red mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`hover-lift block text-center py-3 rounded-sm text-sm tracking-[2px] uppercase transition-all ${
                    p.highlight
                      ? "bg-av-red text-av-white font-bold"
                      : "border border-av-border text-av-text hover:border-av-red hover:text-av-red"
                  }`}
                  style={{ fontFamily: "var(--font-cond)" }}
                >
                  Get Quote
                </a>
              </div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>

      {/* Print Service — optional add-on */}
      <ScrollReveal delay={0.3} className="mt-6">
        <div className="p-6 rounded-lg border border-dashed border-purple-500/20 bg-av-bg/50 hover:border-purple-500/40 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-3xl">🖨️</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-lg font-bold tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-cond)" }}
                  >
                    Photo Print Service
                  </h3>
                  <span className="pill bg-purple-500/10 border-purple-500/30 text-purple-400">
                    Add-On
                  </span>
                </div>
                <p className="text-xs text-av-muted mt-1">
                  Standalone or bundle with any package
                </p>
              </div>
            </div>

            <p className="flex-1 text-sm text-av-muted leading-relaxed">
              Get your favorite aerial shots printed on high-quality photo
              paper. Works with drone photos or bring your own images —
              we&apos;ll print anything you want.
            </p>

            <a
              href="#contact"
              className="shrink-0 hover-lift inline-flex items-center justify-center px-6 py-3 border border-purple-500/30 text-purple-400 text-sm tracking-[2px] uppercase rounded-sm hover:bg-purple-500/10 transition-colors"
              style={{ fontFamily: "var(--font-cond)" }}
            >
              Ask About Prints
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
