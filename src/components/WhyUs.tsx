"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const solutions = [
  {
    headline: <>Come see your world <span className="text-cyan-400">from the clouds.</span></>,
    description: "Cinematic aerial visuals for properties, events, and content projects across the Philippines.",
    accent: true,
  },
  {
    headline: <>Sky to screen:<br className="hidden md:block" /> one creative team.</>,
    description: "Aerial visuals, web design, mobile apps, and custom software. Different crafts, one consistent vision.",
    accent: false,
  },
  {
    headline: <>We create.<br className="hidden md:block" /> You stand out.</>,
    description: "Not templates, not stock. Everything is made from scratch around what you're trying to say and who you're saying it to.",
    accent: false,
  },
  {
    headline: <>Quality you can see<br className="hidden md:block" /> before you commit.</>,
    description: "We show samples and prototypes before you sign off. Not happy with the output? We iterate. No extra charge.",
    accent: false,
  },
  {
    headline: <>Every format.<br className="hidden md:block" /> Every platform.</>,
    description: "Reels, YouTube, listings, app stores, websites. Built for where your audience actually lives.",
    accent: false,
  },
  {
    headline: <>Simple process.<br className="hidden md:block" /> Clear results.</>,
    description: "No jargon, no scope creep. We scope it, build it, deliver it. You always know what's happening and when.",
    accent: false,
  },
  {
    headline: <>Personal,<br className="hidden md:block" /> not transactional.</>,
    description: "You talk directly to the person doing the work. Fast replies, honest feedback, real collaboration.",
    accent: false,
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
                  className={`leading-[1.05] text-white mb-6 ${
                    active.accent
                      ? "text-[clamp(2.8rem,7vw,5rem)]"
                      : "text-[clamp(2.2rem,5.5vw,4rem)]"
                  }`}
                  style={{
                    fontFamily: "'League Spartan', sans-serif",
                    fontWeight: active.accent ? 800 : 700,
                  }}
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
