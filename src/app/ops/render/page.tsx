"use client";

import { SYSTEM_FONT } from "@/lib/ops";

const RENDER_PRESETS = [
  {
    key: "social-reel",
    label: "Social Reel",
    desc: "9:16 vertical, 30s, music + text overlays",
    icon: "▶",
    status: "ready",
  },
  {
    key: "client-hd",
    label: "Client HD",
    desc: "1080p horizontal, color graded, branded",
    icon: "◈",
    status: "ready",
  },
  {
    key: "client-4k",
    label: "Client 4K",
    desc: "2160p master, CRF 16, slow preset",
    icon: "◇",
    status: "ready",
  },
  {
    key: "timelapse",
    label: "Timelapse",
    desc: "Frame sequence → video, 24fps, graded",
    icon: "◷",
    status: "coming",
  },
  {
    key: "before-after",
    label: "Before / After",
    desc: "Split-screen original vs graded comparison",
    icon: "◫",
    status: "coming",
  },
];

export default function RenderPage() {
  return (
    <div
      className="h-full overflow-y-auto"
      style={{ fontFamily: SYSTEM_FONT }}
    >
      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="mb-6">
          <h1 className="text-[17px] font-semibold text-white">Render</h1>
          <p className="text-[12px] text-white/40 mt-0.5">
            Video render pipeline — ffmpeg presets for client delivery
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {RENDER_PRESETS.map((p) => (
            <div
              key={p.key}
              className={`p-4 rounded-lg border transition-all ${
                p.status === "ready"
                  ? "border-white/[0.08] bg-white/[0.02] hover:border-white/20 cursor-pointer"
                  : "border-white/[0.04] bg-white/[0.01] opacity-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[14px]">{p.icon}</span>
                <span className="text-[13px] font-medium text-white">
                  {p.label}
                </span>
                {p.status === "coming" && (
                  <span className="text-[9px] bg-white/[0.06] text-white/30 px-1.5 py-0.5 rounded-full ml-auto">
                    Coming
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/40">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.06]">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">
            Pipeline
          </p>
          <div className="flex items-center gap-3 text-[12px] text-white/50">
            <span className="bg-white/[0.06] px-2.5 py-1 rounded">
              RAW/DNG
            </span>
            <span className="text-white/20">→</span>
            <span className="bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded">
              Lightroom
            </span>
            <span className="text-white/20">→</span>
            <span className="bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded">
              Grade Studio
            </span>
            <span className="text-white/20">→</span>
            <span className="bg-white/[0.06] px-2.5 py-1 rounded">
              ffmpeg Render
            </span>
            <span className="text-white/20">→</span>
            <span className="bg-green-500/10 text-green-400 px-2.5 py-1 rounded">
              Client Delivery
            </span>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400/60" />
          <span className="text-[10px] text-white/20">
            Render controls coming — currently use `panchi render` CLI
          </span>
        </div>
      </div>
    </div>
  );
}
