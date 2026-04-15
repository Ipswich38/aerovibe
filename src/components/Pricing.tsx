"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const includes = [
  "One location",
  "5-minute flight window",
  "5 high-resolution raw photos",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 md:py-36" style={{ backgroundColor: "#121212" }}>
      <div className="max-w-[520px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2
              className="text-[clamp(2.2rem,5vw,3.2rem)] leading-[1.1] text-white"
              style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
            >
              Professional views.{" "}
              <span className="text-cyan-400">Approachable prices.</span>
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
              className="text-[11px] uppercase tracking-[0.25em] mb-4"
              style={{ color: "#888888", fontFamily: "var(--font-mono)" }}
            >
              Starting At
            </div>

            <div
              className="text-7xl md:text-8xl text-cyan-400 mb-2"
              style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 800 }}
            >
              ₱1,499
            </div>

            <div className="text-sm mb-8" style={{ color: "#888888" }}>
              base price
            </div>

            <p className="text-base text-white/50 leading-relaxed mb-8 max-w-sm mx-auto">
              Perfect for a few stunning angles of your home or a quick project update.
            </p>

            {/* Scope */}
            <div className="space-y-3 mb-10">
              {includes.map((item) => (
                <div key={item} className="flex items-center justify-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 shrink-0">
                    <path d="M9 12.75L11.25 15 15 9.75" />
                  </svg>
                  <span className="text-sm text-white/70">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/30 leading-relaxed mb-8 max-w-xs mx-auto">
              Tell us what you need — we&apos;ll give you a clear, honest quote.
              No surprises, no hidden fees.
            </p>

            <a href="#contact" className="btn-cyan inline-flex">
              Let&apos;s Talk About Your Project
              <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-center mt-8 text-xs leading-relaxed max-w-sm mx-auto" style={{ color: "#888888" }}>
            Final pricing varies based on project requirements, complexity,
            timeline, and location. We&apos;ll always provide a clear quote
            before any work begins.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
