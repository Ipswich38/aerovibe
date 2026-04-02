"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    number: "01",
    title: "We fly",
    description: "Our drones capture your location from multiple angles — wide shots, close-ups, different heights.",
  },
  {
    number: "02",
    title: "We edit",
    description: "We pick the best shots, edit everything, and deliver a clean, ready-to-use video.",
  },
  {
    number: "03",
    title: "You get it",
    description: "Final content delivered via email or AirDrop — your choice. Video, photos, or both.",
  },
];

const printAddon = {
  title: "Print it",
  description: "Optional: get your favorite shots printed on quality paper. Bring your own photos too — we print anything.",
};

export default function Process() {
  return (
    <section id="process" className="py-24 md:py-32 bg-av-bg">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-14">
            <span className="label-mono text-av-muted block mb-4">Process</span>
            <h2
              className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1] text-av-dark"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Simple process, no hassle
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {steps.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%+8px)] w-[calc(100%-16px)] h-px bg-gradient-to-r from-av-border to-transparent" />
                )}
                <div className="text-[11px] text-av-muted uppercase tracking-wider mb-4">
                  Step {s.number}
                </div>
                <h3
                  className="text-xl text-av-dark mb-3"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
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

        {/* Print add-on */}
        <ScrollReveal delay={0.3}>
          <div className="p-6 rounded-xl border border-dashed border-av-border bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-2xl">🖨️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-lg text-av-dark"
                      style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                    >
                      {printAddon.title}
                    </h3>
                    <span className="pill text-av-muted bg-white text-[10px]">
                      Optional
                    </span>
                  </div>
                </div>
              </div>
              <p className="flex-1 text-sm text-av-muted leading-relaxed">
                {printAddon.description}
              </p>
              <a href="#contact" className="btn-dark shrink-0 w-fit">
                Ask About Prints
                <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
