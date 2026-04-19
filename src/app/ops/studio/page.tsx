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

type View = "library" | "preview" | "editor" | "analyze";

// ── Canvas rendering helpers ─────────────────────────────────────────────────

function applyGradeToCanvas(
  sourceImg: HTMLImageElement,
  grade: { saturation: number; contrast: number; brightness: number },
  canvas: HTMLCanvasElement,
  textOverlay?: { text: string; position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"; fontSize: number },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = sourceImg.naturalWidth;
  canvas.height = sourceImg.naturalHeight;
  ctx.filter = `saturate(${grade.saturation}%) contrast(${grade.contrast}%) brightness(${grade.brightness}%)`;
  ctx.drawImage(sourceImg, 0, 0);
  ctx.filter = "none";

  if (textOverlay?.text) {
    const size = textOverlay.fontSize * (canvas.width / 800);
    ctx.font = `600 ${size}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = size * 0.3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    const metrics = ctx.measureText(textOverlay.text);
    const pad = size * 0.8;
    let x: number, y: number;
    switch (textOverlay.position) {
      case "top-left": x = pad; y = pad + size; break;
      case "top-right": x = canvas.width - metrics.width - pad; y = pad + size; break;
      case "bottom-left": x = pad; y = canvas.height - pad; break;
      case "bottom-right": x = canvas.width - metrics.width - pad; y = canvas.height - pad; break;
      case "center": x = (canvas.width - metrics.width) / 2; y = canvas.height / 2 + size / 2; break;
    }
    ctx.fillText(textOverlay.text, x, y);
    ctx.shadowColor = "transparent";
  }
}

function renderClientOutput(
  sourceImg: HTMLImageElement,
  grade: { saturation: number; contrast: number; brightness: number },
  gradeName: string,
  analysis: GradeAnalysis | null,
  canvas: HTMLCanvasElement,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imgW = 600;
  const imgH = Math.round((sourceImg.naturalHeight / sourceImg.naturalWidth) * imgW);
  const panelH = analysis ? 220 : 80;
  const totalW = imgW * 2 + 48;
  const totalH = imgH + panelH + 80;

  canvas.width = totalW;
  canvas.height = totalH;

  // Background
  ctx.fillStyle = "#1c1c1e";
  ctx.fillRect(0, 0, totalW, totalH);

  // Header
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 22px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("WAEVPOINT", 24, 40);
  ctx.fillStyle = "#06b6d4";
  ctx.font = `500 13px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("GRADE STUDIO", 168, 40);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = `400 11px -apple-system, BlinkMacSystemFont, sans-serif`;
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  ctx.fillText(dateStr, totalW - 100, 40);

  // Divider
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(24, 52, totalW - 48, 1);

  const y0 = 64;

  // Original label
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = `500 11px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("ORIGINAL", 24, y0 + 12);

  // Graded label
  ctx.fillStyle = "#06b6d4";
  ctx.fillText(gradeName.toUpperCase() + (analysis ? "  ★ AI RECOMMENDED" : ""), imgW + 40, y0 + 12);

  const imgY = y0 + 20;

  // Original image
  ctx.drawImage(sourceImg, 24, imgY, imgW, imgH);

  // Graded image
  const offscreen = document.createElement("canvas");
  offscreen.width = sourceImg.naturalWidth;
  offscreen.height = sourceImg.naturalHeight;
  const offCtx = offscreen.getContext("2d")!;
  offCtx.filter = `saturate(${grade.saturation}%) contrast(${grade.contrast}%) brightness(${grade.brightness}%)`;
  offCtx.drawImage(sourceImg, 0, 0);
  ctx.drawImage(offscreen, imgW + 40, imgY, imgW, imgH);

  // Borders
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, imgY, imgW, imgH);
  ctx.strokeStyle = "rgba(6,182,212,0.3)";
  ctx.strokeRect(imgW + 40, imgY, imgW, imgH);

  const infoY = imgY + imgH + 16;

  if (analysis) {
    // Characteristics row
    const chars = analysis.characteristics;
    const charEntries = Object.entries(chars);
    const charW = (totalW - 48) / charEntries.length;
    charEntries.forEach(([key, value], i) => {
      const cx = 24 + i * charW;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, cx, infoY, charW - 8, 40, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = `400 9px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(key.toUpperCase(), cx + 8, infoY + 14);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = `500 12px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(String(value), cx + 8, infoY + 30);
    });

    // Reasoning
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `400 11px -apple-system, BlinkMacSystemFont, sans-serif`;
    const reasonLines = wrapText(ctx, analysis.reasoning, totalW - 48);
    reasonLines.forEach((line, i) => {
      ctx.fillText(line, 24, infoY + 64 + i * 16);
    });

    // Grade rankings
    const rankY = infoY + 64 + reasonLines.length * 16 + 12;
    analysis.gradeRankings.slice(0, 5).forEach((rank, i) => {
      const ry = rankY + i * 20;
      const isTop = rank.grade === analysis.recommended;
      ctx.fillStyle = isTop ? "#06b6d4" : "rgba(255,255,255,0.5)";
      ctx.font = `${isTop ? "600" : "400"} 11px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(rank.grade, 24, ry);
      // Bar
      const barX = 140;
      const barW = 200;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, barX, ry - 8, barW, 10, 3);
      ctx.fill();
      ctx.fillStyle = isTop ? "#06b6d4" : "rgba(255,255,255,0.15)";
      roundRect(ctx, barX, ry - 8, barW * rank.score / 10, 10, 3);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`${rank.score}/10`, barX + barW + 8, ry);
      ctx.fillText(rank.note, barX + barW + 50, ry);
    });
  }

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(24, totalH - 28, totalW - 48, 1);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = `400 10px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("waevpoint.quest  |  AI-powered drone color grading", 24, totalH - 10);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
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
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 6);
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ── Components ───────────────────────────────────────────────────────────────

function GradeCard({
  name,
  grade,
  selected,
  onSelect,
}: {
  name: string;
  grade: GradeDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  const tempColor = gradeTempColor(grade.color_temp);
  return (
    <button
      onClick={onSelect}
      className={`text-left p-3 rounded-lg border transition-all ${
        selected
          ? "border-cyan-400/60 bg-cyan-400/[0.06]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tempColor }} />
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
        <span>shd:+{grade.shadows_lift}</span>
        <span>hi:{grade.highlights_pull}</span>
      </div>
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/50 w-20 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 accent-cyan-400 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
      />
      <span className="text-[11px] text-white/60 font-mono w-12 text-right">
        {value > 0 && unit !== "x" ? "+" : ""}{value}{unit ?? ""}
      </span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const { token } = useOps();
  const [view, setView] = useState<View>("library");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GradeAnalysis | null>(null);
  const [visionDesc, setVisionDesc] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Editor state
  const [saturation, setSaturation] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [shadows, setShadows] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [overlayText, setOverlayText] = useState("");
  const [textPosition, setTextPosition] = useState<"top-left" | "top-right" | "bottom-left" | "bottom-right" | "center">("bottom-right");
  const [textSize, setTextSize] = useState(36);
  const [cropRatio, setCropRatio] = useState<"free" | "16:9" | "9:16" | "1:1">("free");

  const editorCSS: React.CSSProperties = {
    filter: `saturate(${saturation}%) contrast(${contrast}%) brightness(${brightness}%)`,
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Upload a frame image (JPG/PNG)");
      return;
    }
    setError("");
    setAnalysis(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);
      setImageB64(dataUrl.split(",")[1]);
      const img = new Image();
      img.onload = () => { imgRef.current = img; };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

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

  const resetEditor = useCallback(() => {
    setSaturation(100);
    setContrast(100);
    setBrightness(100);
    setShadows(0);
    setHighlights(0);
    setOverlayText("");
    setSelectedGrade(null);
  }, []);

  const exportFrame = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    applyGradeToCanvas(
      imgRef.current,
      { saturation, contrast, brightness },
      canvasRef.current,
      overlayText ? { text: overlayText, position: textPosition, fontSize: textSize } : undefined,
    );
    downloadCanvas(canvasRef.current, `waevpoint_graded_${Date.now()}.png`);
  }, [saturation, contrast, brightness, overlayText, textPosition, textSize]);

  const exportClientOutput = useCallback(() => {
    if (!imgRef.current || !outputCanvasRef.current) return;
    const gradeName = selectedGrade ?? "custom";
    renderClientOutput(
      imgRef.current,
      { saturation, contrast, brightness },
      gradeName,
      analysis,
      outputCanvasRef.current,
    );
    downloadCanvas(outputCanvasRef.current, `waevpoint_client_${gradeName}_${Date.now()}.png`);
  }, [saturation, contrast, brightness, selectedGrade, analysis]);

  const runAnalysis = useCallback(async () => {
    if (!imageB64) return;
    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/studio/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ops-token": token },
        body: JSON.stringify({ image: imageB64 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as { analysis: GradeAnalysis; visionDescription: string };
      setAnalysis(data.analysis);
      setVisionDesc(data.visionDescription);
      if (data.analysis.recommended && GRADES[data.analysis.recommended]) {
        loadGradeToEditor(data.analysis.recommended);
      }
      setView("analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }, [imageB64, token, loadGradeToEditor]);

  // Auto-switch to editor when selecting a grade in preview with an image loaded
  useEffect(() => {
    if (selectedGrade && imageUrl && view === "preview") {
      loadGradeToEditor(selectedGrade);
    }
  }, [selectedGrade, imageUrl, view, loadGradeToEditor]);

  const gradeEntries = Object.entries(GRADES);

  const UploadZone = ({ compact }: { compact?: boolean }) => (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileRef.current?.click()}
      className={`border-2 border-dashed border-white/[0.1] rounded-xl text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors ${compact ? "p-4" : "p-8"}`}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <p className="text-[12px] text-white/50">{imageUrl ? "Drop another frame to replace" : "Drop a frame here or click to upload"}</p>
      {!compact && <p className="text-[11px] text-white/25 mt-1">JPG, PNG — extract a frame from your footage</p>}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: SYSTEM_FONT }}>
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[17px] font-semibold text-white">Grade Studio</h1>
            <p className="text-[12px] text-white/40 mt-0.5">Color grading, editing, and client-ready output</p>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
            {(["library", "preview", "editor", "analyze"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                  view === v ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                {v === "library" ? "Library" : v === "preview" ? "Preview" : v === "editor" ? "Editor" : "AI Analyze"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            <p className="text-[12px] text-red-400">{error}</p>
          </div>
        )}

        {/* Hidden canvases for export */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={outputCanvasRef} className="hidden" />

        {/* ── Library ──────────────────────────────────────────────────────── */}
        {view === "library" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {gradeEntries.map(([name, grade]) => (
              <GradeCard key={name} name={name} grade={grade} selected={selectedGrade === name}
                onSelect={() => { setSelectedGrade(name); if (imageUrl) { loadGradeToEditor(name); setView("editor"); } }} />
            ))}
          </div>
        )}

        {/* ── Preview ──────────────────────────────────────────────────────── */}
        {view === "preview" && (
          <div className="space-y-4">
            <UploadZone />
            {imageUrl && (
              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3">All grades — click to edit</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <img src={imageUrl} alt="Original" className="w-full rounded-lg border border-white/[0.08]" />
                    <p className="text-[11px] text-white/50 text-center">ORIGINAL</p>
                  </div>
                  {gradeEntries.map(([name, grade]) => (
                    <div key={name} className="space-y-1.5 cursor-pointer" onClick={() => { loadGradeToEditor(name); setView("editor"); }}>
                      <img src={imageUrl} alt={name}
                        className="w-full rounded-lg border border-white/[0.08] hover:border-cyan-400/40 transition-colors"
                        style={gradeToCSS(grade)} />
                      <p className="text-[11px] text-white/50 text-center">{name.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Editor ───────────────────────────────────────────────────────── */}
        {view === "editor" && (
          <div className="space-y-4">
            {!imageUrl && <UploadZone />}
            {imageUrl && (
              <div className="grid grid-cols-[1fr_280px] gap-5">
                {/* Canvas preview */}
                <div className="space-y-3">
                  <div className="relative bg-black/40 rounded-xl overflow-hidden border border-white/[0.06]">
                    <img
                      src={imageUrl}
                      alt="Editor preview"
                      className="w-full"
                      style={{
                        ...editorCSS,
                        aspectRatio: cropRatio === "free" ? "auto" : cropRatio === "16:9" ? "16/9" : cropRatio === "9:16" ? "9/16" : "1/1",
                        objectFit: "cover",
                      }}
                    />
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

                  {/* Export buttons */}
                  <div className="flex gap-2">
                    <button onClick={exportFrame}
                      className="flex-1 bg-cyan-500 text-black font-medium rounded-lg py-2.5 text-[13px] hover:bg-cyan-400 transition-colors">
                      Export Frame
                    </button>
                    <button onClick={exportClientOutput}
                      className="flex-1 bg-white/[0.06] text-white font-medium rounded-lg py-2.5 text-[13px] hover:bg-white/[0.1] transition-colors border border-white/[0.08]">
                      Export Client Sheet
                    </button>
                    <button onClick={() => fileRef.current?.click()}
                      className="px-4 bg-white/[0.04] text-white/60 rounded-lg py-2.5 text-[13px] hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
                      Replace
                    </button>
                  </div>
                </div>

                {/* Controls panel */}
                <div className="space-y-4">
                  {/* Grade presets */}
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Load Preset</p>
                    <div className="flex flex-wrap gap-1.5">
                      {gradeEntries.map(([name]) => (
                        <button key={name} onClick={() => loadGradeToEditor(name)}
                          className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                            selectedGrade === name
                              ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                              : "border-white/[0.08] text-white/40 hover:border-white/20"
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

                  {/* Color adjustments */}
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

                  {/* Crop */}
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Crop</p>
                    <div className="flex gap-1.5">
                      {(["free", "16:9", "9:16", "1:1"] as const).map((r) => (
                        <button key={r} onClick={() => setCropRatio(r)}
                          className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                            cropRatio === r
                              ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                              : "border-white/[0.08] text-white/40 hover:border-white/20"
                          }`}>
                          {r === "free" ? "Free" : r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text overlay */}
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Text Overlay</p>
                    <input
                      type="text"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      placeholder="Client name, location..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-2 text-[12px] text-white outline-none focus:border-cyan-400/40 mb-2"
                    />
                    <div className="flex gap-1.5 mb-2">
                      {(["top-left", "top-right", "center", "bottom-left", "bottom-right"] as const).map((pos) => (
                        <button key={pos} onClick={() => setTextPosition(pos)}
                          className={`px-1.5 py-1 rounded text-[9px] border transition-colors ${
                            textPosition === pos
                              ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                              : "border-white/[0.08] text-white/30 hover:border-white/20"
                          }`}>
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

        {/* ── AI Analyze ───────────────────────────────────────────────────── */}
        {view === "analyze" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1"><UploadZone compact /></div>
              <button onClick={runAnalysis} disabled={!imageB64 || analyzing}
                className={`px-5 py-3 rounded-lg text-[13px] font-medium transition-colors shrink-0 ${
                  !imageB64 || analyzing ? "bg-white/[0.06] text-white/30 cursor-not-allowed" : "bg-cyan-500 text-black hover:bg-cyan-400"
                }`}>
                {analyzing ? "Analyzing..." : "Analyze with AI"}
              </button>
            </div>

            {analyzing && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[12px] text-white/40">Qwen VL analyzing frame...</p>
                  <p className="text-[11px] text-white/25 mt-1">Llama 3.3 recommending grade...</p>
                </div>
              </div>
            )}

            {analysis && imageUrl && (
              <div className="space-y-4">
                {/* Before / After */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-white/40 mb-1.5 uppercase tracking-wider">Original</p>
                    <img src={imageUrl} alt="Original" className="w-full rounded-lg border border-white/[0.08]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/40 mb-1.5 uppercase tracking-wider">
                      {analysis.recommended.toUpperCase()} <span className="text-cyan-400">Recommended</span>
                    </p>
                    <img src={imageUrl} alt={analysis.recommended}
                      className="w-full rounded-lg border border-cyan-400/30"
                      style={GRADES[analysis.recommended] ? gradeToCSS(GRADES[analysis.recommended]) : {}} />
                  </div>
                </div>

                {/* Vision description */}
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">AI Vision</p>
                  <p className="text-[12px] text-white/70 leading-relaxed">{visionDesc}</p>
                </div>

                {/* Characteristics */}
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(analysis.characteristics).map(([key, value]) => (
                    <div key={key} className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.06]">
                      <p className="text-[10px] text-white/30 uppercase">{key}</p>
                      <p className="text-[12px] text-white/80 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Reasoning */}
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Recommendation</p>
                  <p className="text-[12px] text-white/70 leading-relaxed">{analysis.reasoning}</p>
                </div>

                {/* Grade Rankings */}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider">Grade Rankings</p>
                  {analysis.gradeRankings.map((rank) => {
                    const isTop = rank.grade === analysis.recommended;
                    return (
                      <div key={rank.grade}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                          isTop ? "border-cyan-400/30 bg-cyan-400/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
                        }`}>
                        <span className={`text-[12px] font-medium w-28 shrink-0 ${isTop ? "text-cyan-400" : "text-white/70"}`}>
                          {rank.grade}
                        </span>
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isTop ? "bg-cyan-400" : "bg-white/20"}`}
                            style={{ width: `${rank.score * 10}%` }} />
                        </div>
                        <span className="text-[11px] text-white/50 w-8 text-right">{rank.score}/10</span>
                        <span className="text-[11px] text-white/30 w-48 truncate">{rank.note}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Suggestion */}
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
                      <span>shd:+{analysis.customSuggestion.settings.shadows_lift}</span>
                      <span>hi:{analysis.customSuggestion.settings.highlights_pull}</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button onClick={() => { if (analysis.recommended) { loadGradeToEditor(analysis.recommended); setView("editor"); } }}
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
    </div>
  );
}
