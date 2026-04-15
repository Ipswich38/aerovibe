"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const promises = [
  "Tailored scope, tailored price",
  "Clear written quote before we fly",
  "No hidden fees, no surprises",
  "Free consultation to scope your project",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 md:py-36" style={{ backgroundColor: "#121212" }}>
      <div className="max-w-[560px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2
              className="text-[clamp(2.2rem,5vw,3.2rem)] leading-[1.1] text-white"
              style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
            >
              Every project is different.{" "}
              <span className="text-cyan-400">So is every quote.</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl p-10 md:p-12 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(6,182,212,0.15)",
              boxShadow: "0 0 40px rgba(6,182,212,0.06), 0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="text-[11px] uppercase tracking-[0.25em] mb-6"
              style={{ color: "#888888", fontFamily: "var(--font-mono)" }}
            >
              Custom Quote
            </div>

            <p
              className="text-[clamp(1.6rem,3.5vw,2.2rem)] leading-[1.2] text-white mb-4"
              style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}
            >
              Let&apos;s build a package around <span className="text-cyan-400">your</span> project.
            </p>

            <p className="text-base text-white/50 leading-relaxed mb-10 max-w-sm mx-auto">
              Location, duration, deliverables, turnaround — these shape the number.
              Tell us what you need and we&apos;ll send a clear, honest quote within 24 hours.
            </p>

            <div className="space-y-3 mb-10 text-left max-w-sm mx-auto">
              {promises.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 shrink-0 mt-1">
                    <path d="M9 12.75L11.25 15 15 9.75" />
                  </svg>
                  <span className="text-sm text-white/70">{item}</span>
                </div>
              ))}
            </div>

            <a href="#contact" className="btn-cyan inline-flex">
              Request a Free Quote
              <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-center mt-8 text-xs leading-relaxed max-w-sm mx-auto" style={{ color: "#888888" }}>
            Startup-friendly pricing for real estate, events, commercial, and content projects
            across the Philippines. Quotes are always free.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
