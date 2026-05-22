"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";
import {
  GRADES,
  gradeToCSS,
  gradeTempColor,
  type GradeDefinition,
  type GradeAnalysis,
} from "@/lib/studio";
import {
  PROCESSING_PRESETS,
  SOCIAL_CROPS,
  buildVideoFilterChain,
  type SocialCropKey,
} from "@/lib/presets";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "presets" | "process" | "grade";
type ProcessSub = "single" | "batch" | "social";
type GradeView = "preview" | "editor" | "analyze";
type MediaKind = "image" | "video";

interface ProcState {
  status: "idle" | "loading-ffmpeg" | "processing" | "done" | "error";
  progress: string;
  progressPct: number;
  resultUrl: string | null;
  resultFilename: string | null;
  timeMs: number;
  outputSize: number;
}

const IDLE: ProcState = {
  status: "idle", progress: "", progressPct: 0,
  resultUrl: null, resultFilename: null, timeMs: 0, outputSize: 0,
};

// ── Constants ─────────────────────────────────────────────────────────────────

const VIDEO_EXTS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".mts", ".m4v", ".3gp"];
const VIDEO_MIME = ["video/mp4", "video/quicktime", "video/avi", "video/x-msvideo",
  "video/x-matroska", "video/webm", "video/3gpp"];

