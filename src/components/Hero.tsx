"use client";

import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 64 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function Hero() {
  return (
    <section className="relative min-h-screen dark-section overflow-hidden">
      {/* Oversized ambient brand mark — smallest.ai pattern */}
      <motion.div
        initial={{ opacity: 0, y: 64 }}
        animate={{ opacity: 0.04, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-center justify-end pointer-events-none select-none"
      >
        <svg
          viewBox="0 0 400 400"
          fill="none"
          className="w-[800px] h-[800px] md:w-[1100px] md:h-[1100px] -mr-32 md:-mr-48 text-white"
        >
          {/* Drone silhouette as ambient watermark */}
          <rect x="170" y="180" width="60" height="40" rx="8" fill="currentColor" />
          <line x1="175" y1="195" x2="100" y2="130" stroke="currentColor" strokeWidth="4" />
          <line x1="225" y1="195" x2="300" y2="130" stroke="currentColor" strokeWidth="4" />
          <line x1="175" y1="205" x2="100" y2="270" stroke="currentColor" strokeWidth="4" />
          <line x1="225" y1="205" x2="300" y2="270" stroke="currentColor" strokeWidth="4" />
          <circle cx="100" cy="130" r="35" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="300" cy="130" r="35" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="100" cy="270" r="35" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="300" cy="270" r="35" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="200" cy="225" r="7" fill="currentColor" />
        </svg>
      </motion.div>

      {/* Content — left-aligned like smallest.ai */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-32 pb-28 md:pt-40 md:pb-36 min-h-screen flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Overline */}
          <motion.div {...fadeUp(0.1)} className="mb-6">
            <span className="label-mono text-av-muted">Drone Videography & Photo Prints</span>
          </motion.div>

          {/* Headline — light serif, smallest.ai style */}
          <motion.h1
            {...fadeUp(0.2)}
            className="text-[clamp(2.5rem,6vw,4rem)] leading-[1.1] mb-6"
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              textWrap: "balance",
            }}
          >
            Drone shots that hit{" "}
            <span className="text-av-red">different</span>
          </motion.h1>

          {/* Subtitle — geometric sans */}
          <motion.p
            {...fadeUp(0.35)}
            className="text-[clamp(1rem,2vw,1.25rem)] text-av-light leading-relaxed mb-10 max-w-lg"
            style={{ textWrap: "balance" }}
          >
            We fly, we edit, you get clean aerial content — videos, photos,
            and prints delivered straight to your device.
          </motion.p>

          {/* CTAs — compact gradient buttons */}
          <motion.div {...fadeUp(0.5)} className="flex flex-wrap gap-3">
            <a href="#contact" className="btn-red">
              Book a Shoot
              <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
            <a href="#work" className="btn-dark">
              See Our Work
              <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Stats — bottom row, understated */}
        <motion.div
          {...fadeUp(0.65)}
          className="mt-auto pt-16 flex flex-wrap gap-10 md:gap-16 border-t border-av-border-light"
        >
          {[
            { value: "4K", label: "Resolution" },
            { value: "9:16", label: "Reels Ready" },
            { value: "Email / AirDrop", label: "Delivery" },
            { value: "< 24h", label: "Turnaround" },
          ].map((s) => (
            <div key={s.label} className="pt-6">
              <div
                className="text-lg font-semibold text-av-text"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {s.value}
              </div>
              <div className="text-[11px] text-av-muted mt-1 uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
