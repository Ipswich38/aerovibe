"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { GeneratedMission, MISSION_PRESETS, calcGsd } from "@/lib/missions";
import { AIRPORTS, CAUTION_RADIUS_KM, NO_FLY_RADIUS_KM, checkLocation } from "@/lib/geofence";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

const PH_CENTER: [number, number] = [12.8797, 121.774];
const PH_ZOOM = 6;

export default function MissionsPage() {
  const { token, logout } = useOps();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const centerMarkerRef = useRef<LeafletNS.Marker | null>(null);
  const pathLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const polyLayerRef = useRef<LeafletNS.LayerGroup | null>(null);

  const [presetKey, setPresetKey] = useState<string>(MISSION_PRESETS[0].key);
  const preset = useMemo(() => MISSION_PRESETS.find((p) => p.key === presetKey)!, [presetKey]);
  const isPolygonMode = preset.geometry === "polygon_grid";

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [polygon, setPolygon] = useState<{ lat: number; lng: number }[]>([]);
  const [altitudeM, setAltitudeM] = useState(preset.defaults.altitudeM);
  const [radiusM, setRadiusM] = useState(preset.defaults.radiusM ?? 30);
  const [distanceM, setDistanceM] = useState(preset.defaults.distanceM ?? 80);
  const [pointCount, setPointCount] = useState(preset.defaults.pointCount ?? 12);
  const [speedMs, setSpeedMs] = useState(preset.defaults.speedMs);
  const [gimbalPitch, setGimbalPitch] = useState(preset.defaults.gimbalPitch);
  const [heading, setHeading] = useState(0);
  const [missionName, setMissionName] = useState("");

  const [mission, setMission] = useState<GeneratedMission | null>(null);
  const [airspaceWarning, setAirspaceWarning] = useState<string | null>(null);
  const [status, setStatus] = useState<"no_fly" | "caution" | "clear" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    setAltitudeM(preset.defaults.altitudeM);
    setRadiusM(preset.defaults.radiusM ?? 30);
    setDistanceM(preset.defaults.distanceM ?? 80);
    setPointCount(preset.defaults.pointCount ?? 12);
    setSpeedMs(preset.defaults.speedMs);
    setGimbalPitch(preset.defaults.gimbalPitch);
    setPolygon([]);
    setMission(null);
  }, [preset]);

  // Live GSD preview based on altitude
  const liveGsd = useMemo(() => calcGsd(altitudeM), [altitudeM]);

  // Init map
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        center: PH_CENTER,
        zoom: PH_ZOOM,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      for (const a of AIRPORTS) {
        L.circle([a.lat, a.lng], {
          radius: CAUTION_RADIUS_KM * 1000,
          color: "#f59e0b",
          weight: 1,
          opacity: 0.5,
          fill: false,
          dashArray: "4 4",
        }).addTo(map);
        L.circle([a.lat, a.lng], {
          radius: NO_FLY_RADIUS_KM * 1000,
          color: "#ef4444",
          weight: 1.2,
          opacity: 0.7,
          fillColor: "#ef4444",
          fillOpacity: 0.1,
        })
          .bindTooltip(a.name, { direction: "top" })
          .addTo(map);
      }

      pathLayerRef.current = L.layerGroup().addTo(map);
      polyLayerRef.current = L.layerGroup().addTo(map);
    })().catch((err) => {
      console.error(err);
      setError("Failed to load map");
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      centerMarkerRef.current = null;
      pathLayerRef.current = null;
      polyLayerRef.current = null;
    };
  }, []);

  // Map click handler — switches behavior based on mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: LeafletNS.LeafletMouseEvent) => {
      const pt = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (isPolygonMode) {
        setPolygon((prev) => [...prev, pt]);
        if (!center) setCenter(pt);
      } else {
        setCenter(pt);
      }
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [isPolygonMode, center]);

  // Draw polygon vertices + outline
  useEffect(() => {
    const L = leafletRef.current;
    const layer = polyLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    if (!isPolygonMode || polygon.length === 0) return;

    polygon.forEach((p, i) => {
      L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#a855f7;border:2px solid #7e22ce;font-size:8px;color:#fff;text-align:center;line-height:10px;font-weight:700;">${i + 1}</div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      }).addTo(layer);
    });

    if (polygon.length >= 2) {
      const pts: [number, number][] = polygon.map((p) => [p.lat, p.lng]);
      if (polygon.length >= 3) pts.push(pts[0]);
      L.polyline(pts, {
        color: "#a855f7",
        weight: 2,
        opacity: 0.8,
        dashArray: polygon.length < 3 ? "6 4" : undefined,
      }).addTo(layer);
    }

    if (polygon.length >= 3) {
      L.polygon(
        polygon.map((p) => [p.lat, p.lng] as [number, number]),
        { color: "#a855f7", weight: 0, fillColor: "#a855f7", fillOpacity: 0.1 },
      ).addTo(layer);
    }
  }, [polygon, isPolygonMode]);

  // When center changes: drop marker, check airspace
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !center) return;

    if (!isPolygonMode) {
      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLatLng([center.lat, center.lng]);
      } else {
        centerMarkerRef.current = L.marker([center.lat, center.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="width:18px;height:18px;border-radius:50%;background:#22d3ee;border:3px solid #0891b2;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
        }).addTo(map);
      }
    } else if (centerMarkerRef.current) {
      centerMarkerRef.current.remove();
      centerMarkerRef.current = null;
    }

    const check = checkLocation(center.lat, center.lng);
    setStatus(check.status);
    setAirspaceWarning(check.status !== "clear" ? check.message : null);
  }, [center, isPolygonMode]);

  // Draw mission path
  useEffect(() => {
    const L = leafletRef.current;
    const layer = pathLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    if (!mission) return;

    const latlngs = mission.waypoints.map((w) => [w.lat, w.lng] as [number, number]);

    L.polyline(latlngs, { color: "#22d3ee", weight: 3, opacity: 0.85 }).addTo(layer);

    mission.waypoints.forEach((w) => {
      L.marker([w.lat, w.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:#0e7490;color:#fff;font-size:10px;font-weight:700;padding:2px 5px;border-radius:10px;border:1.5px solid #22d3ee;white-space:nowrap;">WP${w.index}</div>`,
          iconSize: [0, 0],
        }),
      })
        .bindPopup(
          `<b>WP${w.index}</b><br/>alt ${w.alt}m · head ${Math.round(w.heading)}° · gimbal ${w.gimbalPitch}°<br/>${w.lat.toFixed(6)}, ${w.lng.toFixed(6)}`,
        )
        .addTo(layer);
    });

    if (latlngs.length > 1) {
      mapRef.current?.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
    } else if (latlngs.length === 1) {
      mapRef.current?.setView(latlngs[0], 18);
    }
  }, [mission]);

  const generate = useCallback(async () => {
    if (isPolygonMode) {
      if (polygon.length < 3) {
        setError("Draw at least 3 polygon vertices on the map");
        return;
      }
    } else if (!center) {
      setError("Click the map to set a center point first");
      return;
    }

    const refCenter = isPolygonMode
      ? {
          lat: polygon.reduce((s, p) => s + p.lat, 0) / polygon.length,
          lng: polygon.reduce((s, p) => s + p.lng, 0) / polygon.length,
        }
      : center!;

    setLoading(true);
    setError("");
    const res = await fetch("/api/missions", {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        preset_key: presetKey,
        center_lat: refCenter.lat,
        center_lng: refCenter.lng,
        altitude_m: altitudeM,
        radius_m: radiusM,
        distance_m: distanceM,
        point_count: pointCount,
        speed_ms: speedMs,
        gimbal_pitch: gimbalPitch,
        heading,
        polygon: isPolygonMode ? polygon : undefined,
        format: "json",
      }),
    });
    setLoading(false);
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) {
      const e = await res.json().catch(() => ({ error: "Failed" }));
      setError(e.error || "Failed");
      return;
    }
    const data = await res.json();
    setMission(data.mission);
  }, [authHeader, logout, presetKey, center, polygon, isPolygonMode, altitudeM, radiusM, distanceM, pointCount, speedMs, gimbalPitch, heading]);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(pt);
        mapRef.current?.setView([pt.lat, pt.lng], 17);
      },
      (err) => setError(`Geolocation: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const download = useCallback(
    async (format: "kml" | "csv" | "litchi") => {
      const refCenter = isPolygonMode && polygon.length >= 3
        ? {
            lat: polygon.reduce((s, p) => s + p.lat, 0) / polygon.length,
            lng: polygon.reduce((s, p) => s + p.lng, 0) / polygon.length,
          }
        : center;
      if (!refCenter) return;

      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          preset_key: presetKey,
          center_lat: refCenter.lat,
          center_lng: refCenter.lng,
          altitude_m: altitudeM,
          radius_m: radiusM,
          distance_m: distanceM,
          point_count: pointCount,
          speed_ms: speedMs,
          gimbal_pitch: gimbalPitch,
          heading,
          polygon: isPolygonMode ? polygon : undefined,
          name: missionName || undefined,
          format,
        }),
      });
      if (!res.ok) {
        setError("Download failed");
        return;
      }
      const blob = await res.blob();
      const dispo = res.headers.get("content-disposition") || "";
      const m = dispo.match(/filename="([^"]+)"/);
      const filename = m
        ? m[1]
        : `waevpoint_${presetKey}_${new Date().toISOString().slice(0, 10)}.${format === "litchi" ? "csv" : format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [authHeader, presetKey, center, polygon, isPolygonMode, altitudeM, radiusM, distanceM, pointCount, speedMs, gimbalPitch, heading, missionName],
  );

  const showRadius = preset.geometry === "orbit";
  const showDistance = ["reveal", "dolly", "linear", "grid"].includes(preset.geometry);
  const showPointCount = preset.geometry === "orbit";
  const showHeading = ["reveal", "dolly", "linear", "grid", "polygon_grid"].includes(preset.geometry);

  return (
    <div
      className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#252527] shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] text-white/50 uppercase tracking-wider">Mission planner</span>
          {mission && (
            <span className="text-[10px] text-white/50">
              {mission.waypoints.length} wps · {mission.totalDistanceM}m · ~{Math.floor(mission.estimatedDurationSec / 60)}m {mission.estimatedDurationSec % 60}s
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={locateMe}
            className="text-[11px] text-white/70 hover:text-white border border-white/10 rounded-md px-2 py-1 hover:bg-white/[0.04]"
          >
            ◎ Here
          </button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{error}</div>}

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[300px] md:w-[340px] shrink-0 border-r border-white/[0.06] bg-[#1f1f21] overflow-y-auto">
          <div className="p-3 space-y-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Preset</label>
              <select
                value={presetKey}
                onChange={(e) => setPresetKey(e.target.value)}
                className={inputCls}
              >
                {(["real_estate", "wedding", "commercial", "travel", "photogrammetry"] as const).map((cat) => (
                  <optgroup key={cat} label={cat.replace("_", " ").toUpperCase()} className="bg-neutral-900">
                    {MISSION_PRESETS.filter((p) => p.category === cat).map((p) => (
                      <option key={p.key} value={p.key} className="bg-neutral-900">
                        {p.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-[10px] text-white/40 mt-1.5 leading-snug">{preset.description}</p>
            </div>

            {isPolygonMode ? (
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                  Survey boundary ({polygon.length} vertices)
                </label>
                {polygon.length === 0 ? (
                  <div className="text-[11px] text-purple-400">Click map to draw polygon vertices.</div>
                ) : (
                  <div className="space-y-1">
                    <ul className="text-[10px] text-white/60 font-mono max-h-24 overflow-y-auto space-y-0.5">
                      {polygon.map((p, i) => (
                        <li key={i}>
                          <span className="text-purple-400">V{i + 1}</span> {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setPolygon((prev) => prev.slice(0, -1))}
                        className="text-[10px] text-white/50 hover:text-white border border-white/10 rounded px-2 py-0.5 hover:bg-white/[0.04]"
                      >
                        Undo last
                      </button>
                      <button
                        onClick={() => {
                          setPolygon([]);
                          setMission(null);
                        }}
                        className="text-[10px] text-white/50 hover:text-white border border-white/10 rounded px-2 py-0.5 hover:bg-white/[0.04]"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
                {polygon.length < 3 && polygon.length > 0 && (
                  <div className="text-[10px] text-amber-400 mt-1">Need at least 3 points to form a survey area.</div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Center</label>
                {center ? (
                  <div className="text-[11px] text-cyan-400 font-mono">
                    {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                  </div>
                ) : (
                  <div className="text-[11px] text-white/50">Click the map to set.</div>
                )}
              </div>
            )}

            {status && (
              <div
                className={`text-[10px] ${status === "no_fly" ? "text-red-400" : status === "caution" ? "text-amber-400" : "text-green-400"}`}
              >
                {status === "no_fly" ? "🛑 No-fly" : status === "caution" ? "⚠ Caution" : "✅ Airspace clear"}
                {airspaceWarning && <div className="mt-0.5 text-white/60">{airspaceWarning}</div>}
              </div>
            )}

            {isPolygonMode && (
              <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-2.5 space-y-1">
                <div className="text-[10px] text-purple-400 font-medium uppercase tracking-wider">GSD Preview</div>
                <div className="text-[12px] text-white/90 font-mono">{liveGsd.toFixed(2)} cm/px</div>
                <div className="text-[9px] text-white/50">
                  at {altitudeM}m AGL · 24mm lens · 1&quot; sensor
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <NumField label="Altitude (m AGL)" value={altitudeM} onChange={setAltitudeM} min={5} max={120} />
              <NumField label="Speed (m/s)" value={speedMs} onChange={setSpeedMs} min={0.5} max={15} step={0.5} />
              {showRadius && <NumField label="Radius (m)" value={radiusM} onChange={setRadiusM} min={5} max={200} />}
              {showPointCount && <NumField label="Waypoints" value={pointCount} onChange={setPointCount} min={4} max={24} />}
              {showDistance && <NumField label="Distance (m)" value={distanceM} onChange={setDistanceM} min={10} max={500} />}
              {!isPolygonMode && <NumField label="Gimbal (°)" value={gimbalPitch} onChange={setGimbalPitch} min={-90} max={30} />}
              {showHeading && <NumField label="Heading (°)" value={heading} onChange={setHeading} min={0} max={359} />}
            </div>

            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Mission name (optional)</label>
              <input
                type="text"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                placeholder="e.g. client_casa_blanca_orbit"
                className={inputCls}
              />
            </div>

            <button
              onClick={generate}
              disabled={isPolygonMode ? polygon.length < 3 || loading : !center || loading}
              className="w-full bg-cyan-500 text-black font-semibold rounded-md py-2 text-[12px] hover:bg-cyan-400 disabled:opacity-40"
            >
              {loading ? "Generating…" : isPolygonMode ? "Generate survey grid" : "Generate waypoints"}
            </button>

            {mission?.photogrammetry && (
              <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-2.5 space-y-1.5">
                <div className="text-[10px] text-purple-400 font-medium uppercase tracking-wider">Survey stats</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                  <Stat k="Area" v={`${(mission.photogrammetry.areaM2 / 10000).toFixed(2)} ha`} />
                  <Stat k="GSD" v={`${mission.photogrammetry.gsdCmPx} cm/px`} />
                  <Stat k="Photos" v={`~${mission.photogrammetry.photoCount}`} />
                  <Stat k="Flight lines" v={String(mission.photogrammetry.flightLineCount)} />
                  <Stat k="Photo interval" v={`${mission.photogrammetry.estimatedPhotoIntervalM} m`} />
                  <Stat k="Overlap" v={`${Math.round(mission.photogrammetry.frontOverlap * 100)}% / ${Math.round(mission.photogrammetry.sideOverlap * 100)}%`} />
                </div>
                <div className="text-[9px] text-white/40">
                  Process photos with WebODM/OpenDroneMap for orthomosaic + 3D mesh.
                </div>
              </div>
            )}

            {mission && (
              <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Download</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => download("kml")}
                    className="bg-white/[0.06] hover:bg-white/[0.1] rounded-md py-1.5 text-[11px] text-white/90"
                    title="Google Earth / universal preview"
                  >
                    KML
                  </button>
                  <button
                    onClick={() => download("csv")}
                    className="bg-white/[0.06] hover:bg-white/[0.1] rounded-md py-1.5 text-[11px] text-white/90"
                    title="Waypoint table for manual entry in DJI Fly"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => download("litchi")}
                    className="bg-white/[0.06] hover:bg-white/[0.1] rounded-md py-1.5 text-[11px] text-white/90"
                    title="Litchi mission import"
                  >
                    Litchi
                  </button>
                </div>
                <p className="text-[9px] text-white/40 leading-snug pt-1">
                  KML = preview (Google Earth). CSV = manual entry in DJI Fly Waypoints. Litchi = direct import if you use Litchi app.
                </p>
              </div>
            )}

            {mission && (
              <div className="pt-2 border-t border-white/[0.06]">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Waypoints ({mission.waypoints.length})</div>
                <ul className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                  {mission.waypoints.map((w) => (
                    <li key={w.index} className="text-[10px] text-white/70 font-mono flex gap-2 leading-snug">
                      <span className="text-cyan-400 w-8 shrink-0">WP{w.index}</span>
                      <span>{w.alt}m · {Math.round(w.heading)}° · g{w.gimbalPitch}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 relative">
          <div ref={containerRef} className="absolute inset-0" style={{ background: "#0f1113" }} />

          {isPolygonMode && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-purple-900/80 backdrop-blur text-purple-200 text-[11px] px-3 py-1.5 rounded-full border border-purple-500/30 z-[1000] pointer-events-none">
              Polygon draw mode — click to add vertices
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1.5 text-[11px] text-white outline-none focus:border-cyan-400/50 focus:bg-white/[0.06]";

function NumField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className={inputCls}
      />
    </label>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="text-white/40">{k}</span>
      <span className="text-white/90 font-mono ml-1">{v}</span>
    </div>
  );
}
