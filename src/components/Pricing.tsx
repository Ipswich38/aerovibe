"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const packages = [
  {
    name: "Content",
    duration: "Video & Photo",
    ideal: "Hobbyists, creators, social media",
    includes: [
      "Drone shoot (up to 30 min)",
      "Aerial video (30-60s, edited)",
      "Aerial photo exports",
      "Horizontal + vertical formats",
      "Delivered via email or AirDrop",
    ],
    highlight: false,
  },
  {
    name: "Commercial",
    duration: "Full Service",
    ideal: "Real estate, events, businesses",
    includes: [
      "Drone shoot (up to 1 hour)",
      "Edited video + aerial photos",
      "Both formats (16:9 + 9:16)",
      "Construction progress docs",
      "Site inspection coverage",
      "Delivered via email or AirDrop",
    ],
    highlight: true,
  },
  {
    name: "Extended",
    duration: "Custom",
    ideal: "Multi-day, large area, special projects",
    includes: [
      "Flexible shoot duration & coverage",
      "Multiple locations or sessions",
      "Full editing + post-production",
      "Output tailored to your needs",
      "Delivered via email or AirDrop",
      "Scope & pricing based on arrangement",
    ],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="dark-section py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-14">
            <span className="label-mono text-av-muted block mb-4">Pricing</span>
            <h2
              className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Simple, transparent pricing
            </h2>
            <p className="text-sm text-av-muted mt-3 max-w-md leading-relaxed">
              No hidden fees. No surprise charges. Pick your package, book the shoot, get your content.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((p, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={`p-6 rounded-xl border h-full flex flex-col ${
                  p.highlight
                    ? "border-av-red/30 inner-glow bg-av-surface"
                    : "border-av-border-light bg-av-surface/50"
                }`}
              >
                {p.highlight && (
                  <span className="pill w-fit text-av-red bg-av-red-dim border-av-red/20 mb-4 text-[10px]">
                    Most Popular
                  </span>
                )}

                <h3
                  className="text-xl mb-1"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  {p.name}
                </h3>
                <div className="text-sm text-av-red font-medium mb-1">
                  {p.duration}
                </div>
                <p className="text-[11px] text-av-muted uppercase tracking-wider mb-6">
                  {p.ideal}
                </p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-av-light">
                      <span className="text-av-red text-xs mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={p.highlight ? "btn-red w-full justify-center" : "btn-dark w-full justify-center"}
                >
                  Get Quote
                  <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </a>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Print add-on */}
        <ScrollReveal delay={0.3} className="mt-4">
          <div className="p-5 rounded-xl border border-dashed border-av-border-light bg-av-surface/30">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xl">🖨️</span>
                <div>
                  <span
                    className="text-base text-av-text"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                  >
                    Photo Print Service
                  </span>
                  <span className="pill text-av-muted ml-2 text-[10px]">Add-On</span>
                </div>
              </div>
              <p className="flex-1 text-sm text-av-muted leading-relaxed">
                Get shots printed on quality paper. Works with drone photos or bring your own — we print anything.
              </p>
              <a href="#contact" className="btn-dark shrink-0 w-fit">
                Ask About Prints
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
