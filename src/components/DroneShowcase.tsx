"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ScrollReveal from "./ScrollReveal";

export default function DroneShowcase() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -3]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

  return (
    <section
      ref={sectionRef}
      className="dark-section py-24 md:py-32 overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2
              className="text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.1]"
              style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
            >
              DJI Mini 5 Pro
            </h2>
          </div>
        </ScrollReveal>

        <motion.div
          style={{ rotateX, scale }}
          className="rounded-xl inner-glow bg-av-surface border border-av-border-light overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Specs */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="label-mono text-cyan-400/60 mb-3">Our Gear</span>
              <h3
                className="text-2xl md:text-3xl mb-2"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                DJI Mini 5 Pro
              </h3>
              <p className="text-sm text-av-muted leading-relaxed mb-8">
                Pro-level aerial camera in an ultra-portable body. 4K HDR video,
                48MP photos, omnidirectional obstacle sensing — everything we
                need to capture stunning content for you.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "4K HDR", label: "Video" },
                  { value: "48MP", label: "Photos" },
                  { value: "34 min", label: "Flight Time" },
                  { value: "< 249g", label: "Ultralight" },
                  { value: "ActiveTrack", label: "Subject Tracking" },
                  { value: "O4", label: "Transmission" },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="border-l border-av-border-light pl-3 py-1"
                  >
                    <div className="text-base font-semibold text-av-text">
                      {spec.value}
                    </div>
                    <div className="text-[11px] text-av-muted uppercase tracking-wider mt-0.5">
                      {spec.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* YouTube embed */}
            <div className="relative min-h-[300px] md:min-h-[450px] bg-av-elevated">
              <iframe
                src="https://www.youtube.com/embed/jRzpagPx6uY?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1"
                title="DJI Mini 5 Pro"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
