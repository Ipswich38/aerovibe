"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

type Tab = "process" | "batch" | "social";

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
  status: "idle" | "processing" | "done" | "error";
  progress: string;
  resultUrl: string | null;
  resultFilename: string | null;
  timeMs: number;
  outputSize: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  drone: "Drone",
  portrait: "Portrait",
  landscape: "Landscape",
  architectural: "Architectural",
  custom: "Custom",
};

const CATEGORY_ORDER = ["drone", "landscape", "architectural", "custom"];

export default function LightroomPage() {
  const { token } = useOps();
  const [tab, setTab] = useState<Tab>("process");
  const [presets, setPresets] = useState<PresetDef[]>([]);
  const [crops, setCrops] = useState<CropDef[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("drone-auto");
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [quality, setQuality] = useState(92);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [proc, setProc] = useState<ProcessingState>({
    status: "idle",
    progress: "",
    resultUrl: null,
    resultFilename: null,
    timeMs: 0,
    outputSize: 0,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  // Batch state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<
    Array<{ name: string; url: string; timeMs: number; size: number }>
  >([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetch("/api/studio/process")
      .then((r) => r.json())
      .then((data: { presets: PresetDef[]; crops: CropDef[] }) => {
        setPresets(data.presets);
        setCrops(data.crops);
      })
      .catch(() => {});
  }, []);

  const handleFile = useCallback((file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setProc((p) => ({ ...p, status: "idle", resultUrl: null }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const processImage = useCallback(async () => {
    if (!imageFile) return;
    setProc({
      status: "processing",
      progress: "Sending to darktable...",
      resultUrl: null,
      resultFilename: null,
      timeMs: 0,
      outputSize: 0,
    });

    const form = new FormData();
    form.append("file", imageFile);
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
        setProc((p) => ({
          ...p,
          status: "error",
          progress: (err as { error: string }).error,
        }));
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        `processed.${format}`;
      const timeMs = parseInt(res.headers.get("X-Processing-Time") ?? "0", 10);
      const outputSize = parseInt(res.headers.get("X-Output-Size") ?? "0", 10);

      setProc({
        status: "done",
        progress: "",
        resultUrl: url,
        resultFilename: filename,
        timeMs,
        outputSize,
      });
    } catch (err) {
      setProc((p) => ({
        ...p,
        status: "error",
        progress: err instanceof Error ? err.message : "Processing failed",
      }));
    }
  }, [imageFile, selectedPreset, format, quality, selectedCrop, token]);

  const downloadResult = useCallback(() => {
    if (!proc.resultUrl || !proc.resultFilename) return;
    const a = document.createElement("a");
    a.href = proc.resultUrl;
    a.download = proc.resultFilename;
    a.click();
  }, [proc]);

  const processBatch = useCallback(async () => {
    if (batchFiles.length === 0) return;
    setBatchProcessing(true);
    setBatchResults([]);
    setBatchProgress({ current: 0, total: batchFiles.length });

    const results: typeof batchResults = [];

    for (let i = 0; i < batchFiles.length; i++) {
      setBatchProgress({ current: i + 1, total: batchFiles.length });
      const form = new FormData();
      form.append("file", batchFiles[i]);
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
            name: batchFiles[i].name,
            url: URL.createObjectURL(blob),
            timeMs: parseInt(res.headers.get("X-Processing-Time") ?? "0", 10),
            size: parseInt(res.headers.get("X-Output-Size") ?? "0", 10),
          });
        }
      } catch {
        // skip failed
      }
    }

    setBatchResults(results);
    setBatchProcessing(false);
  }, [batchFiles, selectedPreset, format, quality, selectedCrop, token]);

  const downloadAllBatch = useCallback(() => {
    batchResults.forEach((r) => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.name.replace(/\.[^.]+$/, `_${selectedPreset}.${format}`);
      a.click();
    });
  }, [batchResults, selectedPreset, format]);

  const groupedPresets = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    presets: presets.filter((p) => p.category === cat),
  })).filter((g) => g.presets.length > 0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ fontFamily: SYSTEM_FONT }}
    >
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[17px] font-semibold text-white">Lightroom</h1>
            <p className="text-[12px] text-white/40 mt-0.5">
              RAW processing powered by sharp — Adobe API-ready
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
            {(["process", "batch", "social"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                  tab === t
                    ? "bg-white/[0.1] text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {t === "process"
                  ? "Process"
                  : t === "batch"
                    ? "Batch"
                    : "Social Crops"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Preset Selector (shared across tabs) ────────────────────────── */}
        <div className="mb-5">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">
            Processing Preset
          </p>
          <div className="space-y-2">
            {groupedPresets.map((group) => (
              <div key={group.category}>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
                  {group.label}
                </p>
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
          {presets.find((p) => p.key === selectedPreset) && (
            <p className="text-[11px] text-white/30 mt-2">
              {presets.find((p) => p.key === selectedPreset)!.description}
            </p>
          )}
        </div>

        {/* Settings row */}
        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-white/[0.06]">
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

          {format === "jpg" && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/40">Quality</span>
              <input
                type="range"
                min={60}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-20 h-1 accent-cyan-400 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
              />
              <span className="text-[11px] text-white/60 font-mono w-6">
                {quality}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/40">Crop</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 text-[11px] text-white outline-none"
            >
              <option value="">None (original)</option>
              {crops.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} ({c.width}×{c.height})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Process Tab ─────────────────────────────────────────────────── */}
        {tab === "process" && (
          <div className="space-y-4">
            {/* Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.dng,.cr2,.nef,.arw,.orf,.rw2"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <p className="text-[13px] text-white/50">
                {imageUrl
                  ? "Drop another image to replace"
                  : "Drop a RAW or image file here"}
              </p>
              <p className="text-[11px] text-white/25 mt-1">
                DNG, CR2, NEF, ARW, JPG, PNG — from your DJI Mini 5 Pro
              </p>
            </div>

            {/* Preview */}
            {imageUrl && (
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      Original
                    </p>
                    <p className="text-[10px] text-white/25">
                      {imageFile?.name}
                    </p>
                  </div>
                  <div className="bg-black/40 rounded-xl overflow-hidden border border-white/[0.06]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Original"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Processed */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      {proc.status === "done"
                        ? `Processed — ${selectedPreset}`
                        : "Output"}
                    </p>
                    {proc.status === "done" && (
                      <p className="text-[10px] text-cyan-400/60">
                        {proc.timeMs}ms · {formatSize(proc.outputSize)}
                      </p>
                    )}
                  </div>
                  <div className="bg-black/40 rounded-xl overflow-hidden border border-white/[0.06] min-h-[200px] flex items-center justify-center">
                    {proc.status === "idle" && (
                      <p className="text-[12px] text-white/20">
                        Select a preset and hit Process
                      </p>
                    )}
                    {proc.status === "processing" && (
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-[12px] text-white/40">
                          {proc.progress}
                        </p>
                      </div>
                    )}
                    {proc.status === "error" && (
                      <p className="text-[12px] text-red-400 px-4 text-center">
                        {proc.progress}
                      </p>
                    )}
                    {proc.status === "done" && proc.resultUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={proc.resultUrl}
                        alt="Processed"
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {imageUrl && (
              <div className="flex gap-3">
                <button
                  onClick={processImage}
                  disabled={proc.status === "processing"}
                  className={`flex-1 font-medium rounded-lg py-2.5 text-[13px] transition-colors ${
                    proc.status === "processing"
                      ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                      : "bg-cyan-500 text-black hover:bg-cyan-400"
                  }`}
                >
                  {proc.status === "processing"
                    ? "Processing..."
                    : "Process"}
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
          </div>
        )}

        {/* ── Batch Tab ───────────────────────────────────────────────────── */}
        {tab === "batch" && (
          <div className="space-y-4">
            <div
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                setBatchFiles((prev) => [...prev, ...files]);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.accept = "image/*,.dng,.cr2,.nef,.arw,.orf,.rw2";
                input.onchange = () => {
                  if (input.files) {
                    setBatchFiles((prev) => [
                      ...prev,
                      ...Array.from(input.files!),
                    ]);
                  }
                };
                input.click();
              }}
              className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors"
            >
              <p className="text-[13px] text-white/50">
                Drop multiple files or click to select
              </p>
              <p className="text-[11px] text-white/25 mt-1">
                All files will be processed with the selected preset
              </p>
            </div>

            {batchFiles.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-white/60">
                    {batchFiles.length} file
                    {batchFiles.length !== 1 ? "s" : ""} queued
                  </p>
                  <button
                    onClick={() => {
                      setBatchFiles([]);
                      setBatchResults([]);
                    }}
                    className="text-[11px] text-white/30 hover:text-white/60"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {batchFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/[0.02] rounded px-3 py-1.5 border border-white/[0.04]"
                    >
                      <span className="text-[12px] text-white/60 truncate">
                        {f.name}
                      </span>
                      <span className="text-[10px] text-white/30">
                        {formatSize(f.size)}
                      </span>
                    </div>
                  ))}
                </div>

                {batchProcessing && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    <p className="text-[12px] text-white/40">
                      Processing {batchProgress.current} of{" "}
                      {batchProgress.total}...
                    </p>
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all"
                        style={{
                          width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {batchResults.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-white/40 uppercase tracking-wider">
                        Results
                      </p>
                      <button
                        onClick={downloadAllBatch}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300"
                      >
                        Download all
                      </button>
                    </div>
                    {batchResults.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white/[0.02] rounded px-3 py-1.5 border border-white/[0.04]"
                      >
                        <span className="text-[12px] text-white/60 truncate">
                          {r.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-white/30">
                            {r.timeMs}ms
                          </span>
                          <span className="text-[10px] text-white/30">
                            {formatSize(r.size)}
                          </span>
                          <a
                            href={r.url}
                            download={r.name.replace(
                              /\.[^.]+$/,
                              `_${selectedPreset}.${format}`,
                            )}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300"
                          >
                            ↓
                          </a>
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
                    ? `Processing ${batchProgress.current}/${batchProgress.total}...`
                    : `Process ${batchFiles.length} files`}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Social Crops Tab ────────────────────────────────────────────── */}
        {tab === "social" && (
          <div className="space-y-4">
            {!imageUrl && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors"
              >
                <p className="text-[13px] text-white/50">
                  Upload an image to generate social crops
                </p>
              </div>
            )}

            {imageUrl && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 bg-black/40 rounded-lg overflow-hidden border border-white/[0.06] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Source"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] text-white/80">
                      {imageFile?.name}
                    </p>
                    <p className="text-[11px] text-white/30">
                      Select sizes to export — each will be processed with{" "}
                      {selectedPreset} and cropped
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {crops.map((c) => {
                    const aspect = c.width / c.height;
                    const previewH = Math.round(120 / aspect);
                    return (
                      <button
                        key={c.key}
                        onClick={() =>
                          setSelectedCrop(
                            selectedCrop === c.key ? "" : c.key,
                          )
                        }
                        className={`text-left p-3 rounded-lg border transition-all ${
                          selectedCrop === c.key
                            ? "border-cyan-400/60 bg-cyan-400/[0.06]"
                            : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <div
                          className="bg-white/[0.06] rounded mb-2 mx-auto"
                          style={{
                            width: 120,
                            height: Math.min(previewH, 80),
                          }}
                        />
                        <p className="text-[12px] text-white/70 font-medium">
                          {c.label}
                        </p>
                        <p className="text-[10px] text-white/30 font-mono">
                          {c.width}×{c.height}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedCrop && (
                  <button
                    onClick={processImage}
                    disabled={proc.status === "processing"}
                    className={`w-full font-medium rounded-lg py-2.5 text-[13px] transition-colors ${
                      proc.status === "processing"
                        ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                        : "bg-cyan-500 text-black hover:bg-cyan-400"
                    }`}
                  >
                    {proc.status === "processing"
                      ? "Processing..."
                      : `Export ${crops.find((c) => c.key === selectedCrop)?.label} crop`}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Backend badge */}
        <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
          <span className="text-[10px] text-white/20">
            sharp + libvips · Zero-dependency processing · Adobe API upgrade path available
          </span>
        </div>
      </div>
    </div>
  );
}
