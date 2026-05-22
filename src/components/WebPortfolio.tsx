"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface WebProject {
  title: string;
  url: string;
  category: string;
  color: string;
  screenshot: string; // path in /public or external URL
}

const PROJECTS: WebProject[] = [
  {
    title: "RootByte.tech",
    url: "https://rootbyte.tech",
    category: "Media & Tech",
    color: "#a78bfa",
    screenshot: "/screenshots/rootbyte.jpg",
  },
  {
    title: "Salon del Mendo",
    url: "https://salondelmendo.vercel.app",
    category: "Beauty & Wellness",
    color: "#f472b6",
    screenshot: "/screenshots/salondelmendo.jpg",
  },
  {
    title: "Happy Teeth",
    url: "https://happyteeth.vercel.app",
    category: "Healthcare",
    color: "#34d399",
    screenshot: "/screenshots/happyteeth.jpg",
  },
  {
    title: "RAK Jr.",
    url: "https://rakjrtest.vercel.app",
    category: "Construction",
    color: "#fb923c",
    // preview URL blocked by Vercel deployment auth — using Microlink as fallback
    screenshot: `https://api.microlink.io/?url=${encodeURIComponent("https://rakjrtest.vercel.app")}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900&screenshot.type=jpeg`,
  },
  {
    title: "Cotton Beach Casuarina",
    url: "https://cottonbeachcasuarina.com",
    category: "Hospitality",
    color: "#fbbf24",
    screenshot: "/screenshots/cottonbeach.jpg",
  },
];

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 9.5l7-7M3.5 2.5h6v6" />
    </svg>
  );
}

function ProjectCard({ project, index }: { project: WebProject; index: number }) {
  const isStatic = project.screenshot.startsWith("/");
  const [loaded, setLoaded] = useState(isStatic); // static images treated as pre-loaded
  const [errored, setErrored] = useState(false);

  return (
    <ScrollReveal delay={index * 0.07}>
      <motion.a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="group block"
      >
        {/* Screenshot */}
        <div
          className="relative overflow-hidden rounded-2xl mb-4"
          style={{
            aspectRatio: "16/10",
            background: "#111",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Spinner only for remote screenshots */}
          {!loaded && !errored && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "rgba(255,255,255,0.3)" }}
              />
            </div>
          )}

          {!errored && (
            <img
              src={project.screenshot}
              alt={project.title}
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-[1.04]"
              style={{ opacity: loaded ? 1 : 0 }}
            />
          )}

          {errored && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                {project.url.replace("https://", "")}
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-[12px] font-medium">
              Visit site <ArrowIcon />
            </span>
          </div>
        </div>

        {/* Title + category */}
        <div className="flex items-center justify-between px-0.5">
          <h3
            className="text-white text-[15px] font-semibold"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {project.title}
          </h3>
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: project.color }}
          >
            {project.category}
          </span>
        </div>
      </motion.a>
    </ScrollReveal>
  );
}

export default function WebPortfolio() {
  return (
    <section id="sites" className="dark-section py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-14">
            <span className="label-mono text-av-muted block mb-4">Web Development</span>
            <h2
              className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Sites we&apos;ve built
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-14 text-center">
            <a
              href="https://kreativloops.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              See more at kreativloops.com <ArrowIcon />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
