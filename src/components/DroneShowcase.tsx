"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ScrollReveal from "./ScrollReveal";

/**
 * DJI-inspired full-bleed drone showcase section with 3D perspective scroll effect
 */
export default function DroneShowcase() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-av-surface overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      <div className="max-w-[1180px] mx-auto px-4 md:px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="accent-bar mx-auto mb-4" />
            <h2 className="headline text-3xl md:text-5xl font-bold">
              Powered By <span className="text-av-red">DJI</span>
            </h2>
            <p className="text-av-muted mt-3 max-w-md mx-auto text-sm leading-relaxed">
              Professional-grade hardware meets AI-powered editing. Every shoot
              uses the latest DJI drone technology.
            </p>
          </div>
        </ScrollReveal>

        {/* 3D perspective card — DJI product showcase style */}
        <motion.div
          style={{ rotateX, scale, opacity }}
          className="relative rounded-xl border border-av-border bg-av-bg/80 backdrop-blur-md overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left — DJI Neo 2 specs */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="label-mono text-av-red mb-3">Primary Drone</span>
              <h3
                className="text-3xl md:text-4xl font-black tracking-[3px] uppercase mb-4"
                style={{ fontFamily: "var(--font-cond)" }}
              >
                DJI Neo 2
              </h3>
              <p className="text-sm text-av-muted leading-relaxed mb-8">
                Ultra-compact, incredibly capable. 4K stabilized video with
                intelligent flight modes. The perfect tool for cinematic aerial
                content at any scale.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "4K", label: "Video Resolution" },
                  { value: "3.3×", label: "Slow Motion" },
                  { value: "136g", label: "Ultralight" },
                  { value: "18min", label: "Flight Time" },
                  { value: "6", label: "QuickShots" },
                  { value: "3-Axis", label: "Stabilization" },
                ].map((spec) => (
                  <div key={spec.label} className="border-l-2 border-av-red/20 pl-3">
                    <div
                      className="text-xl font-bold text-av-text"
                      style={{ fontFamily: "var(--font-cond)", letterSpacing: "1px" }}
                    >
                      {spec.value}
                    </div>
                    <div className="label-mono text-av-muted mt-0.5">
                      {spec.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — visual area */}
            <div className="relative min-h-[300px] md:min-h-[500px] bg-gradient-to-br from-av-elevated to-av-bg flex items-center justify-center overflow-hidden">
              {/* Abstract drone silhouette — will be replaced with real image */}
              <div className="absolute inset-0 opacity-5 grid-pattern" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-av-red/[0.06] rounded-full blur-[80px]" />

              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotateZ: [0, 1, 0, -1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                {/* Stylized drone icon */}
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  className="text-av-text/20"
                >
                  {/* Body */}
                  <rect
                    x="80"
                    y="85"
                    width="40"
                    height="30"
                    rx="6"
                    fill="currentColor"
                  />
                  {/* Arms */}
                  <line
                    x1="85"
                    y1="95"
                    x2="40"
                    y2="60"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <line
                    x1="115"
                    y1="95"
                    x2="160"
                    y2="60"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <line
                    x1="85"
                    y1="105"
                    x2="40"
                    y2="140"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <line
                    x1="115"
                    y1="105"
                    x2="160"
                    y2="140"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  {/* Propellers */}
                  <circle
                    cx="40"
                    cy="60"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="160"
                    cy="60"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="40"
                    cy="140"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="160"
                    cy="140"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Camera */}
                  <circle cx="100" cy="120" r="5" fill="currentColor" />
                </svg>

                {/* Shadow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 h-3 bg-av-text/5 rounded-full blur-sm" />
              </motion.div>

              {/* Label */}
              <div className="absolute bottom-6 right-6">
                <span className="label-mono text-av-muted/50">
                  Replace with DJI Neo 2 product shot
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
