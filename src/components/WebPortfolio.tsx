"use client";

import { useState, useEffect, useRef } from "react";
import ScrollReveal from "./ScrollReveal";

const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
const ACCENT = "#a78bfa";

const SITES = [
  { name: "Waevpoint",             category: "Aerial Visuals",    url: "https://waevpoint.quest" },
  { name: "Rootbyte",              category: "Technology",         url: "https://rootbyte.tech" },
  { name: "Happy Teeth",           category: "Healthcare",         url: "https://happyteeth.vercel.app" },
  { name: "RAK Jr.",               category: "Construction",       url: "https://rakjrtest.vercel.app",      img: "/screenshots/rakjr.png" },
  { name: "Cotton Beach Casuarina",category: "Hospitality",        url: "https://cottonbeachcasuarina.com",  img: "/screenshots/cottonbeach.png" },
  { name: "Salon del Mendo",       category: "Beauty & Wellness",  url: "https://salondelmendo.vercel.app" },
];

function screenshotUrl(url: string) {
  return `/api/screenshot?url=${encodeURIComponent(url)}`;
}

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 9.5l7-7M3.5 2.5h6v6" />
    </svg>
  );
}

function CollageItem({ site, delay = 0 }: { site: (typeof SITES)[0]; delay?: number }) {
  const isStatic = Boolean(site.img);
  const [loaded,  setLoaded]  = useState(isStatic);
  const [errored, setErrored] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isStatic) return;
    timerRef.current = setTimeout(() => { setLoaded(true); setErrored(true); }, 13000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isStatic]);

  return (
    <ScrollReveal delay={delay}>
      <div className="h-full">
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-full h-full overflow-hidden cursor-pointer select-none"
          style={{ background: "#0d1117" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Loading spinner */}
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "rgba(255,255,255,0.3)" }}
              />
            </div>
          )}

          {/* Screenshot */}
          <img
            src={site.img ?? screenshotUrl(site.url)}
            alt={site.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.6s, transform 0.65s cubic-bezier(0.25,0.1,0.25,1)",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
            onLoad={() => { if (timerRef.current) clearTimeout(timerRef.current); setLoaded(true); setErrored(false); }}
            onError={() => { if (timerRef.current) clearTimeout(timerRef.current); setLoaded(true); setErrored(true); }}
          />

          {/* Fallback when screenshot unavailable */}
          {loaded && errored && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
              style={{ background: "#1a1e28" }}>
              <p style={{ fontFamily: FONT, color: "rgba(255,255,255,0.18)", fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                {site.url.replace("https://", "")}
              </p>
            </div>
          )}

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(5,6,10,0.66)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.28s",
            }}
          />

          {/* Centered content */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
            style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.28s" }}
          >
            {/* Circle icon */}
            <div
              className="flex items-center justify-center rounded-full border-2 border-white/70 shrink-0"
              style={{
                width: 44,
                height: 44,
                transform: hovered ? "scale(1) translateY(0)" : "scale(0.7) translateY(12px)",
                transition: "transform 0.36s cubic-bezier(0.34,1.28,0.64,1)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 9.5l7-7M3.5 2.5h6v6" />
              </svg>
            </div>

            {/* Title + category */}
            <div
              style={{
                transform: hovered ? "translateY(0)" : "translateY(8px)",
                transition: "transform 0.30s 0.04s",
              }}
            >
              <p style={{ fontFamily: FONT, fontWeight: 700, color: "#fff", fontSize: "1rem", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                {site.name}
              </p>
              <p style={{ fontFamily: FONT, color: ACCENT, fontSize: "0.65rem", marginTop: 5, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
                {site.category}
              </p>
            </div>
          </div>
        </a>
      </div>
    </ScrollReveal>
  );
}

export default function WebPortfolio() {
  return (
    <section id="sites" className="dark-section py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="label-mono text-av-muted">Web Development</span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide border"
                style={{ background: "rgba(167,139,250,0.08)", borderColor: "rgba(167,139,250,0.2)", color: ACCENT }}
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

        {/* 2-col × 3-row collage — same layout as kreativloops.com */}
        <div
          className="grid grid-cols-2"
          style={{ gridAutoRows: "clamp(200px, 30vw, 420px)", gap: 0 }}
        >
          {SITES.map((site, i) => (
            <CollageItem key={site.name} site={site} delay={0.06 + i * 0.05} />
          ))}
        </div>

        {/* Brand separator */}
        <ScrollReveal delay={0.25}>
          <div
            className="mt-10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
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
              style={{ background: "rgba(167,139,250,0.12)", color: ACCENT, border: "1px solid rgba(167,139,250,0.2)" }}
            >
              kreativloops.com <ArrowIcon />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