const CAT_LABELS: Record<string, string> = {
  drone: "Drone", landscape: "Landscape", architectural: "Architectural",
  film: "Film Sims", custom: "Custom",
};
const CAT_ORDER = ["drone", "landscape", "architectural", "film", "custom"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectKind(file: File): MediaKind {
  if (VIDEO_MIME.includes(file.type)) return "video";
  const lower = file.name.toLowerCase();
  return VIDEO_EXTS.some((e) => lower.endsWith(e)) ? "video" : "image";
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Canvas helpers ────────────────────────────────────────────────────────────

function applyGradeToCanvas(
  src: HTMLImageElement,
  grade: { saturation: number; contrast: number; brightness: number },
  canvas: HTMLCanvasElement,
  overlay?: { text: string; position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"; fontSize: number },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = src.naturalWidth;
  canvas.height = src.naturalHeight;
  ctx.filter = `saturate(${grade.saturation}%) contrast(${grade.contrast}%) brightness(${grade.brightness}%)`;
  ctx.drawImage(src, 0, 0);
  ctx.filter = "none";
  if (overlay?.text) {
    const sz = overlay.fontSize * (canvas.width / 800);
    ctx.font = `600 ${sz}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = sz * 0.3;
    const w = ctx.measureText(overlay.text).width;
    const pad = sz * 0.8;
    let x = 0, y = 0;
    switch (overlay.position) {
      case "top-left":    x = pad;                   y = pad + sz;               break;
      case "top-right":   x = canvas.width - w - pad; y = pad + sz;               break;
      case "bottom-left": x = pad;                   y = canvas.height - pad;    break;
      case "bottom-right":x = canvas.width - w - pad; y = canvas.height - pad;   break;
      case "center":      x = (canvas.width - w) / 2; y = canvas.height / 2 + sz / 2; break;
    }
    ctx.fillText(overlay.text, x, y);
    ctx.shadowColor = "transparent";
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 6);
}

function renderClientOutput(
  src: HTMLImageElement,
  grade: { saturation: number; contrast: number; brightness: number },
  gradeName: string,
  analysis: GradeAnalysis | null,
  canvas: HTMLCanvasElement,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const imgW = 600;
  const imgH = Math.round((src.naturalHeight / src.naturalWidth) * imgW);
  const panelH = analysis ? 220 : 80;
  const totalW = imgW * 2 + 48;
  const totalH = imgH + panelH + 80;
  canvas.width = totalW; canvas.height = totalH;
  ctx.fillStyle = "#1c1c1e"; ctx.fillRect(0, 0, totalW, totalH);
  ctx.fillStyle = "#ffffff"; ctx.font = `700 22px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("WAEVPOINT", 24, 40);
  ctx.fillStyle = "#06b6d4"; ctx.font = `500 13px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("GRADE STUDIO", 168, 40);
  ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `400 11px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), totalW - 100, 40);
  ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(24, 52, totalW - 48, 1);
  const y0 = 64;
  ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = `500 11px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("ORIGINAL", 24, y0 + 12);
  ctx.fillStyle = "#06b6d4";
  ctx.fillText(gradeName.toUpperCase() + (analysis ? "  ★ AI RECOMMENDED" : ""), imgW + 40, y0 + 12);
  const imgY = y0 + 20;
  ctx.drawImage(src, 24, imgY, imgW, imgH);
  const off = document.createElement("canvas");
  off.width = src.naturalWidth; off.height = src.naturalHeight;
  const offCtx = off.getContext("2d")!;
  offCtx.filter = `saturate(${grade.saturation}%) contrast(${grade.contrast}%) brightness(${grade.brightness}%)`;
  offCtx.drawImage(src, 0, 0);
  ctx.drawImage(off, imgW + 40, imgY, imgW, imgH);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.strokeRect(24, imgY, imgW, imgH);
  ctx.strokeStyle = "rgba(6,182,212,0.3)";
  ctx.strokeRect(imgW + 40, imgY, imgW, imgH);
  const infoY = imgY + imgH + 16;
  if (analysis) {
    const chars = Object.entries(analysis.characteristics);
    const charW = (totalW - 48) / chars.length;
    chars.forEach(([key, value], i) => {
      const cx = 24 + i * charW;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, cx, infoY, charW - 8, 40, 6); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `400 9px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(key.toUpperCase(), cx + 8, infoY + 14);
      ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.font = `500 12px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(String(value), cx + 8, infoY + 30);
    });
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = `400 11px -apple-system, BlinkMacSystemFont, sans-serif`;
    const reasonLines = wrapText(ctx, analysis.reasoning, totalW - 48);
    reasonLines.forEach((line, i) => ctx.fillText(line, 24, infoY + 64 + i * 16));
    const rankY = infoY + 64 + reasonLines.length * 16 + 12;
    analysis.gradeRankings.slice(0, 5).forEach((rank, i) => {
      const ry = rankY + i * 20;
      const isTop = rank.grade === analysis.recommended;
      ctx.fillStyle = isTop ? "#06b6d4" : "rgba(255,255,255,0.5)";
      ctx.font = `${isTop ? "600" : "400"} 11px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(rank.grade, 24, ry);
      const bx = 140, bw = 200;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, bx, ry - 8, bw, 10, 3); ctx.fill();
      ctx.fillStyle = isTop ? "#06b6d4" : "rgba(255,255,255,0.15)";
      roundRect(ctx, bx, ry - 8, bw * rank.score / 10, 10, 3); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`${rank.score}/10`, bx + bw + 8, ry);
      ctx.fillText(rank.note, bx + bw + 50, ry);
    });
  }
  ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(24, totalH - 28, totalW - 48, 1);
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = `400 10px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("waevpoint.quest  |  AI-powered drone color grading", 24, totalH - 10);
}

function dlCanvas(canvas: HTMLCanvasElement, filename: string) {
  const a = document.createElement("a");
  a.download = filename; a.href = canvas.toDataURL("image/png"); a.click();
}

// ── FFmpeg singleton ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ffmpegSingleton: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ffmpegLoading: Promise<any> | null = null;

async function getFFmpeg(onProgress: (pct: number, msg: string) => void) {
  if (ffmpegSingleton) return ffmpegSingleton;
  if (!ffmpegLoading) {
    ffmpegLoading = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);
      const ff = new FFmpeg();
      ff.on("log", ({ message }: { message: string }) => {
        const m = message.match(/time=(\S+)/);
        if (m) onProgress(-1, `Encoding… ${m[1]}`);
      });
      ff.on("progress", ({ progress }: { progress: number }) => {
        onProgress(Math.round(progress * 100), `Encoding… ${Math.round(progress * 100)}%`);
      });
      const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ff.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegSingleton = ff;
      return ff;
    })();
  }
  return ffmpegLoading;
}

async function processVideoFile(
  file: File,
  presetKey: string,
  quality: number,
  cropKey: string,
  onProgress: (pct: number, msg: string) => void,
): Promise<{ data: Uint8Array; filename: string; timeMs: number }> {
  const ff = await getFFmpeg(onProgress);
  const { fetchFile } = await import("@ffmpeg/util");
  const preset = PROCESSING_PRESETS[presetKey];
  if (!preset) throw new Error(`Unknown preset: ${presetKey}`);
  const crop = cropKey && cropKey in SOCIAL_CROPS ? SOCIAL_CROPS[cropKey as SocialCropKey] : null;
  const vf = buildVideoFilterChain(preset.settings, crop?.width, crop?.height);
  const inputName = "input_" + Date.now() + ".mp4";
  const outputName = "output_" + Date.now() + ".mp4";
  onProgress(0, "Writing file…");
  await ff.writeFile(inputName, await fetchFile(file));
  const crf = Math.round(54 - (quality / 100) * 36);
  const args = ["-i", inputName];
  if (vf) args.push("-vf", vf);
  args.push("-c:v", "libx264", "-crf", String(crf), "-preset", "fast", "-c:a", "copy", "-movflags", "+faststart", outputName);
  const start = Date.now();
  await ff.exec(args);
  const timeMs = Date.now() - start;
  const data = (await ff.readFile(outputName)) as Uint8Array;
  await ff.deleteFile(inputName).catch(() => {});
  await ff.deleteFile(outputName).catch(() => {});
  const base = file.name.replace(/\.[^.]+$/, "");
  const suffix = crop ? `_${cropKey}` : "";
  return { data, filename: `${base}_${presetKey}${suffix}.mp4`, timeMs };
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/50 w-20 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 accent-cyan-400 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
      />
      <span className="text-[11px] text-white/60 font-mono w-12 text-right">
        {value > 0 && unit !== "x" ? "+" : ""}{value}{unit ?? ""}
      </span>
    </div>
  );
}

function GradeCard({ name, grade, selected, onSelect }: {
  name: string; grade: GradeDefinition; selected: boolean; onSelect: () => void;
}) {
  const tc = gradeTempColor(grade.color_temp);
  return (
    <button onClick={onSelect}
      className={`text-left p-3 rounded-lg border transition-all ${
        selected ? "border-cyan-400/60 bg-cyan-400/[0.06]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tc }} />
        <span className="text-[13px] font-medium text-white truncate">{grade.label}</span>
        {grade.lut_file && (
          <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full ml-auto shrink-0">LUT</span>
        )}
      </div>
      <p className="text-[11px] text-white/40 leading-snug mb-2">{grade.description}</p>
      <div className="flex gap-2 text-[10px] text-white/30 font-mono">
        <span>sat:{grade.saturation_adjust > 0 ? "+" : ""}{grade.saturation_adjust}</span>
        <span>con:{grade.contrast_adjust}</span>
        <span>bri:{grade.brightness_adjust > 0 ? "+" : ""}{grade.brightness_adjust}</span>
      </div>
    </button>
  );
}

// ── Presets Tab ───────────────────────────────────────────────────────────────

const ALL_FILTER_CATS = ["all", ...CAT_ORDER, "grades"] as const;

