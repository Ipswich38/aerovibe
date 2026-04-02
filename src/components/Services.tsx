"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface ServiceCategory {
  label: string;
  coming_soon?: boolean;
  services: { icon: string; title: string; description: string; tags: string[] }[];
}

const categories: ServiceCategory[] = [
  {
    label: "Content & Creative",
    services: [
      {
        icon: "🎬",
        title: "Aerial Video",
        description: "Cinematic drone footage, edited and delivered. Horizontal and vertical formats.",
        tags: ["4K / 1080p", "Edited", "30-60s"],
      },
      {
        icon: "📸",
        title: "Aerial Photography",
        description: "High-resolution aerial stills, edited and ready. Digital delivery or optional print.",
        tags: ["High-Res", "Edited", "Digital Delivery"],
      },
      {
        icon: "📱",
        title: "Social Media Cuts",
        description: "Vertical 9:16 edits ready for Instagram Reels, TikTok, and YouTube Shorts.",
        tags: ["9:16 Vertical", "Quick Cuts", "Platform-Ready"],
      },
    ],
  },
  {
    label: "Commercial & Real Estate",
    services: [
      {
        icon: "🏠",
        title: "Property Aerials",
        description: "Showcase listings from above — wide context shots, close-ups, and surrounding area coverage.",
        tags: ["Real Estate", "Listings", "Promo-Ready"],
      },
      {
        icon: "🏗️",
        title: "Construction Progress",
        description: "Periodic aerial documentation of build sites. Track progress over time with consistent angles.",
        tags: ["Site Docs", "Progress Tracking", "Reporting"],
      },
      {
        icon: "🔍",
        title: "Site Inspections",
        description: "Roof, solar panel, and structural inspections from angles you can't reach on foot.",
        tags: ["Solar", "Rooftop", "Infrastructure"],
      },
    ],
  },
  {
    label: "Mapping & Technical — Coming Soon",
    coming_soon: true,
    services: [
      {
        icon: "🗺️",
        title: "3D Mapping",
        description: "Photogrammetry-generated 3D models from aerial photos. Interactive, shareable, measurable.",
        tags: ["Photogrammetry", "3D Model", "Interactive"],
      },
      {
        icon: "📐",
        title: "Orthomosaic Maps",
        description: "Stitched top-down aerial maps with consistent scale. Perfect for land surveys and planning.",
        tags: ["Top-Down", "Scaled", "GeoReferenced"],
      },
      {
        icon: "📊",
        title: "Terrain & Volume",
        description: "Elevation models and volume calculations for construction sites, quarries, and land assessment.",
        tags: ["Elevation", "Volume Calc", "Terrain"],
      },
    ],
  },
  {
    label: "Add-Ons",
    services: [
      {
        icon: "🖨️",
        title: "Photo Prints",
        description: "Get aerial shots printed on quality paper. Or bring any photo — we print it.",
        tags: ["Add-On", "Any Photo", "On-The-Spot"],
      },
      {
        icon: "📲",
        title: "Fast Delivery",
        description: "All content sent directly to you via email or AirDrop. No waiting for uploads.",
        tags: ["Email", "AirDrop", "Same-Day"],
      },
    ],
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
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              What we deliver
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-12">
          {categories.map((cat, ci) => (
            <div key={ci}>
              <ScrollReveal delay={ci * 0.05}>
                <h3
                  className="text-xs uppercase tracking-[0.15em] text-av-muted mb-4 border-b border-av-border pb-2"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
                >
                  {cat.label}
                </h3>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.services.map((s, i) => (
                  <ScrollReveal key={i} delay={ci * 0.05 + i * 0.08}>
                    <motion.div
                      whileHover={cat.coming_soon ? {} : { y: -3 }}
                      transition={{ duration: 0.2 }}
                      className={`group p-6 rounded-xl border h-full ${
                        cat.coming_soon
                          ? "border-dashed border-av-border bg-gray-50/60 opacity-60"
                          : "border-av-border bg-white hover:shadow-lg transition-shadow duration-300"
                      }`}
                    >
                      <div className="text-2xl mb-4">{s.icon}</div>
                      <h3
                        className="text-lg text-av-dark mb-2"
                        style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
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
          ))}
        </div>
      </div>
    </section>
  );
}
