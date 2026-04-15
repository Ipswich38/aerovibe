"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Message us",
    description: "Tell us what you need. We'll give you a clear quote — no surprises.",
    icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  },
  {
    number: "02",
    title: "We fly & shoot",
    description: "We show up, fly the drone, capture every angle you need.",
    icon: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5",
  },
  {
    number: "03",
    title: "We edit",
    description: "Color grading, music, cuts — finished content, not raw footage.",
    icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
  },
  {
    number: "04",
    title: "You get it",
    description: "Same-day delivery. AirDrop, email, or Drive — ready to post.",
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export default function Process() {
  return (
    <section id="process" className="relative py-28 md:py-36 bg-av-dark overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-[1000px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2
              className="text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.1] text-white"
              style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
            >
              How It Works
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[52px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px">
            <div className="w-full h-full bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6">
            {steps.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center group"
                >
                  {/* Icon circle */}
                  <div className="relative mx-auto mb-6 w-[104px] h-[104px] flex items-center justify-center">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border border-white/[0.06] group-hover:border-cyan-400/20 transition-colors duration-500" />
                    {/* Inner glow */}
                    <div className="absolute inset-2 rounded-full bg-white/[0.03] group-hover:bg-cyan-400/[0.06] transition-colors duration-500" />
                    {/* Icon */}
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-cyan-400/70 group-hover:text-cyan-400 transition-colors duration-500 relative z-10"
                    >
                      <path d={s.icon} />
                    </svg>
                  </div>

                  {/* Step number */}
                  <div
                    className="text-[11px] text-cyan-400/40 tracking-[0.3em] uppercase mb-3"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Step {s.number}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg text-white mb-2"
                    style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}
                  >
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-white/40 leading-relaxed max-w-[180px] mx-auto">
                    {s.description}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
