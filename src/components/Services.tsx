"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const services = [
  {
    icon: "🎬",
    title: "Aerial Video",
    description: "Drone footage with basic color correction and editing. Horizontal and vertical formats available.",
    tags: ["4K / 1080p", "Color Corrected", "Edited", "30-60s"],
  },
  {
    icon: "📸",
    title: "Aerial Photography",
    description: "High-resolution aerial stills with color correction. Digital delivery or optional print.",
    tags: ["High-Res", "Color Corrected", "Digital Delivery"],
  },
  {
    icon: "📱",
    title: "Social Media Cuts",
    description: "Vertical 9:16 edits ready for Instagram Reels, TikTok, and YouTube Shorts.",
    tags: ["9:16 Vertical", "Quick Cuts", "Platform-Ready"],
  },
  {
    icon: "📲",
    title: "Fast Delivery",
    description: "All content sent directly to you via email or AirDrop. No waiting for uploads.",
    tags: ["Email", "AirDrop", "Same-Day"],
  },
  {
    icon: "🖨️",
    title: "Photo Prints",
    description: "Optional add-on: get aerial shots printed on quality paper. Or bring any photo — we print it.",
    tags: ["Add-On", "Any Photo", "On-The-Spot"],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-32 bg-av-bg">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-14">
            <span className="label-mono text-av-muted block mb-4">Services</span>
            <h2
              className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1] text-av-dark"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              What we deliver
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="group p-6 rounded-xl border border-av-border bg-white hover:shadow-lg transition-shadow duration-300 h-full"
              >
                <div className="text-2xl mb-4">{s.icon}</div>
                <h3
                  className="text-lg text-av-dark mb-2"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-av-muted leading-relaxed mb-4">
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span key={t} className="pill text-av-muted bg-gray-50">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
