"use client";

import { useState } from "react";
import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

interface Definition {
  term: string;
  abbr?: string;
  body: string;
  tag: "airspace" | "aircraft" | "operation" | "person";
}

const DEFINITIONS: Definition[] = [
  {
    term: "Beyond Visual Line Of Sight",
    abbr: "BVLOS",
    body: "An operation in which the remote pilot or RPA observer maintains contact with the RPA other than using VLOS.",
    tag: "operation",
  },
  {
    term: "Controlled Airspace",
    body: "An airspace of defined dimensions within which air traffic control service is provided in accordance with the airspace classification.",
    tag: "airspace",
  },
  {
    term: "Controller of an RPA",
    body: "A person who manipulates the flight controls of a Remotely Piloted Aircraft.",
    tag: "person",
  },
  {
    term: "Detect and Avoid",
    body: "The capability to see, sense or detect conflicting traffic or other hazards and take the appropriate action.",
    tag: "operation",
  },
  {
    term: "Large RPA",
    body: "An RPA with a gross weight of 7 kg and above.",
    tag: "aircraft",
  },
  {
    term: "Prohibited Airspace",
    body: "An airspace of defined dimensions identified by an area on the surface of the earth in which flight of aircraft is prohibited. Such areas are established for security or other reasons associated with the national welfare.",
    tag: "airspace",
  },
  {
    term: "Remotely Piloted Aircraft",
    abbr: "RPA",
    body: "An unmanned aircraft which is piloted from a remote pilot station.",
    tag: "aircraft",
  },
  {
    term: "Remotely Piloted Aircraft System",
    abbr: "RPAS",
    body: "A remotely piloted aircraft, its associated remote pilot stations, the required command and control links and any other components as specified in the type design.",
    tag: "aircraft",
  },
  {
    term: "Small RPA",
    body: "An RPA with a gross weight of below 7 kg.",
    tag: "aircraft",
  },
  {
    term: "Visual Line Of Sight",
    abbr: "VLOS",
    body: "An operation in which the remote pilot or RPA observer maintains direct unaided visual contact with the remotely piloted aircraft.",
    tag: "operation",
  },
];

const TAG_META: Record<Definition["tag"], { label: string; color: string }> = {
  airspace:  { label: "Airspace",   color: "#06b6d4" },
  aircraft:  { label: "Aircraft",   color: "#a78bfa" },
  operation: { label: "Operation",  color: "#34d399" },
  person:    { label: "Person",     color: "#fbbf24" },
};

const ALL_TAGS = ["airspace", "aircraft", "operation", "person"] as Definition["tag"][];

export default function Part1Page() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<Definition["tag"] | "all">("all");

  const filtered = DEFINITIONS.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      d.term.toLowerCase().includes(q) ||
      (d.abbr?.toLowerCase().includes(q) ?? false) ||
      d.body.toLowerCase().includes(q);
    const matchesTag = activeTag === "all" || d.tag === activeTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ fontFamily: SYSTEM_FONT, background: "#0f0f0f" }}
    >
      {/* Header */}
      <div
        className="shrink-0 px-6 pt-6 pb-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/30 mb-3">
          <Link href="/ops/regs" className="hover:text-white/60 transition-colors">
            PCAR / RPAS Regulations
          </Link>
          <span>/</span>
          <span className="text-white/55">Part 1</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
              >
                PCAR Part 1
              </span>
            </div>
            <h1 className="text-[18px] font-bold text-white leading-snug">
              General Policies, Procedures &amp; Definitions
            </h1>
            <p className="text-[12px] text-white/35 mt-1">
              Philippine Civil Aviation Regulations · RPAS Provisions · Appendix A — Definitions
            </p>
          </div>

          <Link
            href="/ops/regs"
            className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-white/70 transition-colors shrink-0 mt-1"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 9L4.5 6l3-3" />
            </svg>
            Back to Regulations
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div
        className="shrink-0 flex items-center gap-3 px-6 py-3 flex-wrap"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25"
            width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="5" cy="5" r="3.5" />
            <path d="M9 9l2 2" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search definitions…"
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-[12px] text-white placeholder:text-white/25 outline-none focus:border-purple-400/30 transition-colors"
          />
        </div>

        {/* Tag filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTag("all")}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: activeTag === "all" ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTag === "all" ? "#fff" : "rgba(255,255,255,0.35)",
              border: activeTag === "all" ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
            }}
          >
            All ({DEFINITIONS.length})
          </button>
          {ALL_TAGS.map((tag) => {
            const { label, color } = TAG_META[tag];
            const count = DEFINITIONS.filter((d) => d.tag === tag).length;
            const active = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(active ? "all" : tag)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: active ? `${color}18` : "transparent",
                  color: active ? color : "rgba(255,255,255,0.35)",
                  border: active ? `1px solid ${color}35` : "1px solid transparent",
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Definition list */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-[13px]">
            No definitions match your search.
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {filtered.map((def, i) => {
              const { color } = TAG_META[def.tag];
              const { label } = TAG_META[def.tag];
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h2 className="text-[14px] font-semibold text-white leading-snug">
                        {def.term}
                      </h2>
                      {def.abbr && (
                        <span
                          className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: `${color}15`,
                            color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {def.abbr}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: `${color}12`,
                        color,
                        border: `1px solid ${color}25`,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <p className="text-[13px] text-white/65 leading-relaxed">{def.body}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer citation */}
        <div className="mt-8 pt-5 max-w-3xl" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[11px] text-white/20 leading-relaxed">
            Source: Philippine Civil Aviation Regulations (PCAR) Part 1 — General Policies, Procedures, and Definitions · Appendix A · Civil Aviation Authority of the Philippines (CAAP) · Republic Act 9497
          </p>
        </div>
      </div>
    </div>
  );
}
