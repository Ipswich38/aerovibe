"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const SERVICES = [
  {
    title: "Video & Photo",
    description: "Cinematic footage, stills, and social-ready edits — color-graded and ready for any screen.",
    icon: "M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887a.375.375 0 01.557-.328l5.603 3.113z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Events & Places",
    description: "Weddings, properties, travel, local landmarks — visual storytelling for the moments that matter.",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  },
  {
    title: "Website Design",
    description: "Clean, fast, mobile-first websites — from landing pages to full web apps.",
    icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3",
  },
  {
    title: "Mobile Apps",
    description: "Custom iOS and Android apps — from concept to App Store-ready build.",
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  },
  {
    title: "Software Development",
    description: "Bespoke tools, dashboards, and systems built around how you actually work.",
    icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  },
];

function ServiceCard({ s, delay }: { s: { title: string; description: string; icon: string }; delay: number }) {
  return (
    <ScrollReveal delay={delay}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="text-center group"
      >
        <div className="relative mx-auto mb-5 w-[88px] h-[88px] flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/[0.06] group-hover:border-cyan-400/20 transition-colors duration-500" />
          <div className="absolute inset-2 rounded-full bg-white/[0.03] group-hover:bg-cyan-400/[0.06] transition-colors duration-500" />
          <svg
            width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-cyan-400/70 group-hover:text-cyan-400 transition-colors duration-500 relative z-10"
          >
            <path d={s.icon} />
          </svg>
        </div>
        <h3
          className="text-sm text-white mb-1.5"
          style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}
        >
          {s.title}
        </h3>
        <p className="text-xs text-white/40 leading-relaxed max-w-[160px] mx-auto">
          {s.description}
        </p>
      </motion.div>
    </ScrollReveal>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative py-28 md:py-36 bg-av-dark overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2
              className="text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.1] text-white"
              style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
            >
              What We Create
            </h2>
            <p className="text-white/40 text-sm mt-4 max-w-md mx-auto leading-relaxed">
              Visual content, digital products, and custom software — built around your idea.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-8">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} s={s} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
}
