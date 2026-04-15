"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const services = [
  {
    title: "Aerial Video",
    description: "Cinematic drone footage, edited with music and color grading.",
    icon: "M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887a.375.375 0 01.557-.328l5.603 3.113z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Aerial Photography",
    description: "High-resolution stills for listings, social, or personal use.",
    icon: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z",
  },
  {
    title: "Social Media Cuts",
    description: "Vertical 9:16 edits ready for Reels, TikTok, and Shorts.",
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  },
  {
    title: "Property Showcase",
    description: "Aerial tours for real estate listings and pre-selling units.",
    icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  },
  {
    title: "Construction Progress",
    description: "Monthly site documentation with consistent aerial angles.",
    icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  },
  {
    title: "Events Coverage",
    description: "Weddings, fiestas, corporate — aerial shots that elevate any event.",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  },
  {
    title: "Tourism Content",
    description: "Stunning aerials for resorts, hotels, and LGU campaigns.",
    icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  },
  {
    title: "Photo Prints",
    description: "Get aerial shots or any photo printed on quality paper.",
    icon: "M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.12 48.12 0 0110.5 0m-10.5 0V5.625c0-.621.504-1.125 1.125-1.125h8.25c.621 0 1.125.504 1.125 1.125v3.284",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-28 md:py-36 bg-av-dark overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-[1000px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2
              className="text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.1] text-white"
              style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
            >
              Services
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {services.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-center group"
              >
                {/* Icon circle */}
                <div className="relative mx-auto mb-5 w-[88px] h-[88px] flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-white/[0.06] group-hover:border-cyan-400/20 transition-colors duration-500" />
                  <div className="absolute inset-2 rounded-full bg-white/[0.03] group-hover:bg-cyan-400/[0.06] transition-colors duration-500" />
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-cyan-400/70 group-hover:text-cyan-400 transition-colors duration-500 relative z-10"
                  >
                    <path d={s.icon} />
                  </svg>
                </div>

                {/* Title */}
                <h3
                  className="text-sm text-white mb-1.5"
                  style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}
                >
                  {s.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-white/40 leading-relaxed max-w-[160px] mx-auto">
                  {s.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
