"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";
import {
  PROCESSING_PRESETS,
  SOCIAL_CROPS,
  buildVideoFilterChain,
  type SocialCropKey,
} from "@/lib/presets";

type Tab = "process" | "batch" | "social";
type MediaKind = "image" | "video";

interface PresetDef {
  key: string;
  label: string;
  description: string;
  category: string;
}

interface CropDef {
  key: string;
  label: string;
  width: number;
  height: number;
}

interface ProcessingState {
  status: "idle" | "loading-ffmpeg" | "processing" | "done" | "error";
  progress: string;
  progressPct: number;
  resultUrl: string | null;
  resultFilename: string | null;
  timeMs: number;
  outputSize: number;
}

const IDLE_STATE: ProcessingState = {
  status: "idle",
  progress: "",
  progressPct: 0,
  resultUrl: null,
  resultFilename: null,
  timeMs: 0,
  outputSize: 0,
};

const VIDEO_EXTS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".mts", ".m4v", ".3gp"];
const VIDEO_MIME = ["video/mp4", "video/quicktime", "video/avi", "video/x-msvideo",
  "video/x-matroska", "video/webm", "video/3gpp"];

function detectKind(file: File): MediaKind {
  if (VIDEO_MIME.includes(file.type)) return "video";
  const lower = file.name.toLowerCase();
  if (VIDEO_EXTS.some((e) => lower.endsWith(e))) return "video";
  return "image";
}

const CATEGORY_LABELS: Record<string, string> = {
  drone: "Drone",
  portrait: "Portrait",
  landscape: "Landscape",
  architectural: "Architectural",
  custom: "Custom",
};
const CATEGORY_ORDER = ["drone", "landscape", "architectural", "custom"];

const PRESET_DEFS: PresetDef[] = Object.entries(PROCESSING_PRESETS).map(([key, p]) => ({
  key,
  label: p.label,
  description: p.description,
  category: p.category,
}));

const CROP_DEFS: CropDef[] = Object.entries(SOCIAL_CROPS).map(([key, c]) => ({
  key,
  ...c,
}));

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ── FFmpeg loader (lazy, singleton) ──────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ffmpegSingleton: any = null;
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

