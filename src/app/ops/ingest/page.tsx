"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { FLIGHT_PURPOSES, FlightPurpose } from "@/lib/flights";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

interface SrtSummary {
  totalSamples: number;
  durationSec: number;
  startLat: number | null;
  startLng: number | null;
  avgLat: number | null;
  avgLng: number | null;
  maxRelAlt: number | null;
  minRelAlt: number | null;
  maxAbsAlt: number | null;
  iso: number | null;
  shutter: string | null;
  fnumF: number | null;
  focalMm: number | null;
  date: string | null;
  takeoff_time: string | null;
  landing_time: string | null;
}

interface TrackPoint {
  t: number;
  lat: number;
  lng: number;
  alt: number | null;
}

interface FullTrackPoint {
  t: number;
  lat: number;
  lng: number;
  alt: number | null;
  absAlt: number | null;
}

interface PreviewResponse {
  summary: SrtSummary;
  track: TrackPoint[];
  fullTrack: FullTrackPoint[];
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${s}s`;
}

export default function IngestPage() {
  const { token, logout } = useOps();
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [preview, setPreview] = useState<PreviewResponse | null>(null);

  const [pilot, setPilot] = useState("");
  const [location, setLocation] = useState("");
  const [droneName, setDroneName] = useState("DJI Mini 5 Pro");
  const [purpose, setPurpose] = useState<FlightPurpose>("commercial");
  const [weather, setWeather] = useState("");
  const [notes, setNotes] = useState("");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const trackLayerRef = useRef<LeafletNS.LayerGroup | null>(null);

  const resetForm = useCallback(() => {
    setFileName("");
    setPreview(null);
    setError("");
    setPilot("");
    setLocation("");
    setDroneName("DJI Mini 5 Pro");
    setPurpose("commercial");
    setWeather("");
    setNotes("");
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError("");
      setToast("");
      setParsing(true);
      setFileName(file.name);
      try {
        const text = await file.text();
        const res = await fetch("/api/flights/import-srt", {
          method: "POST",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ srt: text }),
        });
        if (res.status === 401) {
          logout();
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to parse SRT");
          setPreview(null);
          return;
        }
        setPreview(data);
        // Pre-fill notes with camera settings
        const s = (data as PreviewResponse).summary;
        const camBits: string[] = [];
        if (s.iso) camBits.push(`ISO ${s.iso}`);
        if (s.shutter) camBits.push(`${s.shutter}s`);
        if (s.fnumF) camBits.push(`f/${s.fnumF}`);
        if (s.focalMm) camBits.push(`${s.focalMm}mm`);
        if (camBits.length) setNotes(camBits.join(" · "));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to read file");
      } finally {
        setParsing(false);
      }
    },
    [authHeader, logout],
  );

  // Mount map + draw track when preview arrives
  useEffect(() => {
    if (!preview || !mapContainerRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapContainerRef.current) return;

      if (!mapRef.current) {
        // @ts-expect-error — Leaflet default icon path fix for Next.js
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const center: [number, number] =
          preview.summary.avgLat != null && preview.summary.avgLng != null
            ? [preview.summary.avgLat, preview.summary.avgLng]
            : [12.8797, 121.774];
        const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(center, 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;
        trackLayerRef.current = L.layerGroup().addTo(map);
      }

      const map = mapRef.current;
      const layer = trackLayerRef.current;
      if (!map || !layer) return;
      layer.clearLayers();

      const points: [number, number][] = preview.track.map((p) => [p.lat, p.lng]);
      if (points.length < 2) return;

      L.polyline(points, { color: "#22d3ee", weight: 4, opacity: 0.85 }).addTo(layer);

      const start = points[0];
      const end = points[points.length - 1];
      L.marker(start, {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid #14532d;box-shadow:0 0 0 3px rgba(34,197,94,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      })
        .addTo(layer)
        .bindPopup("Takeoff");
      L.marker(end, {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#f43f5e;border:2px solid #881337;box-shadow:0 0 0 3px rgba(244,63,94,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      })
        .addTo(layer)
        .bindPopup("Landing");

      map.fitBounds(L.latLngBounds(points), { padding: [24, 24] });
    })();

    return () => {
      cancelled = true;
    };
  }, [preview]);

  // Cleanup map when page unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        trackLayerRef.current = null;
      }
    };
  }, []);

  async function saveFlight() {
    if (!preview) return;
    if (!pilot.trim() || !location.trim()) {
      setError("Pilot and location required");
      return;
    }
    setError("");
    setSaving(true);
    const s = preview.summary;
    const durationMinutes =
      s.takeoff_time && s.landing_time
        ? (() => {
            const [th, tm] = s.takeoff_time.split(":").map(Number);
            const [lh, lm] = s.landing_time.split(":").map(Number);
            let diff = lh * 60 + lm - (th * 60 + tm);
            if (diff < 0) diff += 24 * 60;
            return diff;
          })()
        : Math.max(1, Math.round(s.durationSec / 60));

    const payload = {
      date: s.date || new Date().toISOString().slice(0, 10),
      pilot_name: pilot.trim(),
      drone_id: null,
      drone_name: droneName.trim() || null,
      location: location.trim(),
      takeoff_time: s.takeoff_time,
      landing_time: s.landing_time,
      duration_minutes: durationMinutes,
      purpose,
      weather: weather.trim() || null,
      incidents: null,
      notes: notes.trim() || null,
      latitude: s.avgLat,
      longitude: s.avgLng,
      track: preview.fullTrack,
    };

    const res = await fetch("/api/flights", {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save flight");
      return;
    }
    setToast(`Flight log saved — ${fileName}`);
    resetForm();
  }

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!/\.srt$/i.test(file.name)) {
        setError("Only .SRT files supported");
        return;
      }
      handleFile(file);
    },
    [handleFile],
  );

  return (
    <div
      className="h-full overflow-auto text-white"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-semibold">SRT Ingest</h1>
            <p className="text-white/40 text-[12px] mt-0.5">
              Drop a DJI .SRT file to auto-fill a flight log with GPS, duration, and camera
              settings.
            </p>
          </div>
          {preview && (
            <button
              onClick={resetForm}
              className="text-[12px] text-white/60 hover:text-white px-2 py-1 rounded hover:bg-white/[0.06]"
            >
              Start over
            </button>
          )}
        </div>

        {toast && (
          <div className="mb-4 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 px-3 py-2 text-[12px]">
            {toast}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-2 text-[12px]">
            {error}
          </div>
        )}

        {!preview && (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`block border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-cyan-400 bg-cyan-500/5"
                : "border-white/15 hover:border-white/30 bg-white/[0.02]"
            }`}
          >
            <input
              type="file"
              accept=".srt,.SRT"
              className="hidden"
              disabled={parsing}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="text-[14px] font-medium mb-1">
              {parsing ? "Parsing…" : "Drop a .SRT file here"}
            </div>
            <div className="text-[12px] text-white/50">
              {parsing ? fileName : "or click to choose. Works with DJI Mini/Mavic/Air telemetry."}
            </div>
          </label>
        )}

        {preview && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
            <div className="space-y-4">
              <div
                ref={mapContainerRef}
                style={{ height: 360 }}
                className="rounded-lg overflow-hidden border border-white/10"
              />
              <SummaryGrid summary={preview.summary} fileName={fileName} />
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <div className="text-[12px] font-medium text-white/70 uppercase tracking-wide mb-1">
                Flight Log
              </div>

              <Field label="Pilot *">
                <input
                  value={pilot}
                  onChange={(e) => setPilot(e.target.value)}
                  placeholder="Cherwin Fernandez"
                  className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[12px] outline-none focus:border-cyan-400/50"
                />
              </Field>

              <Field label="Location *">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. La Union, PH"
                  className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[12px] outline-none focus:border-cyan-400/50"
                />
              </Field>

              <Field label="Drone">
                <input
                  value={droneName}
                  onChange={(e) => setDroneName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[12px] outline-none focus:border-cyan-400/50"
                />
              </Field>

              <Field label="Purpose">
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as FlightPurpose)}
                  className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[12px] outline-none focus:border-cyan-400/50"
                >
                  {FLIGHT_PURPOSES.map((p) => (
                    <option key={p.key} value={p.key} className="bg-[#1c1c1e]">
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Weather">
                <input
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="Clear, 8kt NE"
                  className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[12px] outline-none focus:border-cyan-400/50"
                />
              </Field>

              <Field label="Notes">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[12px] outline-none focus:border-cyan-400/50 resize-none"
                />
              </Field>

              <button
                onClick={saveFlight}
                disabled={saving}
                className="w-full bg-cyan-500 text-black font-medium rounded py-2 text-[12px] hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Create flight log"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-white/50 mb-1">{label}</span>
      {children}
    </label>
  );
}

function SummaryGrid({ summary, fileName }: { summary: SrtSummary; fileName: string }) {
  const rows: { k: string; v: string }[] = [
    { k: "Source", v: fileName || "—" },
    { k: "Date", v: summary.date || "—" },
    {
      k: "Window",
      v: summary.takeoff_time && summary.landing_time
        ? `${summary.takeoff_time} → ${summary.landing_time}`
        : "—",
    },
    { k: "Duration", v: fmtDuration(summary.durationSec) },
    { k: "Samples", v: String(summary.totalSamples) },
    {
      k: "Avg coords",
      v:
        summary.avgLat != null && summary.avgLng != null
          ? `${summary.avgLat.toFixed(5)}, ${summary.avgLng.toFixed(5)}`
          : "—",
    },
    {
      k: "Max rel alt",
      v: summary.maxRelAlt != null ? `${summary.maxRelAlt.toFixed(1)} m` : "—",
    },
    {
      k: "Max abs alt",
      v: summary.maxAbsAlt != null ? `${summary.maxAbsAlt.toFixed(1)} m` : "—",
    },
    { k: "ISO", v: summary.iso != null ? String(summary.iso) : "—" },
    { k: "Shutter", v: summary.shutter ? `${summary.shutter}s` : "—" },
    { k: "Aperture", v: summary.fnumF != null ? `f/${summary.fnumF}` : "—" },
    { k: "Focal", v: summary.focalMm != null ? `${summary.focalMm} mm` : "—" },
  ];
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[12px] font-medium text-white/70 uppercase tracking-wide mb-3">
        Parsed Telemetry
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {rows.map((r) => (
          <div key={r.k}>
            <div className="text-[10px] text-white/40 uppercase tracking-wide">{r.k}</div>
            <div className="text-[12px] text-white/90 font-mono">{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
