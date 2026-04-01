"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const services = [
  {
    icon: "🎬",
    title: "Aerial Video",
    color: "#c9342a",
    description:
      "Drone footage with basic color correction and editing. Horizontal and vertical formats available.",
    tags: ["4K / 1080p", "Color Corrected", "Edited", "30-60s"],
  },
  {
    icon: "📸",
    title: "Aerial Photography",
    color: "#d4730f",
    description:
      "High-resolution aerial stills with color correction. Digital delivery or optional print.",
    tags: ["High-Res", "Color Corrected", "Digital Delivery"],
  },
  {
    icon: "📱",
    title: "Social Media Cuts",
    color: "#2a6e4a",
    description:
      "Vertical 9:16 edits ready for Instagram Reels, TikTok, and YouTube Shorts.",
    tags: ["9:16 Vertical", "Quick Cuts", "Platform-Ready"],
  },
  {
    icon: "📲",
    title: "Fast Delivery",
    color: "#0ea5e9",
    description:
      "All content sent directly to you via email or AirDrop. No waiting for uploads, no cloud links to expire.",
    tags: ["Email", "AirDrop", "Same-Day", "All Formats"],
  },
  {
    icon: "🖨️",
    title: "Photo Prints",
    color: "#7832c8",
    description:
      "Optional add-on: get aerial shots printed on quality paper. Or bring any photo — we print it.",
    tags: ["Add-On", "Any Photo", "On-The-Spot"],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 md:py-28 bg-av-surface grid-pattern">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6">
        <ScrollReveal>
          <div className="mb-12">
            <div className="accent-bar mb-4" />
            <h2 className="headline text-3xl md:text-5xl font-bold">
              What We <span className="text-av-red">Deliver</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group p-5 rounded-lg border border-av-border bg-av-bg/60 hover:border-av-red/30 transition-colors duration-300 relative overflow-hidden h-full"
              >
                {/* Ambient glow */}
                <div
                  className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ background: s.color }}
                />

                <div className="relative">
                  <div className="text-2xl mb-3">{s.icon}</div>
                  <h3
                    className="text-lg font-bold tracking-[1px] uppercase mb-2"
                    style={{ fontFamily: "var(--font-cond)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-sm text-av-muted leading-relaxed mb-4">
                    {s.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((t) => (
                      <span key={t} className="pill text-av-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
