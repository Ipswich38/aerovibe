"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";

interface PilotPoint {
  id: string;
  name: string;
  location: string;
  country: string;
  services: string;
  offered_services: string[] | null;
  drones: string;
  specialization: string | null;
  skill_level: string | null;
  available: boolean;
  lat: number;
  lng: number;
}

export default function DeployMap({ spec = "", country = "", compact = false }: { spec?: string; country?: string; compact?: boolean }) {
  const [pilots, setPilots] = useState<PilotPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const layerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const qs = new URLSearchParams();
      if (spec) qs.set("spec", spec);
      if (country) qs.set("country", country);

      const res = await fetch(`/api/pilots/map${qs.toString() ? `?${qs.toString()}` : ""}`);
      const data = await res.json().catch(() => ({ pilots: [] }));
      if (!cancelled) {
        setPilots(Array.isArray(data?.pilots) ? data.pilots : []);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [spec, country]);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        // @ts-expect-error Leaflet default icon fix for Next.js
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(containerRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
        }).setView([12.8797, 121.774], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 18,
        }).addTo(map);
        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
      }

      const map = mapRef.current;
      const layer = layerRef.current;
      if (!map || !layer) return;
      layer.clearLayers();

      const points = pilots.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
      if (!points.length) {
        map.setView([12.8797, 121.774], compact ? 4 : 5);
        return;
      }

      const bounds: [number, number][] = [];
      points.forEach((pilot) => {
        bounds.push([pilot.lat, pilot.lng]);
        L.circleMarker([pilot.lat, pilot.lng], {
          radius: 7,
          color: pilot.available ? "#34d399" : "#fbbf24",
          weight: 2,
          fillColor: pilot.available ? "#34d399" : "#fbbf24",
          fillOpacity: 0.9,
        })
          .addTo(layer)
          .bindPopup(`
            <strong>${pilot.name}</strong><br/>
            ${pilot.location}<br/>
            ${pilot.specialization || "General"}<br/>
            ${pilot.drones || ""}
          `);
      });
      map.fitBounds(bounds, { padding: [24, 24] });
    })();

    return () => {
      cancelled = true;
    };
  }, [pilots, compact]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    },
    [],
  );

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#151517] p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300/80">Live map</p>
          <p className="text-[12px] text-white/45">Approved pilots with coordinates, specialties, and availability.</p>
        </div>
        <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-white/50">
          {loading ? "Loading" : `${pilots.length} pilot${pilots.length === 1 ? "" : "s"}`}
        </div>
      </div>
      <div ref={containerRef} className={compact ? "h-[340px] w-full rounded-2xl overflow-hidden" : "h-[520px] w-full rounded-2xl overflow-hidden"} />
    </div>
  );
}
