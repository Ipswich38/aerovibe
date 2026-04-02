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
            <span className="label-mono text-av-muted block mb-4">Equipment</span>
            <h2
              className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Professional Aerial Gear
            </h2>
          </div>
        </ScrollReveal>

        <motion.div
          style={{ rotateX, scale }}
          className="rounded-xl inner-glow bg-av-surface border border-av-border-light overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Capabilities */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="label-mono text-av-muted mb-3">Current Fleet</span>
              <h3
                className="text-2xl md:text-3xl mb-4"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                DJI Drones
              </h3>
              <p className="text-sm text-av-muted leading-relaxed mb-8">
                Cinema-grade aerial cameras with stabilized 4K video and
                intelligent flight modes — built for stunning content.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "4K", label: "Video" },
                  { value: "Stabilized", label: "Gimbal" },
                  { value: "Smart", label: "Flight Modes" },
                  { value: "Compact", label: "Form Factor" },
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

            {/* Visual */}
            <div className="relative min-h-[300px] md:min-h-[450px] bg-av-elevated flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -8, 0], rotateZ: [0, 0.5, 0, -0.5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <svg
                  width="160"
                  height="160"
                  viewBox="0 0 200 200"
                  fill="none"
                  className="text-av-text/10"
                >
                  <rect x="80" y="85" width="40" height="30" rx="6" fill="currentColor" />
                  <line x1="85" y1="95" x2="40" y2="60" stroke="currentColor" strokeWidth="3" />
                  <line x1="115" y1="95" x2="160" y2="60" stroke="currentColor" strokeWidth="3" />
                  <line x1="85" y1="105" x2="40" y2="140" stroke="currentColor" strokeWidth="3" />
                  <line x1="115" y1="105" x2="160" y2="140" stroke="currentColor" strokeWidth="3" />
                  <circle cx="40" cy="60" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx="160" cy="60" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx="40" cy="140" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx="160" cy="140" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx="100" cy="120" r="5" fill="currentColor" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
