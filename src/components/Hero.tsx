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
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* Content — anchored to bottom so the video fills the frame */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pb-14 md:pb-20 min-h-screen flex flex-col justify-end">
        <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-3 mb-14">
          <a href="#work" className="btn-cyan">
            Watch Sample Work
            <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
          <a href="#contact" className="btn-dark">
            Get in Touch
            <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        </motion.div>

        <motion.div
          {...fadeUp(0.5)}
          className="flex flex-wrap gap-10 md:gap-16 border-t border-av-border-light"
        >
          {[
            { value: "Edited", label: "Not just raw footage" },
            { value: "No hidden fees", label: "What we quote is what you pay" },
            { value: "Your format", label: "Reels, landscape, both" },
          ].map((s) => (
            <div key={s.label} className="pt-6">
              <div className="text-lg font-semibold text-av-text">{s.value}</div>
              <div className="text-[11px] text-av-muted mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
