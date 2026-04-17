"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { AIRPORTS, CAUTION_RADIUS_KM, FlyCheck, NO_FLY_RADIUS_KM, checkLocation } from "@/lib/geofence";
import { FlightLog } from "@/lib/flights";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

const PH_CENTER: [number, number] = [12.8797, 121.774];
const PH_ZOOM = 6;

export default function MapPage() {
  const { token, logout } = useOps();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const probeMarkerRef = useRef<LeafletNS.Marker | null>(null);
  const flightLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const trackLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const [probe, setProbe] = useState<FlyCheck | null>(null);
  const [flights, setFlights] = useState<FlightLog[]>([]);
  const [loadError, setLoadError] = useState("");
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const handleProbe = useCallback((lat: number, lng: number) => {
    const result = checkLocation(lat, lng);
    setProbe(result);
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (probeMarkerRef.current) {
      probeMarkerRef.current.setLatLng([lat, lng]);
    } else {
      probeMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#22d3ee;border:2px solid #0e7490;box-shadow:0 0 0 4px rgba(34,211,238,0.25);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      }).addTo(map);
    }
    probeMarkerRef.current.bindPopup(
      `<b>${result.status === "no_fly" ? "🛑 No-fly" : result.status === "caution" ? "⚠ Caution" : "✅ Clear"}</b><br/>${result.message}`,
    );
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      if (mapRef.current) return;
      const map = L.map(containerRef.current, {
        center: PH_CENTER,
        zoom: PH_ZOOM,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      for (const a of AIRPORTS) {
        L.circle([a.lat, a.lng], {
          radius: CAUTION_RADIUS_KM * 1000,
          color: "#f59e0b",
          weight: 1,
          opacity: 0.6,
          fill: false,
          dashArray: "4 4",
        }).addTo(map);
        L.circle([a.lat, a.lng], {
          radius: NO_FLY_RADIUS_KM * 1000,
          color: "#ef4444",
          weight: 1.5,
          opacity: 0.8,
          fillColor: "#ef4444",
          fillOpacity: 0.12,
        })
          .bindPopup(
            `<b>${a.name}</b><br/>${a.city} · ${a.class}<br/><span style="color:#ef4444">No-fly: ${NO_FLY_RADIUS_KM}km</span>`,
          )
          .addTo(map);
        L.marker([a.lat, a.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="font-size:16px;line-height:1;">✈</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        })
          .bindTooltip(a.name, { direction: "top", offset: [0, -8] })
          .addTo(map);
      }

      flightLayerRef.current = L.layerGroup().addTo(map);
      trackLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", (e) => handleProbe(e.latlng.lat, e.latlng.lng));
    })().catch((err) => {
      console.error(err);
      setLoadError("Failed to load map");
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      probeMarkerRef.current = null;
      flightLayerRef.current = null;
      trackLayerRef.current = null;
    };
  }, [handleProbe]);

  useEffect(() => {
    fetch("/api/flights", { headers: authHeader })
      .then((r) => {
        if (r.status === 401) {
          logout();
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        if (Array.isArray(data)) setFlights(data);
      })
      .catch(() => {});
  }, [authHeader, logout]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = flightLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    for (const f of flights) {
      if (f.latitude == null || f.longitude == null) continue;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:10px;height:10px;border-radius:50%;background:#84cc16;border:2px solid #365314;box-shadow:0 1px 2px rgba(0,0,0,0.4);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });
      L.marker([f.latitude, f.longitude], { icon })
        .bindPopup(
          `<b>${f.date} · ${f.pilot_name}</b><br/>${f.location}<br/>${f.drone_name || ""} · ${f.purpose}`,
        )
        .on("click", () => loadTrack(f.id))
        .addTo(layer);
    }
  }, [flights]);

  async function loadTrack(flightId: string) {
    const L = leafletRef.current;
    const layer = trackLayerRef.current;
    if (!L || !layer) return;

    if (activeTrack === flightId) {
      layer.clearLayers();
      setActiveTrack(null);
      return;
    }

    try {
      const res = await fetch(`/api/flights/${flightId}`, { headers: authHeader });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data.track) || data.track.length < 2) return;

      layer.clearLayers();
      const points: [number, number][] = data.track.map((p: { latitude: number; longitude: number }) => [p.latitude, p.longitude]);
      L.polyline(points, { color: "#22d3ee", weight: 3, opacity: 0.8 }).addTo(layer);
      mapRef.current?.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
      setActiveTrack(flightId);
    } catch { /* ignore */ }
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setLoadError("Geolocation not available in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.setView([latitude, longitude], 13);
        handleProbe(latitude, longitude);
        setLoadError("");
      },
      (err) => setLoadError(`Geolocation: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const flightsWithCoords = flights.filter((f) => f.latitude != null && f.longitude != null).length;

  return (
    <div
      className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#252527] shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/50 uppercase tracking-wider">Airspace map</span>
          <span className="text-[10px] text-white/40">
            {AIRPORTS.length} aerodromes · {flightsWithCoords}/{flights.length} flights plotted
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={locateMe}
            className="bg-cyan-500 text-black font-medium rounded-md px-2.5 py-1 text-[11px] hover:bg-cyan-400"
          >
            ◎ Locate me
          </button>
        </div>
      </div>

      {loadError && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{loadError}</div>}

      <div className="flex-1 relative">
        <div ref={containerRef} className="absolute inset-0" style={{ background: "#0f1113" }} />

        <div className="absolute top-3 left-3 z-[400] bg-[#1c1c1e]/95 backdrop-blur border border-white/[0.1] rounded-lg p-2.5 w-[240px] text-[11px] leading-relaxed shadow-xl">
          <div className="text-white/50 uppercase tracking-wider text-[10px] mb-1.5">Legend</div>
          <LegendRow color="#ef4444" fill label={`No-fly (${NO_FLY_RADIUS_KM}km)`} />
          <LegendRow color="#f59e0b" label={`Caution (${CAUTION_RADIUS_KM}km)`} />
          <LegendRow color="#84cc16" dot label="Logged flight" />
          <LegendRow color="#22d3ee" dot label="Probe / you" />
          <LegendRow color="#22d3ee" label="Flight track" />
          <p className="text-white/40 text-[10px] mt-2">Click anywhere on the map to check airspace.</p>
        </div>

        {probe && (
          <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-[360px] z-[400] bg-[#1c1c1e]/95 backdrop-blur border border-white/[0.1] rounded-lg p-3 shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  probe.status === "no_fly"
                    ? "text-red-400"
                    : probe.status === "caution"
                      ? "text-amber-400"
                      : "text-green-400"
                }`}
              >
                {probe.status === "no_fly" ? "🛑 No-fly" : probe.status === "caution" ? "⚠ Caution" : "✅ Clear"}
              </span>
              <button
                onClick={() => {
                  setProbe(null);
                  if (probeMarkerRef.current && mapRef.current) {
                    probeMarkerRef.current.remove();
                    probeMarkerRef.current = null;
                  }
                }}
                className="text-white/40 hover:text-white text-[12px]"
                title="Clear"
              >
                ✕
              </button>
            </div>
            <p className="text-[12px] text-white/85">{probe.message}</p>
            <p className="text-[10px] text-white/40 mt-1">
              Nearest: {probe.nearest.name} · {probe.distanceKm.toFixed(2)} km
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendRow({ color, label, fill, dot }: { color: string; label: string; fill?: boolean; dot?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      {dot ? (
        <span
          className="inline-block rounded-full"
          style={{ width: 10, height: 10, background: color, border: `2px solid ${color}` }}
        />
      ) : (
        <span
          className="inline-block rounded-full"
          style={{
            width: 14,
            height: 14,
            border: `1.5px solid ${color}`,
            background: fill ? `${color}22` : "transparent",
          }}
        />
      )}
      <span className="text-white/80">{label}</span>
    </div>
  );
}
