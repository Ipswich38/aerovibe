"use client";

import { SYSTEM_FONT } from "@/lib/ops";

interface LUT {
  name: string;
  profile: string;
  look: string;
  desc: string;
  tags: string[];
  strength: "light" | "medium" | "strong";
  downloadUrl?: string;
  fileName?: string;
}

// DJI Mini 5 Pro shoots D-Log M (10-bit) and Normal color profile.
// Mini 5 Pro uses the same D-Log M pipeline as Mini 4 Pro — those LUTs are fully compatible.
const LUTS: LUT[] = [
  // ── D-Log M → Rec.709 conversions ──────────────────────────────────────────
  {
    name: "D-Log M to Rec.709",
    profile: "D-Log M",
    look: "Conversion",
    desc: "Official DJI conversion LUT from D-Log M flat profile to Rec.709 display-ready. Start here — apply every creative LUT on top of this.",
    tags: ["conversion", "rec709", "neutral", "official"],
    strength: "medium",
    downloadUrl: "/luts/dji-mini-dlog-m-to-rec709.cube",
    fileName: "DJI-Mini-DLogM-to-Rec709.cube",
  },
  {
    name: "D-Log M Vivid",
    profile: "D-Log M",
    look: "Vibrant",
    desc: "Rec.709 conversion with boosted saturation and contrast — punchier skies and greens. Great for travel and real estate.",
    tags: ["vivid", "saturated", "real estate", "travel"],
    strength: "medium",
  },
  {
    name: "D-Log M Warm Golden",
    profile: "D-Log M",
    look: "Warm",
    desc: "Golden hour warmth baked in — orange and amber tones lifted, shadows warm. Ideal for sunrise/sunset flights.",
    tags: ["warm", "golden", "sunset", "events"],
    strength: "medium",
  },
  {
    name: "D-Log M Cinematic Teal",
    profile: "D-Log M",
    look: "Cinematic",
    desc: "Hollywood teal-orange split toning — desaturated shadows with warm highlights. Cinematic aerial feel.",
    tags: ["cinematic", "teal", "orange", "commercial"],
    strength: "strong",
  },
  {
    name: "D-Log M Cool Corporate",
    profile: "D-Log M",
    look: "Cool",
    desc: "Clean blue-white neutral conversion. Ideal for architecture, construction documentation and corporate shoots.",
    tags: ["cool", "neutral", "architecture", "construction"],
    strength: "light",
  },
  {
    name: "D-Log M Matte Film",
    profile: "D-Log M",
    look: "Matte",
    desc: "Lifted blacks, reduced contrast, faded film look. Pairs well with social media reels and editorial content.",
    tags: ["matte", "film", "social", "editorial"],
    strength: "medium",
  },
  {
    name: "D-Log M Documentary",
    profile: "D-Log M",
    look: "Documentary",
    desc: "Desaturated, slightly flat — natural and real. Best for surveys, construction progress and news-style coverage.",
    tags: ["documentary", "desaturated", "survey", "construction"],
    strength: "light",
  },
  {
    name: "D-Log M Coastal",
    profile: "D-Log M",
    look: "Coastal",
    desc: "Deep blue water, vivid greens, clean whites — designed for beach and ocean aerial work.",
    tags: ["coastal", "ocean", "beach", "travel"],
    strength: "medium",
  },

  // ── Normal color profile LUTs ────────────────────────────────────────────────
  {
    name: "Normal + Contrast Boost",
    profile: "Normal",
    look: "Enhanced",
    desc: "Adds punch to the Mini 5 Pro's Normal profile without colour grading — better contrast for quick exports.",
    tags: ["normal", "contrast", "quick"],
    strength: "light",
  },
  {
    name: "Normal Cinematic",
    profile: "Normal",
    look: "Cinematic",
    desc: "Desaturates and adds a slight grain feel to Normal footage. For clients who want a film look without flat footage.",
    tags: ["normal", "cinematic", "events", "weddings"],
    strength: "medium",
  },
  {
    name: "Normal Social Reel",
    profile: "Normal",
    look: "Vibrant",
    desc: "High saturation, punchy highlights — optimised for Instagram reels and TikTok vertical cuts.",
    tags: ["normal", "social", "vibrant", "instagram"],
    strength: "strong",
  },
];

