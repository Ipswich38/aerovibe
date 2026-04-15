"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const solutions = [
  {
    headline: "We fly, edit, and deliver.",
    description: "Not just raw footage — you get fully edited, color-graded, music-synced content ready to post or present.",
  },
  {
    headline: "Startup pricing, no markup.",
    description: "No office rent, no big team overhead. You pay for the content — that's it. Transparent rates from day one.",
  },
  {
    headline: "Quality you can preview first.",
    description: "We show samples before you book. And if you're not happy with the output, we re-edit it — free.",
  },
  {
    headline: "Same-day delivery.",
    description: "Standard shoots delivered the same day via AirDrop, email, or Google Drive. No waiting around.",
  },
  {
    headline: "Every format you need.",
    description: "Horizontal for YouTube, vertical for Reels and TikTok, stills for listings — all from one shoot.",
  },
  {
    headline: "Built for Filipino businesses.",
    description: "Real estate, events, tourism, construction — we understand the local market and what your audience wants to see.",
  },
];

export default function WhyUs() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % solutions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const active = solutions[activeIndex];

  return (
    <section id="why" className="relative py-32 md:py-44 overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/35282262/14947020_2560_1440_30fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6">
        <ScrollReveal>
          <div className="relative min-h-[340px] md:min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <h2
                  className="text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.1] text-white mb-6"
                  style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
                >
                  {active.headline}
                </h2>
                <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl mx-auto">
                  {active.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2.5">
              {solutions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`transition-all duration-500 rounded-full ${
                    i === activeIndex
                      ? "w-8 h-1.5 bg-cyan-400"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Solution ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
