"use client";

import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 64 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] dark-section overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster=""
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content anchored to bottom */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pb-14 md:pb-20 min-h-[70vh] flex flex-col justify-end">
        <motion.p
          {...fadeUp(0.2)}
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono)" }}
        >
          Web · App · Marketing
        </motion.p>

        <motion.h2
          {...fadeUp(0.35)}
          className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-white max-w-2xl mb-4"
          style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
        >
          We don&apos;t just shoot from above.{" "}
          <span style={{ color: "#22d3ee" }}>We build what shows it.</span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.48)}
          className="text-[15px] leading-relaxed max-w-lg mb-10"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Websites, apps, and digital marketing, delivered under the kreativloops brand
          for clients who need more than just footage.
        </motion.p>

        <motion.div {...fadeUp(0.58)} className="flex flex-wrap gap-3">
          <a href="#sites" className="btn-cyan">
            Browse the sites
            <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
          <a
            href="https://kreativloops.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark"
          >
            kreativloops.com
            <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 9.5l7-7M3.5 2.5h6v6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