function PresetsTab({
  selectedPreset,
  selectedGrade,
  onProcess,
  onGrade,
}: {
  selectedPreset: string;
  selectedGrade: string | null;
  onProcess: (key: string) => void;
  onGrade: (key: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");

  const q = search.toLowerCase();

  const processEntries = Object.entries(PROCESSING_PRESETS).filter(([, p]) => {
    if (catFilter === "grades") return false;
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (q) return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return true;
  });

  const gradeEntries = Object.entries(GRADES).filter(([, g]) => {
    if (catFilter !== "all" && catFilter !== "grades") return false;
    if (q) return g.label.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
    return true;
  });

  const groupedProcess = CAT_ORDER.map((cat) => ({
    cat,
    label: CAT_LABELS[cat] ?? cat,
    entries: processEntries.filter(([, p]) => p.category === cat),
  })).filter((g) => g.entries.length > 0);

  const empty = processEntries.length === 0 && gradeEntries.length === 0;

  return (
    <div className="space-y-5">
      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search presets…"
          className="w-52 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white outline-none focus:border-cyan-400/40 placeholder:text-white/20"
        />
        <div className="flex flex-wrap gap-1">
          {ALL_FILTER_CATS.map((cat) => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[10px] border transition-colors ${
                catFilter === cat
                  ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                  : "border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/60"
              }`}>
              {cat === "all" ? "All" : cat === "grades" ? "Grade Styles" : CAT_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Processing presets by category */}
      {groupedProcess.map(({ cat, label, entries }) => (
        <div key={cat}>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">{label}</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
            {entries.map(([key, p]) => (
              <div key={key}
                className={`p-3 rounded-lg border transition-all ${
                  selectedPreset === key
                    ? "border-cyan-400/40 bg-cyan-400/[0.04]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]"
                }`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[12px] font-medium text-white leading-tight">{p.label}</span>
                  <span className="text-[9px] bg-white/[0.06] text-white/30 px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">{p.category}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-snug mb-2.5">{p.description}</p>
                <div className="flex gap-2 text-[10px] text-white/25 font-mono mb-2.5">
                  <span>bri:{p.settings.brightness.toFixed(2)}</span>
                  <span>sat:{p.settings.saturation.toFixed(2)}</span>
                  <span>con:{p.settings.contrast.toFixed(2)}</span>
                </div>
                <button onClick={() => onProcess(key)}
                  className="w-full py-1.5 rounded-md text-[11px] border border-cyan-400/25 text-cyan-400 hover:bg-cyan-400/10 transition-colors">
                  Process →
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Grade styles */}
      {gradeEntries.length > 0 && (
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Grade Styles</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
            {gradeEntries.map(([key, g]) => {
              const tc = gradeTempColor(g.color_temp);
              return (
                <div key={key}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedGrade === key
                      ? "border-violet-400/40 bg-violet-400/[0.04]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]"
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tc }} />
                    <span className="text-[12px] font-medium text-white truncate">{g.label}</span>
                    {g.lut_file && <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full ml-auto shrink-0">LUT</span>}
                  </div>
                  <p className="text-[11px] text-white/40 leading-snug mb-2.5">{g.description}</p>
                  <div className="flex gap-2 text-[10px] text-white/25 font-mono mb-2.5">
                    <span>sat:{g.saturation_adjust > 0 ? "+" : ""}{g.saturation_adjust}</span>
                    <span>con:{g.contrast_adjust}</span>
                    <span>bri:{g.brightness_adjust > 0 ? "+" : ""}{g.brightness_adjust}</span>
                  </div>
                  <button onClick={() => onGrade(key)}
                    className="w-full py-1.5 rounded-md text-[11px] border border-violet-400/25 text-violet-400 hover:bg-violet-400/10 transition-colors">
                    Grade →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {empty && (
        <p className="text-center text-[12px] text-white/30 py-12">No presets match your search.</p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const { token } = useOps();
  const [tab, setTab] = useState<Tab>("presets");

  // ── Process state ──
  const [processSub, setProcessSub] = useState<ProcessSub>("single");
  const [selectedPreset, setSelectedPreset] = useState("drone-auto");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [quality, setQuality] = useState(92);
  const [mediaKind, setMediaKind] = useState<MediaKind>("image");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [proc, setProc] = useState<ProcState>(IDLE);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<Array<{ name: string; url: string; timeMs: number; size: number }>>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Grade state ──
  const [gradeView, setGradeView] = useState<GradeView>("preview");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GradeAnalysis | null>(null);
  const [visionDesc, setVisionDesc] = useState("");
  const [gradeError, setGradeError] = useState("");
  const [saturation, setSaturation] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [shadows, setShadows] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [overlayText, setOverlayText] = useState("");
  const [textPosition, setTextPosition] = useState<"top-left" | "top-right" | "bottom-left" | "bottom-right" | "center">("bottom-right");
  const [textSize, setTextSize] = useState(36);
  const [cropRatio, setCropRatio] = useState<"free" | "16:9" | "9:16" | "1:1">("free");
  const gradeFileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // ── Derived ──
  const isVideo = mediaKind === "video";
  const isBusy = proc.status === "loading-ffmpeg" || proc.status === "processing";
  const groupedPresets = CAT_ORDER.map((cat) => ({
    cat, label: CAT_LABELS[cat] ?? cat,
    presets: Object.entries(PROCESSING_PRESETS).filter(([, p]) => p.category === cat),
  })).filter((g) => g.presets.length > 0);
  const CROP_DEFS = Object.entries(SOCIAL_CROPS).map(([key, c]) => ({ key, ...c }));
  const gradeEntries = Object.entries(GRADES);
  const editorCSS: React.CSSProperties = {
    filter: `saturate(${saturation}%) contrast(${contrast}%) brightness(${brightness}%)`,
  };

  // ── Cross-tab navigation ──

  const loadGradeToEditor = useCallback((name: string) => {
    const g = GRADES[name];
    if (!g) return;
    setSaturation(100 + g.saturation_adjust);
    setContrast(Math.round(g.contrast_adjust * 100));
    setBrightness(100 + g.brightness_adjust * 5);
    setShadows(g.shadows_lift);
    setHighlights(g.highlights_pull);
    setSelectedGrade(name);
  }, []);

  const goProcess = useCallback((key: string) => {
    setSelectedPreset(key);
    setTab("process");
  }, []);

  const goGrade = useCallback((name: string) => {
    loadGradeToEditor(name);
    setGradeView("editor");
    setTab("grade");
  }, [loadGradeToEditor]);

  // ── Process handlers ──

  useEffect(() => { setProc(IDLE); }, [mediaFile]);

  const handleProcessFile = useCallback((file: File) => {
    setMediaKind(detectKind(file));
    setMediaFile(file);
    setMediaUrl(URL.createObjectURL(file));
  }, []);

  const processMedia = useCallback(async () => {
    if (!mediaFile) return;
    if (mediaKind === "video") {
      setProc({ ...IDLE, status: "loading-ffmpeg", progress: "Loading encoder…" });
      try {
        const { data, filename, timeMs } = await processVideoFile(
          mediaFile, selectedPreset, quality, selectedCrop,
          (pct, msg) => setProc((p) => ({ ...p, status: "processing", progress: msg, progressPct: pct >= 0 ? pct : p.progressPct })),
        );
        const blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
        setProc({ status: "done", progress: "", progressPct: 100, resultUrl: URL.createObjectURL(blob), resultFilename: filename, timeMs, outputSize: data.byteLength });
      } catch (err) {
        setProc({ ...IDLE, status: "error", progress: err instanceof Error ? err.message : "Processing failed" });
      }
      return;
    }
    setProc({ ...IDLE, status: "processing", progress: "Sending to server…" });
    const form = new FormData();
    form.append("file", mediaFile); form.append("preset", selectedPreset);
    form.append("format", format); form.append("quality", String(quality));
    if (selectedCrop) form.append("crop", selectedCrop);
    try {
      const res = await fetch("/api/studio/process", { method: "POST", headers: { "x-ops-token": token }, body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        setProc({ ...IDLE, status: "error", progress: (err as { error: string }).error });
        return;
      }
      const blob = await res.blob();
      const filename = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? `processed.${format}`;
      setProc({
        status: "done", progress: "", progressPct: 100,
        resultUrl: URL.createObjectURL(blob), resultFilename: filename,
        timeMs: parseInt(res.headers.get("X-Processing-Time") ?? "0", 10),
        outputSize: parseInt(res.headers.get("X-Output-Size") ?? "0", 10),
      });
    } catch (err) {
      setProc({ ...IDLE, status: "error", progress: err instanceof Error ? err.message : "Processing failed" });
    }
  }, [mediaFile, mediaKind, selectedPreset, format, quality, selectedCrop, token]);

  const downloadResult = useCallback(() => {
    if (!proc.resultUrl || !proc.resultFilename) return;
    const a = document.createElement("a"); a.href = proc.resultUrl; a.download = proc.resultFilename; a.click();
  }, [proc]);

  const processBatch = useCallback(async () => {
    if (!batchFiles.length) return;
    setBatchProcessing(true); setBatchResults([]); setBatchProgress({ current: 0, total: batchFiles.length });
    const results: typeof batchResults = [];
    for (let i = 0; i < batchFiles.length; i++) {
      setBatchProgress({ current: i + 1, total: batchFiles.length });
      const file = batchFiles[i];
      if (detectKind(file) === "video") {
        try {
          const { data, filename, timeMs } = await processVideoFile(file, selectedPreset, quality, selectedCrop, () => {});
          results.push({ name: filename, url: URL.createObjectURL(new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" })), timeMs, size: data.byteLength });
        } catch { /* skip failed */ }
      } else {
        const form = new FormData();
        form.append("file", file); form.append("preset", selectedPreset);
        form.append("format", format); form.append("quality", String(quality));
        if (selectedCrop) form.append("crop", selectedCrop);
        try {
          const res = await fetch("/api/studio/process", { method: "POST", headers: { "x-ops-token": token }, body: form });
          if (res.ok) results.push({
            name: file.name.replace(/\.[^.]+$/, `_${selectedPreset}.${format}`),
            url: URL.createObjectURL(await res.blob()),
            timeMs: parseInt(res.headers.get("X-Processing-Time") ?? "0", 10),
            size: parseInt(res.headers.get("X-Output-Size") ?? "0", 10),
          });
        } catch { /* skip failed */ }
      }
    }
    setBatchResults(results); setBatchProcessing(false);
  }, [batchFiles, selectedPreset, format, quality, selectedCrop, token]);

  const downloadAllBatch = useCallback(() => {
    batchResults.forEach((r) => { const a = document.createElement("a"); a.href = r.url; a.download = r.name; a.click(); });
  }, [batchResults]);

  // ── Grade handlers ──

  const handleGradeFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setGradeError("Upload a frame image (JPG/PNG)"); return; }
    setGradeError(""); setAnalysis(null);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImageUrl(url); setImageB64(url.split(",")[1]);
      const img = new Image();
      img.onload = () => { imgRef.current = img; };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, []);

  const resetEditor = useCallback(() => {
    setSaturation(100); setContrast(100); setBrightness(100);
    setShadows(0); setHighlights(0); setOverlayText(""); setSelectedGrade(null);
  }, []);

  const exportFrame = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    applyGradeToCanvas(imgRef.current, { saturation, contrast, brightness }, canvasRef.current,
      overlayText ? { text: overlayText, position: textPosition, fontSize: textSize } : undefined);
    dlCanvas(canvasRef.current, `waevpoint_graded_${Date.now()}.png`);
  }, [saturation, contrast, brightness, overlayText, textPosition, textSize]);

  const exportClientOutput = useCallback(() => {
    if (!imgRef.current || !outputCanvasRef.current) return;
    renderClientOutput(imgRef.current, { saturation, contrast, brightness }, selectedGrade ?? "custom", analysis, outputCanvasRef.current);
    dlCanvas(outputCanvasRef.current, `waevpoint_client_${selectedGrade ?? "custom"}_${Date.now()}.png`);
  }, [saturation, contrast, brightness, selectedGrade, analysis]);

  const runAnalysis = useCallback(async () => {
    if (!imageB64) return;
    setAnalyzing(true); setGradeError(""); setAnalysis(null);
    try {
      const res = await fetch("/api/studio/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ops-token": token },
        body: JSON.stringify({ image: imageB64 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        setGradeError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as { analysis: GradeAnalysis; visionDescription: string };
      setAnalysis(data.analysis); setVisionDesc(data.visionDescription);
      if (data.analysis.recommended && GRADES[data.analysis.recommended]) loadGradeToEditor(data.analysis.recommended);
      setGradeView("analyze");
    } catch (err) {
      setGradeError(err instanceof Error ? err.message : "Analysis failed");
    } finally { setAnalyzing(false); }
  }, [imageB64, token, loadGradeToEditor]);

  useEffect(() => {
    if (selectedGrade && imageUrl && gradeView === "preview") loadGradeToEditor(selectedGrade);
  }, [selectedGrade, imageUrl, gradeView, loadGradeToEditor]);

  // ── Upload zones ──

  const GradeUploadZone = ({ compact }: { compact?: boolean }) => (
    <div
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleGradeFile(f); }}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => gradeFileRef.current?.click()}
      className={`border-2 border-dashed border-white/[0.1] rounded-xl text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors ${compact ? "p-4" : "p-8"}`}
    >
      <input ref={gradeFileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGradeFile(f); }} />
      <p className="text-[12px] text-white/50">{imageUrl ? "Drop another frame to replace" : "Drop a frame here or click to upload"}</p>
      {!compact && <p className="text-[11px] text-white/25 mt-1">JPG, PNG — extract a frame from your footage</p>}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: SYSTEM_FONT }}>
      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[17px] font-semibold text-white">Studio</h1>
            <p className="text-[12px] text-white/40 mt-0.5">Color presets, processing & grading</p>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
            {(["presets", "process", "grade"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-[12px] transition-colors ${tab === t ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/60"}`}>
                {t === "presets" ? "Presets" : t === "process" ? "Process" : "Grade"}
              </button>
            ))}
          </div>
        </div>

        {/* Hidden export canvases */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={outputCanvasRef} className="hidden" />

        {/* ── Presets tab ───────────────────────────────────────────────────── */}
        {tab === "presets" && (
          <PresetsTab
            selectedPreset={selectedPreset}
            selectedGrade={selectedGrade}
            onProcess={goProcess}
            onGrade={goGrade}
          />
        )}

        {/* ── Process tab ───────────────────────────────────────────────────── */}
        {tab === "process" && (
          <div className="space-y-4">

            {/* Sub-tab + settings row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-0.5 bg-white/[0.03] rounded-lg p-0.5">
                {(["single", "batch", "social"] as ProcessSub[]).map((s) => (
                  <button key={s} onClick={() => setProcessSub(s)}
                    className={`px-3 py-1.5 rounded-md text-[11px] transition-colors ${processSub === s ? "bg-white/[0.09] text-white" : "text-white/40 hover:text-white/60"}`}>
                    {s === "single" ? "Single" : s === "batch" ? "Batch" : "Social Crops"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {!isVideo && (
                  <div className="flex gap-1">
                    {(["jpg", "png"] as const).map((f) => (
                      <button key={f} onClick={() => setFormat(f)}
                        className={`px-2 py-1 rounded text-[10px] border transition-colors ${format === f ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400" : "border-white/[0.08] text-white/40"}`}>
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/30">Q</span>
                  <input type="range" min={60} max={100} value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                    className="w-16 h-1 accent-cyan-400 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
                  />
                  <span className="text-[11px] text-white/50 font-mono w-5">{quality}</span>
                </div>
                {processSub !== "social" && (
                  <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 text-[11px] text-white outline-none">
                    <option value="">No crop</option>
                    {CROP_DEFS.map((c) => (
                      <option key={c.key} value={c.key}>{c.label} ({c.width}×{c.height})</option>
                    ))}
                  </select>
                )}
                {isVideo && (
                  <span className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-400/20 px-2 py-1 rounded-lg">▶ video · browser</span>
                )}
              </div>
            </div>

            {/* Preset selector */}
            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-white/40 uppercase tracking-wider">
                  Preset — <span className="text-white/60">{PROCESSING_PRESETS[selectedPreset]?.label ?? selectedPreset}</span>
                </p>
                <button onClick={() => setTab("presets")} className="text-[10px] text-cyan-400/60 hover:text-cyan-400 transition-colors">
                  Browse all →
                </button>
              </div>
              <div className="space-y-1.5">
                {groupedPresets.map((group) => (
                  <div key={group.cat} className="flex items-start gap-2">
                    <span className="text-[9px] text-white/25 uppercase tracking-widest w-20 shrink-0 pt-1.5">{group.label}</span>
                    <div className="flex flex-wrap gap-1">
                      {group.presets.map(([key, p]) => (
                        <button key={key} onClick={() => setSelectedPreset(key)} title={p.description}
                          className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                            selectedPreset === key ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400" : "border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/60"
                          }`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Single ── */}
            {processSub === "single" && (
              <div className="space-y-4">
                <div
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleProcessFile(f); }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/[0.1] rounded-xl p-7 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors"
                >
                  <input ref={fileRef} type="file"
                    accept="image/*,.dng,.cr2,.nef,.arw,.orf,.rw2,video/*,.mp4,.mov,.avi,.mkv,.webm,.mts,.m4v"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProcessFile(f); }}
                  />
                  <p className="text-[13px] text-white/50">{mediaUrl ? "Drop another file to replace" : "Drop an image or video here"}</p>
                  <p className="text-[11px] text-white/25 mt-1">DNG, CR2, NEF, ARW, JPG, PNG · MP4, MOV, MTS, MKV</p>
                </div>

                {mediaUrl && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5">Original</p>
                        <div className="bg-black/40 rounded-xl overflow-hidden border border-white/[0.06]">
                          {isVideo
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            ? <video src={mediaUrl} controls className="w-full max-h-64 object-contain" />
                            // eslint-disable-next-line @next/next/no-img-element
                            : <img src={mediaUrl} alt="Original" className="w-full" />
                          }
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[11px] text-white/40 uppercase tracking-wider">
                            {proc.status === "done" ? `Done — ${selectedPreset}` : "Output"}
                          </p>
                          {proc.status === "done" && (
                            <p className="text-[10px] text-cyan-400/60">{proc.timeMs}ms · {fmtSize(proc.outputSize)}</p>
                          )}
                        </div>
                        <div className="bg-black/40 rounded-xl overflow-hidden border border-white/[0.06] min-h-[160px] flex items-center justify-center">
                          {proc.status === "idle" && <p className="text-[12px] text-white/20">Select preset and process</p>}
                          {(proc.status === "loading-ffmpeg" || proc.status === "processing") && (
                            <div className="text-center w-full px-6">
                              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
                              <p className="text-[12px] text-white/40 mb-2">{proc.progress || "Processing…"}</p>
                              {proc.progressPct > 0 && (
                                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${proc.progressPct}%` }} />
                                </div>
                              )}
                            </div>
                          )}
                          {proc.status === "error" && <p className="text-[12px] text-red-400 px-4 text-center">{proc.progress}</p>}
                          {proc.status === "done" && proc.resultUrl && (
                            isVideo
                              // eslint-disable-next-line jsx-a11y/media-has-caption
                              ? <video src={proc.resultUrl} controls className="w-full max-h-64 object-contain" />
                              // eslint-disable-next-line @next/next/no-img-element
                              : <img src={proc.resultUrl} alt="Processed" className="w-full" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={processMedia} disabled={isBusy}
                        className={`flex-1 font-medium rounded-lg py-2.5 text-[13px] transition-colors ${isBusy ? "bg-white/[0.06] text-white/30 cursor-not-allowed" : "bg-cyan-500 text-black hover:bg-cyan-400"}`}>
                        {isBusy ? proc.progress || "Processing…" : isVideo ? "Process Video" : "Process Image"}
                      </button>
                      {proc.status === "done" && (
                        <button onClick={downloadResult}
                          className="px-6 bg-white/[0.06] text-white font-medium rounded-lg py-2.5 text-[13px] hover:bg-white/[0.1] transition-colors border border-white/[0.08]">
                          Download
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Batch ── */}
            {processSub === "batch" && (
              <div className="space-y-4">
                <div
                  onDrop={(e) => { e.preventDefault(); setBatchFiles((p) => [...p, ...Array.from(e.dataTransfer.files)]); }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => {
                    const inp = document.createElement("input");
                    inp.type = "file"; inp.multiple = true;
                    inp.accept = "image/*,.dng,.cr2,.nef,.arw,.orf,.rw2,video/*,.mp4,.mov,.avi,.mkv,.webm,.mts,.m4v";
                    inp.onchange = () => { if (inp.files) setBatchFiles((p) => [...p, ...Array.from(inp.files!)]); };
                    inp.click();
                  }}
                  className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors"
                >
                  <p className="text-[13px] text-white/50">Drop multiple images or videos</p>
                  <p className="text-[11px] text-white/25 mt-1">Images: server-side · Videos: in-browser ffmpeg (sequential)</p>
                </div>
                {batchFiles.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-white/60">
                        {batchFiles.length} files — {batchFiles.filter((f) => detectKind(f) === "video").length} video, {batchFiles.filter((f) => detectKind(f) === "image").length} image
                      </p>
                      <button onClick={() => { setBatchFiles([]); setBatchResults([]); }} className="text-[11px] text-white/30 hover:text-white/60">Clear</button>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {batchFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded px-3 py-1.5 border border-white/[0.04]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] text-white/30 shrink-0">{detectKind(f) === "video" ? "▶" : "▣"}</span>
                            <span className="text-[12px] text-white/60 truncate">{f.name}</span>
                          </div>
                          <span className="text-[10px] text-white/30 shrink-0 ml-2">{fmtSize(f.size)}</span>
                        </div>
                      ))}
                    </div>
                    {batchProcessing && (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shrink-0" />
                        <p className="text-[12px] text-white/40">Processing {batchProgress.current}/{batchProgress.total}…</p>
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }} />
                        </div>
                      </div>
                    )}
                    {batchResults.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-white/40 uppercase tracking-wider">Results</p>
                          <button onClick={downloadAllBatch} className="text-[11px] text-cyan-400 hover:text-cyan-300">Download all</button>
                        </div>
                        {batchResults.map((r, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded px-3 py-1.5 border border-white/[0.04]">
                            <span className="text-[12px] text-white/60 truncate">{r.name}</span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[10px] text-white/30">{r.timeMs}ms</span>
                              <span className="text-[10px] text-white/30">{fmtSize(r.size)}</span>
                              <a href={r.url} download={r.name} className="text-[10px] text-cyan-400 hover:text-cyan-300">↓</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={processBatch} disabled={batchProcessing}
                      className={`w-full font-medium rounded-lg py-2.5 text-[13px] transition-colors ${batchProcessing ? "bg-white/[0.06] text-white/30 cursor-not-allowed" : "bg-cyan-500 text-black hover:bg-cyan-400"}`}>
                      {batchProcessing ? `Processing ${batchProgress.current}/${batchProgress.total}…` : `Process ${batchFiles.length} files`}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── Social Crops ── */}
            {processSub === "social" && (
              <div className="space-y-4">
                {!mediaUrl && (
                  <div
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleProcessFile(f); }}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors"
                  >
                    <p className="text-[13px] text-white/50">Upload an image or video to generate social crops</p>
                  </div>
                )}
                {mediaUrl && (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-16 h-16 bg-black/40 rounded-lg overflow-hidden border border-white/[0.06] shrink-0">
                        {isVideo
                          // eslint-disable-next-line jsx-a11y/media-has-caption
                          ? <video src={mediaUrl} className="w-full h-full object-cover" />
                          // eslint-disable-next-line @next/next/no-img-element
                          : <img src={mediaUrl} alt="Source" className="w-full h-full object-cover" />
                        }
                      </div>
                      <div>
                        <p className="text-[13px] text-white/80">{mediaFile?.name}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">Preset: {PROCESSING_PRESETS[selectedPreset]?.label}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {CROP_DEFS.filter((c) => !isVideo || !c.key.startsWith("print")).map((c) => {
                        const aspect = c.width / c.height;
                        return (
                          <button key={c.key} onClick={() => setSelectedCrop(selectedCrop === c.key ? "" : c.key)}
                            className={`text-left p-3 rounded-lg border transition-all ${selectedCrop === c.key ? "border-cyan-400/60 bg-cyan-400/[0.06]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"}`}>
                            <div className="bg-white/[0.06] rounded mb-2 mx-auto" style={{ width: 120, height: Math.min(Math.round(120 / aspect), 80) }} />
                            <p className="text-[12px] text-white/70 font-medium">{c.label}</p>
                            <p className="text-[10px] text-white/30 font-mono">{c.width}×{c.height}</p>
                          </button>
                        );
                      })}
                    </div>
                    {selectedCrop && (
                      <button onClick={processMedia} disabled={isBusy}
                        className={`w-full font-medium rounded-lg py-2.5 text-[13px] transition-colors ${isBusy ? "bg-white/[0.06] text-white/30 cursor-not-allowed" : "bg-cyan-500 text-black hover:bg-cyan-400"}`}>
                        {isBusy ? proc.progress || "Processing…" : `Export ${CROP_DEFS.find((c) => c.key === selectedCrop)?.label} crop`}
                      </button>
                    )}
                    {proc.status === "done" && proc.resultUrl && (
                      <button onClick={downloadResult}
                        className="w-full bg-white/[0.06] text-white font-medium rounded-lg py-2.5 text-[13px] hover:bg-white/[0.1] transition-colors border border-white/[0.08]">
                        Download {proc.resultFilename}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Grade tab ─────────────────────────────────────────────────────── */}
        {tab === "grade" && (
          <div className="space-y-4">
            {/* Grade view sub-tabs */}
            <div className="flex gap-0.5 bg-white/[0.03] rounded-lg p-0.5 w-fit">
              {(["preview", "editor", "analyze"] as GradeView[]).map((v) => (
                <button key={v} onClick={() => setGradeView(v)}
                  className={`px-3 py-1.5 rounded-md text-[11px] transition-colors ${gradeView === v ? "bg-white/[0.09] text-white" : "text-white/40 hover:text-white/60"}`}>
                  {v === "preview" ? "Library" : v === "editor" ? "Editor" : "AI Analyze"}
                </button>
              ))}
            </div>

            {gradeError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <p className="text-[12px] text-red-400">{gradeError}</p>
              </div>
            )}

            {/* Library */}
            {gradeView === "preview" && (
              <div className="space-y-4">
                <GradeUploadZone />
                {imageUrl ? (
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3">All grades — click to edit</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Original" className="w-full rounded-lg border border-white/[0.08]" />
                        <p className="text-[11px] text-white/50 text-center">ORIGINAL</p>
                      </div>
                      {gradeEntries.map(([name, grade]) => (
                        <div key={name} className="space-y-1.5 cursor-pointer"
                          onClick={() => { loadGradeToEditor(name); setGradeView("editor"); }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt={name}
                            className="w-full rounded-lg border border-white/[0.08] hover:border-cyan-400/40 transition-colors"
                            style={gradeToCSS(grade)} />
                          <p className="text-[11px] text-white/50 text-center">{name.toUpperCase()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gradeEntries.map(([name, grade]) => (
                      <GradeCard key={name} name={name} grade={grade} selected={selectedGrade === name}
                        onSelect={() => setSelectedGrade(name)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Editor */}
            {gradeView === "editor" && (
              <div className="space-y-4">
                {!imageUrl && <GradeUploadZone />}
                {imageUrl && (
                  <div className="grid grid-cols-[1fr_280px] gap-5">
                    <div className="space-y-3">
                      <div className="relative bg-black/40 rounded-xl overflow-hidden border border-white/[0.06]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Editor preview" className="w-full"
                          style={{
                            ...editorCSS,
                            aspectRatio: cropRatio === "free" ? "auto" : cropRatio === "16:9" ? "16/9" : cropRatio === "9:16" ? "9/16" : "1/1",
                            objectFit: "cover",
                          }} />
                        {overlayText && (
                          <div className={`absolute text-white font-semibold drop-shadow-lg ${
                            textPosition === "top-left" ? "top-4 left-4" :
                            textPosition === "top-right" ? "top-4 right-4 text-right" :
                            textPosition === "bottom-left" ? "bottom-4 left-4" :
                            textPosition === "bottom-right" ? "bottom-4 right-4 text-right" :
                            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                          }`} style={{ fontSize: `${textSize * 0.6}px` }}>
                            {overlayText}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={exportFrame}
                          className="flex-1 bg-cyan-500 text-black font-medium rounded-lg py-2.5 text-[13px] hover:bg-cyan-400 transition-colors">
                          Export Frame
                        </button>
                        <button onClick={exportClientOutput}
                          className="flex-1 bg-white/[0.06] text-white font-medium rounded-lg py-2.5 text-[13px] hover:bg-white/[0.1] transition-colors border border-white/[0.08]">
                          Export Client Sheet
                        </button>
                        <button onClick={() => gradeFileRef.current?.click()}
                          className="px-4 bg-white/[0.04] text-white/60 rounded-lg py-2.5 text-[13px] hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
                          Replace
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Load Grade</p>
                        <div className="flex flex-wrap gap-1.5">
                          {gradeEntries.map(([name]) => (
                            <button key={name} onClick={() => loadGradeToEditor(name)}
                              className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                                selectedGrade === name ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400" : "border-white/[0.08] text-white/40 hover:border-white/20"
                              }`}>
                              {name}
                            </button>
                          ))}
                          <button onClick={resetEditor}
                            className="px-2 py-1 rounded text-[10px] border border-white/[0.08] text-white/30 hover:text-white/50 hover:border-white/20">
                            Reset
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Color</p>
                        <div className="space-y-2">
                          <Slider label="Saturation" value={saturation - 100} min={-30} max={30} step={1} onChange={(v) => setSaturation(100 + v)} />
                          <Slider label="Contrast" value={contrast - 100} min={-30} max={30} step={1} unit="%" onChange={(v) => setContrast(100 + v)} />
                          <Slider label="Brightness" value={brightness - 100} min={-30} max={30} step={1} unit="%" onChange={(v) => setBrightness(100 + v)} />
                          <Slider label="Shadows" value={shadows} min={0} max={25} step={1} onChange={(v) => setShadows(v)} />
                          <Slider label="Highlights" value={highlights} min={-25} max={0} step={1} onChange={(v) => setHighlights(v)} />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Crop</p>
                        <div className="flex gap-1.5">
                          {(["free", "16:9", "9:16", "1:1"] as const).map((r) => (
                            <button key={r} onClick={() => setCropRatio(r)}
                              className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${cropRatio === r ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400" : "border-white/[0.08] text-white/40 hover:border-white/20"}`}>
                              {r === "free" ? "Free" : r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Text Overlay</p>
                        <input type="text" value={overlayText} onChange={(e) => setOverlayText(e.target.value)}
                          placeholder="Client name, location…"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-2 text-[12px] text-white outline-none focus:border-cyan-400/40 mb-2"
                        />
                        <div className="flex gap-1.5 mb-2">
                          {(["top-left", "top-right", "center", "bottom-left", "bottom-right"] as const).map((pos) => (
                            <button key={pos} onClick={() => setTextPosition(pos)}
                              className={`px-1.5 py-1 rounded text-[9px] border transition-colors ${textPosition === pos ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400" : "border-white/[0.08] text-white/30 hover:border-white/20"}`}>
                              {pos.replace("-", " ")}
                            </button>
                          ))}
                        </div>
                        <Slider label="Size" value={textSize} min={16} max={72} step={2} unit="px" onChange={setTextSize} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Analyze */}
            {gradeView === "analyze" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1"><GradeUploadZone compact /></div>
                  <button onClick={runAnalysis} disabled={!imageB64 || analyzing}
                    className={`px-5 py-3 rounded-lg text-[13px] font-medium transition-colors shrink-0 ${!imageB64 || analyzing ? "bg-white/[0.06] text-white/30 cursor-not-allowed" : "bg-cyan-500 text-black hover:bg-cyan-400"}`}>
                    {analyzing ? "Analyzing…" : "Analyze with AI"}
                  </button>
                </div>
                {analyzing && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-[12px] text-white/40">Qwen VL analyzing frame…</p>
                      <p className="text-[11px] text-white/25 mt-1">Llama 3.3 recommending grade…</p>
                    </div>
                  </div>
                )}
                {analysis && imageUrl && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-white/40 mb-1.5 uppercase tracking-wider">Original</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Original" className="w-full rounded-lg border border-white/[0.08]" />
                      </div>
                      <div>
                        <p className="text-[11px] text-white/40 mb-1.5 uppercase tracking-wider">
                          {analysis.recommended.toUpperCase()} <span className="text-cyan-400">Recommended</span>
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt={analysis.recommended}
                          className="w-full rounded-lg border border-cyan-400/30"
                          style={GRADES[analysis.recommended] ? gradeToCSS(GRADES[analysis.recommended]) : {}} />
                      </div>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                      <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">AI Vision</p>
                      <p className="text-[12px] text-white/70 leading-relaxed">{visionDesc}</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(analysis.characteristics).map(([key, value]) => (
                        <div key={key} className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.06]">
                          <p className="text-[10px] text-white/30 uppercase">{key}</p>
                          <p className="text-[12px] text-white/80 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                      <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Recommendation</p>
                      <p className="text-[12px] text-white/70 leading-relaxed">{analysis.reasoning}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-white/40 uppercase tracking-wider">Grade Rankings</p>
                      {analysis.gradeRankings.map((rank) => {
                        const isTop = rank.grade === analysis.recommended;
                        return (
                          <div key={rank.grade}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${isTop ? "border-cyan-400/30 bg-cyan-400/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                            <span className={`text-[12px] font-medium w-28 shrink-0 ${isTop ? "text-cyan-400" : "text-white/70"}`}>{rank.grade}</span>
                            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isTop ? "bg-cyan-400" : "bg-white/20"}`} style={{ width: `${rank.score * 10}%` }} />
                            </div>
                            <span className="text-[11px] text-white/50 w-8 text-right">{rank.score}/10</span>
                            <span className="text-[11px] text-white/30 w-48 truncate">{rank.note}</span>
                          </div>
                        );
                      })}
                    </div>
                    {analysis.customSuggestion && (
                      <div className="bg-amber-500/[0.05] rounded-lg p-3 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] text-amber-400 uppercase tracking-wider">Custom Suggestion</span>
                          <span className="text-[13px] font-medium text-white">&ldquo;{analysis.customSuggestion.name}&rdquo;</span>
                        </div>
                        <p className="text-[12px] text-white/60 leading-relaxed mb-2">{analysis.customSuggestion.reasoning}</p>
                        <div className="flex gap-3 text-[10px] text-white/40 font-mono">
                          <span>sat:{analysis.customSuggestion.settings.saturation_adjust}</span>
                          <span>con:{analysis.customSuggestion.settings.contrast_adjust}</span>
                          <span>bri:{analysis.customSuggestion.settings.brightness_adjust}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => { if (analysis.recommended) { loadGradeToEditor(analysis.recommended); setGradeView("editor"); } }}
                        className="flex-1 bg-cyan-500 text-black font-medium rounded-lg py-2.5 text-[13px] hover:bg-cyan-400 transition-colors">
                        Edit with {analysis.recommended}
                      </button>
                      <button onClick={exportClientOutput}
                        className="flex-1 bg-white/[0.06] text-white font-medium rounded-lg py-2.5 text-[13px] hover:bg-white/[0.1] transition-colors border border-white/[0.08]">
                        Export Client Sheet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
          <span className="text-[10px] text-white/20">
            Images: sharp + libvips (server) · Videos: ffmpeg.wasm (browser) · Grade: CSS filters + AI
          </span>
        </div>
      </div>
    </div>
  );
}
