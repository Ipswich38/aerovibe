"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface WebProject {
  title: string;
  url: string;
  category: string;
  color: string;
}

const PROJECTS: WebProject[] = [
  { title: "RootByte.tech", url: "https://rootbyte.tech", category: "Media & Tech", color: "#a78bfa" },
  { title: "Salon del Mendo", url: "https://salondelmendo.vercel.app", category: "Beauty & Wellness", color: "#f472b6" },
  { title: "Happy Teeth", url: "https://happyteeth.vercel.app", category: "Healthcare", color: "#34d399" },
  { title: "RAK Jr.", url: "https://rakjrtest.vercel.app", category: "Construction", color: "#fb923c" },
  { title: "Cotton Beach Casuarina", url: "https://cottonbeachcasuarina.com", category: "Hospitality", color: "#fbbf24" },
];

function screenshotUrl(siteUrl: string) {
  return `https://api.microlink.io/?url=${encodeURIComponent(siteUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900&screenshot.type=jpeg`;
}

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 9.5l7-7M3.5 2.5h6v6" />
    </svg>
  );
}

function BrowserChrome({ url }: { url: string }) {
  const displayUrl = url.replace("https://", "");
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
      style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
      </div>
      <div
        className="flex-1 flex items-center justify-center rounded px-2 py-0.5 text-[10px] truncate"
        style={{ background: "#111", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}
      >
        {displayUrl}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: WebProject; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgSrc = screenshotUrl(project.url);

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
        <div
          className="relative overflow-hidden rounded-2xl mb-4 flex flex-col"
          style={{
            aspectRatio: "16/10",
            background: "#111",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <BrowserChrome url={project.url} />

          <div className="relative flex-1 overflow-hidden">
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
                src={imgSrc}
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

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-[12px] font-medium">
                Visit site <ArrowIcon />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-white text-[15px] font-semibold">{project.title}</h3>
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: project.color }}>
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
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="label-mono text-av-muted">Web Development</span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide border"
                style={{
                  background: "rgba(167,139,250,0.08)",
                  borderColor: "rgba(167,139,250,0.2)",
                  color: "#a78bfa",
                }}
              >
                Powered by kreativloops
              </span>
            </div>
            <h2
              className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Sites we&apos;ve built
            </h2>
            <p className="mt-3 text-[15px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Web, app, and marketing work delivered under the kreativloops brand.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        {/* Brand separator */}
        <ScrollReveal delay={0.25}>
          <div
            className="mt-14 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div>
              <p className="text-white text-[14px] font-semibold mb-1">Two brands, one team.</p>
              <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span className="text-white/60 font-medium">Waevpoint</span> handles aerial services and drone operations.{" "}
                <span className="text-white/60 font-medium">kreativloops</span> handles web, app, design, and marketing.
              </p>
            </div>
            <a
              href="https://kreativloops.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 shrink-0 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
              style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
            >
              kreativloops.com <ArrowIcon />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