const LOOK_COLORS: Record<string, { bg: string; color: string }> = {
  Conversion:  { bg: "rgba(6,182,212,0.1)",   color: "#06b6d4" },
  Vibrant:     { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24" },
  Warm:        { bg: "rgba(251,146,60,0.1)",  color: "#fb923c" },
  Cinematic:   { bg: "rgba(139,92,246,0.1)",  color: "#8b5cf6" },
  Cool:        { bg: "rgba(96,165,250,0.1)",  color: "#60a5fa" },
  Matte:       { bg: "rgba(156,163,175,0.1)", color: "#9ca3af" },
  Documentary: { bg: "rgba(52,211,153,0.1)",  color: "#34d399" },
  Coastal:     { bg: "rgba(14,165,233,0.1)",  color: "#0ea5e9" },
  Enhanced:    { bg: "rgba(234,179,8,0.1)",   color: "#eab308" },
};

const STRENGTH_DOTS: Record<string, number> = {
  light: 1, medium: 2, strong: 3,
};

const PROFILES = ["All", "D-Log M", "Normal"];
const TAGS_ALL = ["All", "real estate", "events", "weddings", "travel", "cinematic", "social", "construction", "survey", "coastal"];

export default function LutsPage() {
  // Use React hooks via "use client"
  const [filter, setFilter] = React.useState("All");
  const [tagFilter, setTagFilter] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const filtered = LUTS.filter(l => {
    if (filter !== "All" && l.profile !== filter) return false;
    if (tagFilter !== "All" && !l.tags.includes(tagFilter)) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) &&
        !l.desc.toLowerCase().includes(search.toLowerCase()) &&
        !l.tags.some(t => t.includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: SYSTEM_FONT }}>
      <div className="max-w-4xl mx-auto px-4 py-5">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[17px] font-semibold text-white">LUTs</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
              DJI Mini 5 Pro
            </span>
          </div>
          <p className="text-[12px] text-white/40">
            Color LUTs for D-Log M and Normal profiles · {LUTS.length} available
          </p>
        </div>

        {/* Tip */}
        <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3"
          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <span className="text-[13px] shrink-0">◈</span>
          <p className="text-[11px] leading-relaxed" style={{ color: "#888" }}>
            Shoot in <strong className="text-white/70">D-Log M 10-bit</strong> on your Mini 5 Pro.
            Always apply <strong className="text-white/70">D-Log M → Rec.709</strong> first, then stack a creative LUT on top.
          </p>
        </div>

        {/* Search + filters */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search LUTs…"
            className="w-full rounded-lg px-3 py-2 text-[12px] text-white outline-none placeholder:text-white/20"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          />

          {/* Profile filter */}
          <div className="flex gap-1.5 flex-wrap">
            {PROFILES.map(p => (
              <button key={p} onClick={() => setFilter(p)}
                className="px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                style={{
                  background: filter === p ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${filter === p ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: filter === p ? "#a78bfa" : "#888",
                }}>
                {p}
              </button>
            ))}
            <div className="w-px mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
            {TAGS_ALL.map(t => (
              <button key={t} onClick={() => setTagFilter(t)}
                className="px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                style={{
                  background: tagFilter === t ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${tagFilter === t ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: tagFilter === t ? "#06b6d4" : "#666",
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* LUT grid */}
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-[13px] text-white/30">No LUTs match your filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(lut => {
              const lookStyle = LOOK_COLORS[lut.look] ?? { bg: "rgba(255,255,255,0.05)", color: "#888" };
              const dots = STRENGTH_DOTS[lut.strength];
              return (
                <div key={lut.name} className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>

                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white leading-tight truncate">{lut.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#777" }}>
                          {lut.profile}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: lookStyle.bg, color: lookStyle.color }}>
                          {lut.look}
                        </span>
                      </div>
                    </div>
                    {/* Strength dots */}
                    <div className="flex gap-0.5 shrink-0 mt-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: i <= dots ? lookStyle.color : "rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#777" }}>
                    {lut.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {lut.tags.map(tag => (
                      <span key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#555" }}
                        onClick={() => setTagFilter(tag === tagFilter ? "All" : tag)}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Download */}
                  {lut.downloadUrl ? (
                    <a
                      href={lut.downloadUrl}
                      download={lut.fileName ?? true}
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] transition-all hover:opacity-80"
                      style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.35)" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      Download .cube
                    </a>
                  ) : (
                    <div className="mt-3 w-full py-1.5 rounded-lg text-[11px] text-center cursor-default"
                      style={{ background: "rgba(255,255,255,0.03)", color: "#444", border: "1px solid rgba(255,255,255,0.06)" }}>
                      .cube — coming soon
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center mt-8 text-[11px]" style={{ color: "#333" }}>
          Shoot in D-Log M (10-bit) for maximum grading latitude with the Mini 5 Pro.
          Normal profile LUTs are for quick-turn deliverables.
        </p>
      </div>
    </div>
  );
}

// Need React for useState in "use client"
import React from "react";