// ── Video processing ──────────────────────────────────────────────────────────

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

  const crop = cropKey && cropKey in SOCIAL_CROPS
    ? SOCIAL_CROPS[cropKey as SocialCropKey]
    : null;

  const vf = buildVideoFilterChain(preset.settings, crop?.width, crop?.height);
  const inputName = "input_" + Date.now() + ".mp4";
  const outputName = "output_" + Date.now() + ".mp4";

  onProgress(0, "Writing file…");
  await ff.writeFile(inputName, await fetchFile(file));

  // CRF: quality 100→18, quality 60→36
  const crf = Math.round(54 - (quality / 100) * 36);

  const args = ["-i", inputName];
  if (vf) args.push("-vf", vf);
  args.push(
    "-c:v", "libx264",
    "-crf", String(crf),
    "-preset", "fast",
    "-c:a", "copy",
    "-movflags", "+faststart",
    outputName,
  );

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function LightroomPage() {
  const { token } = useOps();
  const [tab, setTab] = useState<Tab>("process");
  const [selectedPreset, setSelectedPreset] = useState("drone-auto");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [quality, setQuality] = useState(92);

  const [mediaKind, setMediaKind] = useState<MediaKind>("image");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [proc, setProc] = useState<ProcessingState>(IDLE_STATE);
  const fileRef = useRef<HTMLInputElement>(null);

  // Batch state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<
    Array<{ name: string; url: string; timeMs: number; size: number }>
  >([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Reset proc when file changes
  useEffect(() => {
    setProc(IDLE_STATE);
  }, [mediaFile]);

  const handleFile = useCallback((file: File) => {
    const kind = detectKind(file);
    setMediaKind(kind);
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaUrl(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // ── Process single file ──────────────────────────────────────────────────

  const processMedia = useCallback(async () => {
    if (!mediaFile) return;

    if (mediaKind === "video") {
      setProc({ ...IDLE_STATE, status: "loading-ffmpeg", progress: "Loading encoder…", progressPct: 0 });
      try {
        const { data, filename, timeMs } = await processVideoFile(
          mediaFile,
          selectedPreset,
          quality,
          selectedCrop,
          (pct, msg) => {
            setProc((p) => ({
              ...p,
              status: "processing",
              progress: msg,
              progressPct: pct >= 0 ? pct : p.progressPct,
            }));
          },
        );
        const blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        setProc({
          status: "done",
          progress: "",
          progressPct: 100,
          resultUrl: url,
          resultFilename: filename,
          timeMs,
          outputSize: data.byteLength,
        });
      } catch (err) {
        setProc({ ...IDLE_STATE, status: "error", progress: err instanceof Error ? err.message : "Processing failed" });
      }
      return;
    }

    // Image — server-side sharp
    setProc({ ...IDLE_STATE, status: "processing", progress: "Sending to server…", progressPct: 0 });
    const form = new FormData();
    form.append("file", mediaFile);
    form.append("preset", selectedPreset);
    form.append("format", format);
    form.append("quality", String(quality));
    if (selectedCrop) form.append("crop", selectedCrop);

    try {
      const res = await fetch("/api/studio/process", {
        method: "POST",
        headers: { "x-ops-token": token },
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        setProc({ ...IDLE_STATE, status: "error", progress: (err as { error: string }).error });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        `processed.${format}`;
      setProc({
        status: "done",
        progress: "",
        progressPct: 100,
        resultUrl: url,
        resultFilename: filename,
        timeMs: parseInt(res.headers.get("X-Processing-Time") ?? "0", 10),
        outputSize: parseInt(res.headers.get("X-Output-Size") ?? "0", 10),
      });
    } catch (err) {
      setProc({ ...IDLE_STATE, status: "error", progress: err instanceof Error ? err.message : "Processing failed" });
    }
  }, [mediaFile, mediaKind, selectedPreset, format, quality, selectedCrop, token]);

  const downloadResult = useCallback(() => {
    if (!proc.resultUrl || !proc.resultFilename) return;
    const a = document.createElement("a");
    a.href = proc.resultUrl;
    a.download = proc.resultFilename;
    a.click();
  }, [proc]);

  // ── Batch ────────────────────────────────────────────────────────────────

  const processBatch = useCallback(async () => {
    if (batchFiles.length === 0) return;
    setBatchProcessing(true);
    setBatchResults([]);
    setBatchProgress({ current: 0, total: batchFiles.length });

    const results: typeof batchResults = [];

    for (let i = 0; i < batchFiles.length; i++) {
      setBatchProgress({ current: i + 1, total: batchFiles.length });
      const file = batchFiles[i];
      const kind = detectKind(file);

      if (kind === "video") {
        try {
          const { data, filename, timeMs } = await processVideoFile(
            file, selectedPreset, quality, selectedCrop,
            () => {},
          );
          results.push({
            name: filename,
            url: URL.createObjectURL(new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" })),
            timeMs,
            size: data.byteLength,
          });
        } catch { /* skip */ }
      } else {
        const form = new FormData();
        form.append("file", file);
        form.append("preset", selectedPreset);
        form.append("format", format);
        form.append("quality", String(quality));
        if (selectedCrop) form.append("crop", selectedCrop);
        try {
          const res = await fetch("/api/studio/process", {
            method: "POST",
            headers: { "x-ops-token": token },
            body: form,
          });
          if (res.ok) {
            const blob = await res.blob();
            results.push({
              name: file.name.replace(/\.[^.]+$/, `_${selectedPreset}.${format}`),
              url: URL.createObjectURL(blob),
              timeMs: parseInt(res.headers.get("X-Processing-Time") ?? "0", 10),
              size: parseInt(res.headers.get("X-Output-Size") ?? "0", 10),
            });
          }
        } catch { /* skip */ }
      }
    }

    setBatchResults(results);
    setBatchProcessing(false);
  }, [batchFiles, selectedPreset, format, quality, selectedCrop, token]);

  const downloadAllBatch = useCallback(() => {
    batchResults.forEach((r) => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.name;
      a.click();
    });
  }, [batchResults]);

  // ── Grouped presets ──────────────────────────────────────────────────────

  const groupedPresets = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    presets: PRESET_DEFS.filter((p) => p.category === cat),
  })).filter((g) => g.presets.length > 0);

  const isVideo = mediaKind === "video";
  const isBusy = proc.status === "loading-ffmpeg" || proc.status === "processing";

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: SYSTEM_FONT }}>
      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[17px] font-semibold text-white">Lightroom</h1>
            <p className="text-[12px] text-white/40 mt-0.5">
              Images processed server-side · Videos processed in-browser via ffmpeg.wasm
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
            {(["process", "batch", "social"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                  tab === t ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                {t === "process" ? "Process" : t === "batch" ? "Batch" : "Social Crops"}
              </button>
            ))}
          </div>
        </div>

        {/* Preset selector */}
        <div className="mb-5">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Processing Preset</p>
          <div className="space-y-2">
            {groupedPresets.map((group) => (
              <div key={group.category}>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{group.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.presets.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPreset(p.key)}
                      title={p.description}
                      className={`px-2.5 py-1.5 rounded-md text-[11px] border transition-colors ${
                        selectedPreset === p.key
                          ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                          : "border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {PRESET_DEFS.find((p) => p.key === selectedPreset) && (
            <p className="text-[11px] text-white/30 mt-2">
              {PRESET_DEFS.find((p) => p.key === selectedPreset)!.description}
            </p>
          )}
        </div>

        {/* Settings row */}
        <div className="flex flex-wrap items-center gap-4 mb-5 pb-4 border-b border-white/[0.06]">
          {/* Format (images only) */}
          {!isVideo && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/40">Format</span>
              <div className="flex gap-1">
                {(["jpg", "png"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                      format === f
                        ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                        : "border-white/[0.08] text-white/40"
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/40">
              {isVideo ? "Video quality" : "Quality"}
            </span>
            <input
              type="range" min={60} max={100} value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-20 h-1 accent-cyan-400 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
            />
            <span className="text-[11px] text-white/60 font-mono w-6">{quality}</span>
          </div>

          {tab !== "social" && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/40">Crop</span>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 text-[11px] text-white outline-none"
              >
                <option value="">None</option>
                {CROP_DEFS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} ({c.width}×{c.height})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isVideo && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-400/20">
              <span className="text-[11px] text-violet-400">▶ Video</span>
              <span className="text-[10px] text-violet-400/60">· processed in browser</span>
            </div>
          )}
        </div>

        {/* ── Process tab ──────────────────────────────────────────────── */}
        {tab === "process" && (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.dng,.cr2,.nef,.arw,.orf,.rw2,video/*,.mp4,.mov,.avi,.mkv,.webm,.mts,.m4v"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <p className="text-[13px] text-white/50">
                {mediaUrl ? "Drop another file to replace" : "Drop an image or video here"}
              </p>
              <p className="text-[11px] text-white/25 mt-1">
                Images: DNG, CR2, NEF, ARW, JPG, PNG · Videos: MP4, MOV, MTS, MKV, AVI
              </p>
            </div>

            {/* Preview */}
            {mediaUrl && (
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">Original</p>
                    <p className="text-[10px] text-white/25">{mediaFile?.name}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl overflow-hidden border border-white/[0.06]">
                    {isVideo ? (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video src={mediaUrl} controls className="w-full max-h-64 object-contain" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl} alt="Original" className="w-full" />
                    )}
                  </div>
                </div>

                {/* Output */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      {proc.status === "done" ? `Processed — ${selectedPreset}` : "Output"}
                    </p>
                    {proc.status === "done" && (
                      <p className="text-[10px] text-cyan-400/60">
                        {proc.timeMs}ms · {formatSize(proc.outputSize)}
                      </p>
                    )}
                  </div>
                  <div className="bg-black/40 rounded-xl overflow-hidden border border-white/[0.06] min-h-[160px] flex items-center justify-center">
                    {(proc.status === "idle") && (
                      <p className="text-[12px] text-white/20">Select a preset and hit Process</p>
                    )}
                    {(proc.status === "loading-ffmpeg" || proc.status === "processing") && (
                      <div className="text-center w-full px-6">
                        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-[12px] text-white/40 mb-2">{proc.progress || "Processing…"}</p>
                        {proc.progressPct > 0 && (
                          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full transition-all"
                              style={{ width: `${proc.progressPct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {proc.status === "error" && (
                      <p className="text-[12px] text-red-400 px-4 text-center">{proc.progress}</p>
                    )}
                    {proc.status === "done" && proc.resultUrl && (
                      isVideo ? (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video src={proc.resultUrl} controls className="w-full max-h-64 object-contain" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={proc.resultUrl} alt="Processed" className="w-full" />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {mediaUrl && (
              <div className="flex gap-3">
                <button
                  onClick={processMedia}
                  disabled={isBusy}
                  className={`flex-1 font-medium rounded-lg py-2.5 text-[13px] transition-colors ${
                    isBusy
                      ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                      : "bg-cyan-500 text-black hover:bg-cyan-400"
                  }`}
                >
                  {isBusy ? proc.progress || "Processing…" : isVideo ? "Process Video" : "Process Image"}
                </button>
                {proc.status === "done" && (
                  <button
                    onClick={downloadResult}
                    className="px-6 bg-white/[0.06] text-white font-medium rounded-lg py-2.5 text-[13px] hover:bg-white/[0.1] transition-colors border border-white/[0.08]"
                  >
                    Download
                  </button>
                )}
              </div>
            )}

            {/* Video note */}
            {isVideo && proc.status === "idle" && (
              <p className="text-[11px] text-white/25 text-center">
                Video encoding runs entirely in your browser. Large files may take a few minutes.
              </p>
            )}
          </div>
        )}

        {/* ── Batch tab ─────────────────────────────────────────────────── */}
        {tab === "batch" && (
          <div className="space-y-4">
            <div
              onDrop={(e) => {
                e.preventDefault();
                setBatchFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => {
                const inp = document.createElement("input");
                inp.type = "file";
                inp.multiple = true;
                inp.accept = "image/*,.dng,.cr2,.nef,.arw,.orf,.rw2,video/*,.mp4,.mov,.avi,.mkv,.webm,.mts,.m4v";
                inp.onchange = () => {
                  if (inp.files) setBatchFiles((prev) => [...prev, ...Array.from(inp.files!)]);
                };
                inp.click();
              }}
              className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors"
            >
              <p className="text-[13px] text-white/50">Drop multiple images or videos</p>
              <p className="text-[11px] text-white/25 mt-1">
                Images processed server-side · Videos encoded in-browser (sequential)
              </p>
            </div>

            {batchFiles.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-white/60">
                    {batchFiles.length} file{batchFiles.length !== 1 ? "s" : ""} queued
                    {" · "}
                    {batchFiles.filter((f) => detectKind(f) === "video").length} video
                    {", "}
                    {batchFiles.filter((f) => detectKind(f) === "image").length} image
                  </p>
                  <button
                    onClick={() => { setBatchFiles([]); setBatchResults([]); }}
                    className="text-[11px] text-white/30 hover:text-white/60"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {batchFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded px-3 py-1.5 border border-white/[0.04]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-white/30 shrink-0">
                          {detectKind(f) === "video" ? "▶" : "▣"}
                        </span>
                        <span className="text-[12px] text-white/60 truncate">{f.name}</span>
                      </div>
                      <span className="text-[10px] text-white/30 shrink-0 ml-2">{formatSize(f.size)}</span>
                    </div>
                  ))}
                </div>

                {batchProcessing && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shrink-0" />
                    <p className="text-[12px] text-white/40">
                      Processing {batchProgress.current} of {batchProgress.total}…
                    </p>
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {batchResults.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-white/40 uppercase tracking-wider">Results</p>
                      <button onClick={downloadAllBatch} className="text-[11px] text-cyan-400 hover:text-cyan-300">
                        Download all
                      </button>
                    </div>
                    {batchResults.map((r, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded px-3 py-1.5 border border-white/[0.04]">
                        <span className="text-[12px] text-white/60 truncate">{r.name}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-white/30">{r.timeMs}ms</span>
                          <span className="text-[10px] text-white/30">{formatSize(r.size)}</span>
                          <a href={r.url} download={r.name} className="text-[10px] text-cyan-400 hover:text-cyan-300">↓</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={processBatch}
                  disabled={batchProcessing}
                  className={`w-full font-medium rounded-lg py-2.5 text-[13px] transition-colors ${
                    batchProcessing
                      ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                      : "bg-cyan-500 text-black hover:bg-cyan-400"
                  }`}
                >
                  {batchProcessing
                    ? `Processing ${batchProgress.current}/${batchProgress.total}…`
                    : `Process ${batchFiles.length} files`}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Social crops tab ──────────────────────────────────────────── */}
        {tab === "social" && (
          <div className="space-y-4">
            {!mediaUrl && (
              <div
                onDrop={handleDrop}
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
                    {isVideo ? (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video src={mediaUrl} className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl} alt="Source" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] text-white/80">{mediaFile?.name}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      Select a size · processed with {selectedPreset}
                      {isVideo ? " · video encoded in browser" : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CROP_DEFS.filter((c) => !isVideo || !c.key.startsWith("print")).map((c) => {
                    const aspect = c.width / c.height;
                    return (
                      <button
                        key={c.key}
                        onClick={() => setSelectedCrop(selectedCrop === c.key ? "" : c.key)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          selectedCrop === c.key
                            ? "border-cyan-400/60 bg-cyan-400/[0.06]"
                            : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <div
                          className="bg-white/[0.06] rounded mb-2 mx-auto"
                          style={{ width: 120, height: Math.min(Math.round(120 / aspect), 80) }}
                        />
                        <p className="text-[12px] text-white/70 font-medium">{c.label}</p>
                        <p className="text-[10px] text-white/30 font-mono">{c.width}×{c.height}</p>
                      </button>
                    );
                  })}
                </div>

                {selectedCrop && (
                  <button
                    onClick={processMedia}
                    disabled={isBusy}
                    className={`w-full font-medium rounded-lg py-2.5 text-[13px] transition-colors ${
                      isBusy
                        ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                        : "bg-cyan-500 text-black hover:bg-cyan-400"
                    }`}
                  >
                    {isBusy
                      ? proc.progress || "Processing…"
                      : `Export ${CROP_DEFS.find((c) => c.key === selectedCrop)?.label} crop`}
                  </button>
                )}

                {proc.status === "done" && proc.resultUrl && (
                  <button
                    onClick={downloadResult}
                    className="w-full bg-white/[0.06] text-white font-medium rounded-lg py-2.5 text-[13px] hover:bg-white/[0.1] transition-colors border border-white/[0.08]"
                  >
                    Download {proc.resultFilename}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer badge */}
        <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
          <span className="text-[10px] text-white/20">
            Images: sharp + libvips (server) · Videos: ffmpeg.wasm (browser) · No upload limit for video
          </span>
        </div>
      </div>
    </div>
  );
}
