"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Drone,
  DRONE_STATUSES,
  FLIGHT_PURPOSES,
  FlightLog,
  FlightPurpose,
  formatDuration,
  minutesBetween,
} from "@/lib/flights";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

type Tab = "flights" | "drones";

interface FlightForm {
  date: string;
  pilot_name: string;
  drone_id: string;
  drone_name: string;
  location: string;
  takeoff_time: string;
  landing_time: string;
  purpose: FlightPurpose;
  weather: string;
  incidents: string;
  notes: string;
  latitude: string;
  longitude: string;
}

function blankFlight(): FlightForm {
  return {
    date: new Date().toISOString().slice(0, 10),
    pilot_name: "",
    drone_id: "",
    drone_name: "",
    location: "",
    takeoff_time: "",
    landing_time: "",
    purpose: "training",
    weather: "",
    incidents: "",
    notes: "",
    latitude: "",
    longitude: "",
  };
}

interface DroneForm {
  name: string;
  model: string;
  serial_number: string;
  caap_registration: string;
  purchased_at: string;
  status: "active" | "maintenance" | "retired";
  notes: string;
}

function blankDrone(): DroneForm {
  return {
    name: "",
    model: "",
    serial_number: "",
    caap_registration: "",
    purchased_at: "",
    status: "active",
    notes: "",
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function FlightsPage() {
  const { token, logout } = useOps();
  const [tab, setTab] = useState<Tab>("flights");
  const [flights, setFlights] = useState<FlightLog[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showFlight, setShowFlight] = useState(false);
  const [editingFlight, setEditingFlight] = useState<string | null>(null);
  const [flightForm, setFlightForm] = useState<FlightForm>(blankFlight());

  const [showDrone, setShowDrone] = useState(false);
  const [editingDrone, setEditingDrone] = useState<string | null>(null);
  const [droneForm, setDroneForm] = useState<DroneForm>(blankDrone());

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [fr, dr] = await Promise.all([
      fetch("/api/flights", { headers: authHeader }),
      fetch("/api/drones", { headers: authHeader }),
    ]);
    if (fr.status === 401 || dr.status === 401) {
      logout();
      return;
    }
    if (fr.ok) setFlights(await fr.json());
    if (dr.ok) setDrones(await dr.json());
    setLoading(false);
  }, [authHeader, logout]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats = useMemo(() => {
    const totalMin = flights.reduce((s, f) => s + (f.duration_minutes || 0), 0);
    const flightCount = flights.length;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthMin = flights
      .filter((f) => f.date.startsWith(thisMonth))
      .reduce((s, f) => s + (f.duration_minutes || 0), 0);
    return { totalMin, flightCount, monthMin };
  }, [flights]);

  function startAddFlight() {
    setFlightForm(blankFlight());
    setEditingFlight(null);
    setShowFlight(true);
  }

  function startEditFlight(f: FlightLog) {
    setFlightForm({
      date: f.date,
      pilot_name: f.pilot_name,
      drone_id: f.drone_id || "",
      drone_name: f.drone_name || "",
      location: f.location,
      takeoff_time: f.takeoff_time || "",
      landing_time: f.landing_time || "",
      purpose: f.purpose,
      weather: f.weather || "",
      incidents: f.incidents || "",
      notes: f.notes || "",
      latitude: f.latitude != null ? String(f.latitude) : "",
      longitude: f.longitude != null ? String(f.longitude) : "",
    });
    setEditingFlight(f.id);
    setShowFlight(true);
  }

  async function saveFlight(e: React.FormEvent) {
    e.preventDefault();
    if (!flightForm.pilot_name.trim() || !flightForm.location.trim()) {
      setError("Pilot and location required");
      return;
    }
    const drone = drones.find((d) => d.id === flightForm.drone_id);
    const lat = flightForm.latitude.trim() ? Number(flightForm.latitude) : null;
    const lng = flightForm.longitude.trim() ? Number(flightForm.longitude) : null;
    if ((lat !== null && !Number.isFinite(lat)) || (lng !== null && !Number.isFinite(lng))) {
      setError("Invalid coordinates");
      return;
    }
    const payload = {
      ...flightForm,
      drone_id: flightForm.drone_id || null,
      drone_name: drone?.name || flightForm.drone_name || null,
      duration_minutes: minutesBetween(flightForm.takeoff_time, flightForm.landing_time),
      latitude: lat,
      longitude: lng,
    };
    const url = editingFlight ? `/api/flights/${editingFlight}` : "/api/flights";
    const method = editingFlight ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Failed to save");
      return;
    }
    setError("");
    setShowFlight(false);
    setEditingFlight(null);
    fetchAll();
  }

  async function deleteFlight(id: string) {
    if (!confirm("Delete this flight log?")) return;
    const res = await fetch(`/api/flights/${id}`, { method: "DELETE", headers: authHeader });
    if (res.ok) fetchAll();
  }

  function startAddDrone() {
    setDroneForm(blankDrone());
    setEditingDrone(null);
    setShowDrone(true);
  }

  function startEditDrone(d: Drone) {
    setDroneForm({
      name: d.name,
      model: d.model || "",
      serial_number: d.serial_number || "",
      caap_registration: d.caap_registration || "",
      purchased_at: d.purchased_at || "",
      status: d.status,
      notes: d.notes || "",
    });
    setEditingDrone(d.id);
    setShowDrone(true);
  }

  async function saveDrone(e: React.FormEvent) {
    e.preventDefault();
    if (!droneForm.name.trim()) {
      setError("Drone name required");
      return;
    }
    const url = editingDrone ? `/api/drones/${editingDrone}` : "/api/drones";
    const method = editingDrone ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(droneForm),
    });
    if (!res.ok) {
      setError("Failed to save");
      return;
    }
    setError("");
    setShowDrone(false);
    setEditingDrone(null);
    fetchAll();
  }

  async function deleteDrone(id: string) {
    if (!confirm("Delete this drone?")) return;
    const res = await fetch(`/api/drones/${id}`, { method: "DELETE", headers: authHeader });
    if (res.ok) fetchAll();
  }

  return (
    <div
      className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#252527] shrink-0 gap-2">
        <div className="flex items-center gap-0.5">
          {(["flights", "drones"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                tab === t ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {t === "flights" ? "Flight Log" : "Drones"}
            </button>
          ))}
        </div>
        <button
          onClick={tab === "flights" ? startAddFlight : startAddDrone}
          className="bg-cyan-500 text-black font-medium rounded-md px-2.5 py-1 text-[11px] hover:bg-cyan-400 transition-colors"
        >
          + {tab === "flights" ? "Log flight" : "Add drone"}
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{error}</div>}

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 md:px-5 py-3 md:py-4 max-w-6xl mx-auto">
          {tab === "flights" && (
            <>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
                <SummaryCard label="Total flights" value={String(stats.flightCount)} color="text-cyan-400" />
                <SummaryCard label="Total time" value={formatDuration(stats.totalMin)} color="text-white" />
                <SummaryCard label="This month" value={formatDuration(stats.monthMin)} color="text-green-400" />
              </div>
              <p className="text-[10px] text-white/40 mb-3">
                CAAP requires a log for every flight. Keep this current.
              </p>

              {showFlight && (
                <form onSubmit={saveFlight} className="mb-4 border border-white/[0.08] rounded-lg bg-[#252527] p-3 md:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-medium">{editingFlight ? "Edit flight" : "New flight log"}</span>
                    <button type="button" onClick={() => setShowFlight(false)} className="text-white/40 hover:text-white/70 text-[12px]">
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Date">
                      <input type="date" required value={flightForm.date} onChange={(e) => setFlightForm({ ...flightForm, date: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Pilot name">
                      <input type="text" required value={flightForm.pilot_name} onChange={(e) => setFlightForm({ ...flightForm, pilot_name: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Drone">
                      <select value={flightForm.drone_id} onChange={(e) => setFlightForm({ ...flightForm, drone_id: e.target.value })} className={inputCls}>
                        <option value="" className="bg-neutral-900">Select / unregistered…</option>
                        {drones.map((d) => (
                          <option key={d.id} value={d.id} className="bg-neutral-900">
                            {d.name} {d.model ? `(${d.model})` : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {!flightForm.drone_id && (
                      <Field label="Drone name (manual)">
                        <input type="text" value={flightForm.drone_name} onChange={(e) => setFlightForm({ ...flightForm, drone_name: e.target.value })} placeholder="e.g. DJI Mini 4 Pro" className={inputCls} />
                      </Field>
                    )}
                    <Field label="Location">
                      <input type="text" required value={flightForm.location} onChange={(e) => setFlightForm({ ...flightForm, location: e.target.value })} placeholder="Barangay, City / GPS" className={inputCls} />
                    </Field>
                    <div className="md:col-span-2 grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                      <Field label="Latitude">
                        <input
                          type="text"
                          value={flightForm.latitude}
                          onChange={(e) => setFlightForm({ ...flightForm, latitude: e.target.value })}
                          placeholder="14.5995"
                          inputMode="decimal"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Longitude">
                        <input
                          type="text"
                          value={flightForm.longitude}
                          onChange={(e) => setFlightForm({ ...flightForm, longitude: e.target.value })}
                          placeholder="120.9842"
                          inputMode="decimal"
                          className={inputCls}
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => {
                          if (!navigator.geolocation) {
                            setError("Geolocation not available in this browser");
                            return;
                          }
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setFlightForm((f) => ({
                                ...f,
                                latitude: pos.coords.latitude.toFixed(6),
                                longitude: pos.coords.longitude.toFixed(6),
                              }));
                              setError("");
                            },
                            (err) => setError(`Geolocation failed: ${err.message}`),
                            { enableHighAccuracy: true, timeout: 10000 },
                          );
                        }}
                        className="bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-white/80 rounded-md px-2.5 py-1.5 border border-white/[0.08] whitespace-nowrap"
                        title="Use current location"
                      >
                        ◎ Use GPS
                      </button>
                    </div>
                    <Field label="Purpose">
                      <select value={flightForm.purpose} onChange={(e) => setFlightForm({ ...flightForm, purpose: e.target.value as FlightPurpose })} className={inputCls}>
                        {FLIGHT_PURPOSES.map((p) => (
                          <option key={p.key} value={p.key} className="bg-neutral-900">{p.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Takeoff">
                      <input type="time" value={flightForm.takeoff_time} onChange={(e) => setFlightForm({ ...flightForm, takeoff_time: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Landing">
                      <input type="time" value={flightForm.landing_time} onChange={(e) => setFlightForm({ ...flightForm, landing_time: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Weather">
                      <input type="text" value={flightForm.weather} onChange={(e) => setFlightForm({ ...flightForm, weather: e.target.value })} placeholder="Clear, 12 km/h wind" className={inputCls} />
                    </Field>
                    <Field label="Incidents">
                      <input type="text" value={flightForm.incidents} onChange={(e) => setFlightForm({ ...flightForm, incidents: e.target.value })} placeholder="None" className={inputCls} />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Notes">
                        <input type="text" value={flightForm.notes} onChange={(e) => setFlightForm({ ...flightForm, notes: e.target.value })} className={inputCls} />
                      </Field>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button type="submit" className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400">
                      {editingFlight ? "Save changes" : "Add flight"}
                    </button>
                    <button type="button" onClick={() => setShowFlight(false)} className="text-[12px] text-white/50 hover:text-white px-3 py-1.5">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#1f1f21]">
                <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider">Flight log</span>
                  <span className="text-[11px] text-white/40">{flights.length}</span>
                </div>
                {loading ? (
                  <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
                ) : flights.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-white/40 text-[12px] mb-3">No flights logged yet.</p>
                    <button onClick={startAddFlight} className="text-cyan-400 text-[12px] hover:text-cyan-300">
                      + Log your first flight
                    </button>
                  </div>
                ) : (
                  <ul>
                    {flights.map((f) => (
                      <li key={f.id} className="border-b border-white/[0.04] last:border-b-0 px-3 py-2 hover:bg-white/[0.02] flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[13px] font-medium">{formatDate(f.date)}</span>
                            <span className="text-[11px] text-white/50">· {f.pilot_name}</span>
                            {f.drone_name && <span className="text-[11px] text-white/50">· {f.drone_name}</span>}
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">· {f.purpose}</span>
                          </div>
                          <div className="text-[11px] text-white/50 truncate">
                            {f.location}
                            {f.takeoff_time && f.landing_time && (
                              <> · {f.takeoff_time}–{f.landing_time} ({formatDuration(f.duration_minutes)})</>
                            )}
                            {f.weather && <> · {f.weather}</>}
                            {f.incidents && <span className="text-amber-400"> · {f.incidents}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button onClick={() => startEditFlight(f)} className="text-white/40 hover:text-white text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Edit">
                            ✎
                          </button>
                          <button onClick={() => deleteFlight(f.id)} className="text-white/40 hover:text-rose-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Delete">
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {tab === "drones" && (
            <>
              {showDrone && (
                <form onSubmit={saveDrone} className="mb-4 border border-white/[0.08] rounded-lg bg-[#252527] p-3 md:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-medium">{editingDrone ? "Edit drone" : "New drone"}</span>
                    <button type="button" onClick={() => setShowDrone(false)} className="text-white/40 hover:text-white/70 text-[12px]">
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Nickname">
                      <input type="text" required value={droneForm.name} onChange={(e) => setDroneForm({ ...droneForm, name: e.target.value })} placeholder="e.g. Blue Jay" className={inputCls} />
                    </Field>
                    <Field label="Model">
                      <input type="text" value={droneForm.model} onChange={(e) => setDroneForm({ ...droneForm, model: e.target.value })} placeholder="DJI Mini 4 Pro" className={inputCls} />
                    </Field>
                    <Field label="Serial number">
                      <input type="text" value={droneForm.serial_number} onChange={(e) => setDroneForm({ ...droneForm, serial_number: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="CAAP registration">
                      <input type="text" value={droneForm.caap_registration} onChange={(e) => setDroneForm({ ...droneForm, caap_registration: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Purchased">
                      <input type="date" value={droneForm.purchased_at} onChange={(e) => setDroneForm({ ...droneForm, purchased_at: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Status">
                      <select value={droneForm.status} onChange={(e) => setDroneForm({ ...droneForm, status: e.target.value as DroneForm["status"] })} className={inputCls}>
                        {DRONE_STATUSES.map((s) => (
                          <option key={s.key} value={s.key} className="bg-neutral-900">{s.label}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Notes">
                        <input type="text" value={droneForm.notes} onChange={(e) => setDroneForm({ ...droneForm, notes: e.target.value })} className={inputCls} />
                      </Field>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button type="submit" className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400">
                      {editingDrone ? "Save changes" : "Add drone"}
                    </button>
                    <button type="button" onClick={() => setShowDrone(false)} className="text-[12px] text-white/50 hover:text-white px-3 py-1.5">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#1f1f21]">
                <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider">Drones</span>
                  <span className="text-[11px] text-white/40">{drones.length}</span>
                </div>
                {loading ? (
                  <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
                ) : drones.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-white/40 text-[12px] mb-3">No drones registered yet.</p>
                    <button onClick={startAddDrone} className="text-cyan-400 text-[12px] hover:text-cyan-300">
                      + Register your first drone
                    </button>
                  </div>
                ) : (
                  <ul>
                    {drones.map((d) => {
                      const meta = DRONE_STATUSES.find((s) => s.key === d.status);
                      const hours = flights
                        .filter((f) => f.drone_id === d.id)
                        .reduce((s, f) => s + (f.duration_minutes || 0), 0);
                      return (
                        <li key={d.id} className="border-b border-white/[0.04] last:border-b-0 px-3 py-2 hover:bg-white/[0.02] flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-[13px] font-medium">{d.name}</span>
                              {d.model && <span className="text-[11px] text-white/50">{d.model}</span>}
                              <span className={`text-[10px] uppercase tracking-wider ${meta?.color || "text-white/40"}`}>
                                · {meta?.label || d.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-white/50 truncate">
                              {d.caap_registration && <>CAAP: {d.caap_registration} · </>}
                              {d.serial_number && <>SN: {d.serial_number} · </>}
                              Total flight time: {formatDuration(hours)}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button onClick={() => startEditDrone(d)} className="text-white/40 hover:text-white text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Edit">
                              ✎
                            </button>
                            <button onClick={() => deleteDrone(d.id)} className="text-white/40 hover:text-rose-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Delete">
                              ✕
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-[12px] text-white outline-none focus:border-cyan-400/50 focus:bg-white/[0.06]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-white/[0.06] rounded-lg bg-[#252527] px-3 py-2.5">
      <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      <div className={`text-[14px] md:text-[16px] font-semibold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}
