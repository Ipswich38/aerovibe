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
          <source
            src="https://videos.pexels.com/video-files/36769747/15582644_1280_720_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-32 pb-28 md:pt-40 md:pb-36 min-h-screen flex flex-col justify-center">
        <div className="max-w-2xl">
          <motion.div {...fadeUp(0.1)} className="mb-6">
            <span className="label-mono text-av-muted">Aerial Content &middot; 3D Mapping &middot; Inspections</span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.2)}
            className="text-[clamp(2.5rem,6vw,4rem)] leading-[1.1] mb-6"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              textWrap: "balance",
            }}
          >
            Drone shots that hit{" "}
            <span className="text-av-red">different</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.35)}
            className="text-[clamp(1rem,2vw,1.25rem)] text-av-light leading-relaxed mb-10 max-w-lg"
            style={{ textWrap: "balance" }}
          >
            From cinematic aerial footage to 3D site maps — we handle the
            flight, the data, and the delivery.
          </motion.p>

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

        {/* Stats */}
        <motion.div
          {...fadeUp(0.65)}
          className="mt-auto pt-16 flex flex-wrap gap-10 md:gap-16 border-t border-av-border-light"
        >
          {[
            { value: "4K", label: "Resolution" },
            { value: "3D", label: "Mapping" },
            { value: "Multi-Format", label: "Delivery" },
            { value: "< 24h", label: "Turnaround" },
          ].map((s) => (
            <div key={s.label} className="pt-6">
              <div className="text-lg font-semibold text-av-text">
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
