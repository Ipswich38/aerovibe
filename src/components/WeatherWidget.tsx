"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface W {
  temperature: number; feelsLike: number; humidity: number;
  windSpeed: number; windGusts: number; windDir: number;
  code: number; cloudCover: number; precip: number;
  uvIndex: number; visibility: number; pressure: number;
}
interface SavedLocation { id: string; label: string; lat: number; lon: number; }
interface SearchResult  { id: string; label: string; lat: number; lon: number; }

// ── WMO & helpers ─────────────────────────────────────────────────────────────
const WMO: Record<number, { label: string; icon: string }> = {
  0:  { label: "Clear Sky",      icon: "☀️" },
  1:  { label: "Mainly Clear",   icon: "🌤️" },
  2:  { label: "Partly Cloudy",  icon: "⛅" },
  3:  { label: "Overcast",       icon: "☁️" },
  45: { label: "Foggy",          icon: "🌫️" },
  48: { label: "Foggy",          icon: "🌫️" },
  51: { label: "Light Drizzle",  icon: "🌦️" },
  53: { label: "Drizzle",        icon: "🌦️" },
  55: { label: "Heavy Drizzle",  icon: "🌦️" },
  61: { label: "Light Rain",     icon: "🌧️" },
  63: { label: "Rain",           icon: "🌧️" },
  65: { label: "Heavy Rain",     icon: "🌧️" },
  80: { label: "Rain Showers",   icon: "🌦️" },
  81: { label: "Rain Showers",   icon: "🌦️" },
  82: { label: "Heavy Showers",  icon: "⛈️" },
  95: { label: "Thunderstorm",   icon: "⛈️" },
  96: { label: "Thunderstorm",   icon: "⛈️" },
  99: { label: "Thunderstorm",   icon: "⛈️" },
};
function wmoInfo(code: number) { return WMO[code] ?? { label: "Variable", icon: "🌡️" }; }
function compassDir(deg: number) {
  const d = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return d[Math.round(deg / 22.5) % 16];
}
function flyStatus(w: W) {
  const bad     = w.precip > 0.4 || w.windGusts > 45 || w.windSpeed > 35 || w.visibility < 3000;
  const caution = w.windGusts > 28 || w.windSpeed > 20 || w.cloudCover > 80;
  if (bad) return { label: "No-Fly Conditions", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", desc: "Wind, precipitation, or visibility exceeds safe operational thresholds." };
  if (caution) return { label: "Fly with Caution", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", desc: "Monitor conditions closely. Stay within visual line of sight." };
  return { label: "Good to Fly", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", desc: "Conditions are favorable for drone operations." };
}
function buildChecklist(w: W) {
  const items: { text: string; warn: boolean }[] = [];
  if (w.precip > 0)           items.push({ text: "Precipitation detected. Drones may not be waterproof.", warn: true });
  if (w.windGusts > 28)       items.push({ text: `Gusts at ${w.windGusts} km/h. Watch for unexpected drift.`, warn: true });
  if (w.windSpeed > 20)       items.push({ text: `Wind ${w.windSpeed} km/h ${compassDir(w.windDir)}. Plan RTH altitude above obstacles.`, warn: true });
  if (w.visibility < 5000)    items.push({ text: `Visibility ${(w.visibility/1000).toFixed(1)} km. Confirm VLOS is maintainable.`, warn: true });
  if (w.code >= 45 && w.code <= 48) items.push({ text: "Foggy conditions. Vision sensors may be impaired.", warn: true });
  if (w.temperature < 5)      items.push({ text: `${w.temperature}°C. Hover briefly to warm battery before full flight.`, warn: true });
  if (w.uvIndex >= 6)         items.push({ text: `UV Index ${w.uvIndex}. Wear protection for extended outdoor ops.`, warn: false });
  items.push({ text: "Check airspace on DJI Fly, UAVforecast, or CAAP SafeFly.", warn: false });
  items.push({ text: "Inspect props. No chips, cracks, or loose mounts.", warn: false });
  items.push({ text: "Verify battery charge and temperature within spec.", warn: false });
  items.push({ text: "CAAP documents accessible (COA, RPC, Certificate of Registration).", warn: false });
  items.push({ text: "Set RTH altitude above all obstacles in the area.", warn: false });
  return items;
}

async function fetchWeather(lat: number, lon: number): Promise<W> {
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,` +
    `weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,` +
    `uv_index,visibility,surface_pressure&wind_speed_unit=kmh&timezone=auto`,
  );
  const d = await r.json(); const c = d.current;
  return {
    temperature: Math.round(c.temperature_2m), feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m, windSpeed: Math.round(c.wind_speed_10m),
    windGusts: Math.round(c.wind_gusts_10m), windDir: c.wind_direction_10m,
    code: c.weather_code, cloudCover: c.cloud_cover, precip: c.precipitation,
    uvIndex: Math.round(c.uv_index ?? 0), visibility: c.visibility,
    pressure: Math.round(c.surface_pressure),
  };
}
async function reverseGeocode(lat: number, lon: number) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { "Accept-Language": "en" } });
    const d = await r.json(); const a = d.address ?? {};
    return { city: a.city ?? a.town ?? a.municipality ?? a.county ?? "My Location", area: a.state ?? a.region ?? "" };
  } catch { return { city: "My Location", area: "" }; }
}
async function searchLocations(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return [];
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await r.json();
    return data.map((item: Record<string, unknown>) => {
      const a = (item.address as Record<string, string>) ?? {};
      const city = a.city ?? a.town ?? a.village ?? a.municipality ?? String(item.name ?? "");
      const label = [city, a.state ?? a.country].filter(Boolean).join(", ");
      return { id: `s-${item.place_id}`, label, lat: parseFloat(String(item.lat)), lon: parseFloat(String(item.lon)) };
    });
  } catch { return []; }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CYCLE_MS  = 3000;
const METRICS   = (w: W) => [
  { text: `${w.temperature}°C`, sub: wmoInfo(w.code).icon },
  { text: `${w.windSpeed} km/h`, sub: "💨" },
  { text: `↑${w.windGusts} km/h`, sub: "🌬️" },
  { text: `${w.humidity}%`, sub: "💧" },
];
const DEFAULT_LOCS: SavedLocation[] = [{ id: "manila", label: "Manila", lat: 14.5995, lon: 120.9842 }];
const LS_LOCS   = "wv-locs";
const LS_ACTIVE = "wv-active";

// ── Component ─────────────────────────────────────────────────────────────────
export function WeatherWidget() {
  const [locs,      setLocsState]   = useState<SavedLocation[]>(DEFAULT_LOCS);
  const [activeId,  setActiveIdState] = useState<string>(DEFAULT_LOCS[0].id);
  const [ready,     setReady]       = useState(false);
  const [w,         setW]           = useState<W | null>(null);
  const [wLoading,  setWLoading]    = useState(true);
  const [open,      setOpen]        = useState(false);
  const [tick,      setTick]        = useState(0);
  const [fade,      setFade]        = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ,   setSearchQ]     = useState("");
  const [results,   setResults]     = useState<SearchResult[]>([]);
  const [searching, setSearching]   = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Persisted setters
  const setLocs = useCallback((v: SavedLocation[]) => {
    setLocsState(v);
    try { localStorage.setItem(LS_LOCS, JSON.stringify(v)); } catch {}
  }, []);
  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    try { localStorage.setItem(LS_ACTIVE, id); } catch {}
  }, []);

  // ── Init: load from localStorage or detect GPS ────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_LOCS);
      const saved: SavedLocation[] | null = raw ? JSON.parse(raw) : null;
      if (saved && saved.length > 0) {
        setLocsState(saved);
        const active = localStorage.getItem(LS_ACTIVE);
        setActiveIdState(active && saved.find(l => l.id === active) ? active : saved[0].id);
        setReady(true);
        return;
      }
    } catch {}
    // First visit: try GPS
    if (!navigator.geolocation) { setReady(true); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const geo = await reverseGeocode(lat, lon);
        const gps: SavedLocation = { id: "gps", label: `${geo.city}${geo.area ? ", " + geo.area : ""}`, lat, lon };
        setLocsState([gps]); setActiveIdState("gps");
        try { localStorage.setItem(LS_LOCS, JSON.stringify([gps])); localStorage.setItem(LS_ACTIVE, "gps"); } catch {}
        setReady(true);
      },
      () => setReady(true),
      { timeout: 8000 },
    );
  }, []);

  const activeLoc = locs.find(l => l.id === activeId) ?? locs[0];

  // ── Fetch weather when activeId or ready changes ──────────────────────────
  useEffect(() => {
    if (!ready || !activeLoc) return;
    let live = true;
    setW(null); setWLoading(true);
    fetchWeather(activeLoc.lat, activeLoc.lon)
      .then(d => { if (live) setW(d); })
      .catch(() => {})
      .finally(() => { if (live) setWLoading(false); });
    const interval = setInterval(() => {
      fetchWeather(activeLoc.lat, activeLoc.lon).then(d => { if (live) setW(d); }).catch(() => {});
    }, 10 * 60_000);
    return () => { live = false; clearInterval(interval); };
  }, [ready, activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cycle pill metric ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!w) return;
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => { setTick(t => t + 1); setFade(true); }, 220);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [w]);

  // ── Close panel on outside click / Escape ─────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const oc = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false); };
    const ok = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", oc);
    document.addEventListener("keydown", ok);
    return () => { document.removeEventListener("mousedown", oc); document.removeEventListener("keydown", ok); };
  }, [open]);

  // ── Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const found = await searchLocations(searchQ);
      setResults(found.filter(r => !locs.some(l => Math.abs(l.lat - r.lat) < 0.05 && Math.abs(l.lon - r.lon) < 0.05)));
      setSearching(false);
    }, 450);
    return () => clearTimeout(t);
  }, [searchQ, locs]);

  // ── Location CRUD ─────────────────────────────────────────────────────────
  function addLocation(loc: SearchResult) {
    if (locs.length >= 3) return;
    const newLoc: SavedLocation = { ...loc, id: `loc-${Date.now()}` };
    const next = [...locs, newLoc];
    setLocs(next); setActiveId(newLoc.id);
    setShowSearch(false); setSearchQ(""); setResults([]);
  }
  function removeLocation(id: string) {
    if (locs.length <= 1) return;
    const next = locs.filter(l => l.id !== id);
    setLocs(next);
    if (activeId === id) setActiveId(next[0].id);
  }
  function addGps() {
    if (!navigator.geolocation || locs.length >= 3) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      const geo = await reverseGeocode(lat, lon);
      addLocation({ id: "gps-new", label: `${geo.city}${geo.area ? ", " + geo.area : ""}`, lat, lon });
    }, () => {}, { timeout: 8000 });
  }
  function cancelSearch() { setShowSearch(false); setSearchQ(""); setResults([]); }

  // ── Render ────────────────────────────────────────────────────────────────
  if (wLoading && !w) return (
    <button disabled className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
      <span className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
      <span className="text-white/25 font-medium">Weather</span>
    </button>
  );
  if (!w) return null;

  const fly      = flyStatus(w);
  const { icon, label } = wmoInfo(w.code);
  const cycles   = METRICS(w);
  const curr     = cycles[tick % cycles.length];
  const checklist = buildChecklist(w);
  const stats = [
    { label: "Wind",          value: `${w.windSpeed} km/h`,         sub: compassDir(w.windDir) },
    { label: "Gusts",         value: `${w.windGusts} km/h`,         sub: "peak" },
    { label: "Humidity",      value: `${w.humidity}%`,               sub: "relative" },
    { label: "Visibility",    value: `${(w.visibility/1000).toFixed(1)} km`, sub: "horizontal" },
    { label: "Pressure",      value: `${w.pressure} hPa`,           sub: "surface" },
    { label: "UV Index",      value: `${w.uvIndex}`,                 sub: w.uvIndex < 3 ? "Low" : w.uvIndex < 6 ? "Moderate" : "High" },
    { label: "Cloud Cover",   value: `${w.cloudCover}%`,            sub: "sky" },
    { label: "Precipitation", value: `${w.precip.toFixed(1)} mm`,   sub: "this hour" },
  ];

  return (
    <div className="relative">
      {/* ── Pill ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Live weather. Tap for full details"
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
        style={{
          background: open ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${open ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)"}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="h-1.5 w-1.5 flex-none rounded-full animate-pulse" style={{ background: fly.color }} />
        <span className="flex items-center gap-1.5 transition-opacity duration-200" style={{ opacity: fade ? 1 : 0 }}>
          <span>{curr.sub}</span>
          <span className="font-semibold text-white">{curr.text}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)" }}>|</span>
        <span style={{ color: "rgba(255,255,255,0.50)" }}>{activeLoc?.label?.split(",")[0] ?? "Weather"}</span>
      </button>

      {/* ── Popup ── */}
      {open && (
        <>
          <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Weather and pre-flight check"
            className="absolute right-0 top-[calc(100%+12px)] z-[201] w-[380px] rounded-[26px] overflow-y-auto"
            style={{
              background: "rgba(18,18,20,0.96)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 2px 16px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.12)",
              backdropFilter: "blur(40px) saturate(180%)",
              maxHeight: "88vh",
              animation: "wv-weather-in 0.28s cubic-bezier(0.34,1.38,0.64,1) both",
            }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Live Weather</p>
                <p className="text-[14px] font-semibold text-white leading-tight mt-0.5">{activeLoc?.label ?? "Loading…"}</p>
              </div>
              <button
                onClick={() => setOpen(false)} aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors shrink-0"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.50)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l6 6M8 2L2 8"/></svg>
              </button>
            </div>

            {/* ── Location tabs ── */}
            <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
              {locs.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => setActiveId(loc.id)}
                  className="flex items-center gap-1 rounded-full text-[11px] font-medium cursor-pointer select-none transition-all"
                  style={
                    activeId === loc.id
                      ? { background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.24)", color: "#fff", padding: "3px 10px" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", padding: "3px 10px" }
                  }
                >
                  {loc.label.split(",")[0]}
                  {locs.length > 1 && (
                    <span
                      onClick={e => { e.stopPropagation(); removeLocation(loc.id); }}
                      className="ml-1 text-[13px] leading-none opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
                      aria-label={`Remove ${loc.label}`}
                    >×</span>
                  )}
                </div>
              ))}
              {locs.length < 3 && !showSearch && (
                <button
                  onClick={() => setShowSearch(true)} aria-label="Add location"
                  className="flex items-center justify-center h-[26px] w-[26px] rounded-full text-[16px] leading-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.40)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.80)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.40)"; }}
                >+</button>
              )}
            </div>

            {/* ── Search panel ── */}
            {showSearch && (
              <div className="px-5 pb-4">
                <div className="relative">
                  <input
                    value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search city or area…" autoFocus
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none pr-8"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }}
                  />
                  <button onClick={cancelSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[17px] leading-none transition-colors" style={{ color: "rgba(255,255,255,0.30)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.70)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.30)")}
                    aria-label="Cancel">×</button>
                </div>
                <button
                  onClick={addGps}
                  className="mt-2.5 flex items-center gap-1.5 text-[12px] transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.70)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="2.5"/><line x1="6" y1="0.5" x2="6" y2="2.5"/><line x1="6" y1="9.5" x2="6" y2="11.5"/><line x1="0.5" y1="6" x2="2.5" y2="6"/><line x1="9.5" y1="6" x2="11.5" y2="6"/></svg>
                  Use my GPS location
                </button>
                {searching && <p className="mt-2 text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>Searching…</p>}
                {results.length > 0 && (
                  <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
                    {results.slice(0, 5).map((r, i) => (
                      <button key={r.id} onClick={() => addLocation(r)}
                        className="w-full text-left px-3.5 py-2.5 text-[13px] transition-colors"
                        style={{ color: "rgba(255,255,255,0.72)", borderBottom: i < results.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", background: "transparent" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >{r.label}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 20px" }} />

            {/* Hero */}
            <div className="flex items-center gap-4 px-5 pt-4 pb-4">
              <span className="text-[52px] leading-none select-none">{icon}</span>
              <div>
                <p className="text-[44px] font-black leading-none tracking-tight text-white">
                  {w.temperature}°<span className="text-[22px] font-semibold text-white/35">C</span>
                </p>
                <p className="mt-0.5 text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>{label} · Feels {w.feelsLike}°C</p>
              </div>
            </div>

            {/* Fly status */}
            <div className="mx-5 mb-4 flex items-start gap-3 rounded-2xl px-4 py-3"
              style={{ background: fly.bg, border: `1px solid ${fly.border}` }}>
              <span className="mt-[3px] h-2 w-2 flex-none rounded-full animate-pulse" style={{ background: fly.color }} />
              <div>
                <p className="text-[13px] font-bold leading-tight" style={{ color: fly.color }}>{fly.label}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: "rgba(255,255,255,0.40)" }}>{fly.desc}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mx-5 mb-4 grid grid-cols-2 gap-2">
              {stats.map(({ label: l, value, sub }) => (
                <div key={l} className="rounded-2xl px-3.5 py-3"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{l}</p>
                  <p className="mt-1 text-[16px] font-black leading-none text-white">{value}</p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="mx-5 mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>Pre-Flight Checklist</p>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5"
                    style={{
                      borderBottom: i < checklist.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      background: item.warn ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)",
                    }}>
                    <div className="mt-[2px] h-4 w-4 flex-none rounded flex items-center justify-center text-[9px] shrink-0"
                      style={item.warn
                        ? { background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.30)", color: "#f59e0b" }
                        : { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
                      {item.warn ? "!" : "✓"}
                    </div>
                    <p className="text-[12px] leading-snug" style={{ color: item.warn ? "rgba(245,158,11,0.85)" : "rgba(255,255,255,0.55)" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.20)" }}>Open-Meteo · updates every 10 min</p>
              {activeLoc && (
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.20)" }}>
                  {activeLoc.lat.toFixed(2)}°N {activeLoc.lon.toFixed(2)}°E
                </p>
              )}
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes wv-weather-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
