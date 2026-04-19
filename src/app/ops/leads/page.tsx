"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  INDUSTRY_SUGGESTIONS,
  LEAD_STATUSES,
  Lead,
  LeadStatus,
  SearchResult,
  leadStatusMeta,
} from "@/lib/leads";
import { INDUSTRY_OSM_TAGS, PH_LOCATIONS as PH_LOC_OSM } from "@/lib/overpass";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

type Tab = "search" | "saved";
type Source = "places" | "osm";

interface LocationGroup {
  label: string;
  locations: string[];
}

const PH_LOCATION_GROUPS: LocationGroup[] = [
  {
    label: "★ Priority — Bulacan (Region 3)",
    locations: [
      "San Jose del Monte, Bulacan",
      "Meycauayan, Bulacan",
      "Marilao, Bulacan",
      "Bocaue, Bulacan",
      "Sta. Maria, Bulacan",
      "Norzagaray, Bulacan",
      "Malolos, Bulacan",
      "Baliwag, Bulacan",
      "Bulacan (Province-wide)",
    ],
  },
  {
    label: "Region 3 — Central Luzon",
    locations: [
      "Pampanga",
      "Angeles City, Pampanga",
      "Clark Freeport Zone",
      "Tarlac",
      "Nueva Ecija",
      "Zambales",
      "Bataan",
      "Aurora",
    ],
  },
  {
    label: "NCR — Metro Manila",
    locations: [
      "Metro Manila",
      "Quezon City",
      "Makati",
      "BGC / Taguig",
      "Manila City",
      "Pasig",
      "Mandaluyong",
      "Caloocan",
      "Valenzuela",
    ],
  },
  {
    label: "Region 1 — Ilocos",
    locations: ["La Union", "Pangasinan", "Ilocos Norte", "Ilocos Sur / Vigan"],
  },
  {
    label: "Region 2 — Cagayan Valley",
    locations: ["Cagayan", "Isabela", "Nueva Vizcaya"],
  },
  {
    label: "CAR — Cordillera",
    locations: ["Baguio City", "Benguet"],
  },
  {
    label: "Region 4A — CALABARZON",
    locations: ["Cavite", "Laguna", "Batangas", "Rizal", "Quezon Province", "Tagaytay"],
  },
  {
    label: "Region 4B — MIMAROPA",
    locations: ["Palawan", "Puerto Princesa", "Mindoro"],
  },
  {
    label: "Region 5 — Bicol",
    locations: ["Albay / Legazpi", "Camarines Sur / Naga", "Sorsogon"],
  },
  {
    label: "Visayas",
    locations: ["Cebu City", "Cebu (Province-wide)", "Bohol", "Iloilo City", "Boracay", "Bacolod City", "Dumaguete", "Tacloban"],
  },
  {
    label: "Mindanao",
    locations: ["Davao City", "Cagayan de Oro", "General Santos", "Zamboanga City", "Siargao", "Camiguin"],
  },
];

export default function LeadsPage() {
  const { token, logout } = useOps();
  const [tab, setTab] = useState<Tab>("search");

  // Search form
  const [source, setSource] = useState<Source>("osm");
  const [industryKey, setIndustryKey] = useState(INDUSTRY_SUGGESTIONS[0].key);
  const [customIndustry, setCustomIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [pages, setPages] = useState(1);
  const [enrichEmails, setEnrichEmails] = useState(true);

  // Search state
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastQuery, setLastQuery] = useState("");

  // Saved leads
  const [saved, setSaved] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchSaved = useCallback(async () => {
    setSavedLoading(true);
    const q = statusFilter === "all" ? "" : `?status=${statusFilter}`;
    const res = await fetch(`/api/leads${q}`, { headers: authHeader });
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) {
      setSavedError("Failed to load");
      setSavedLoading(false);
      return;
    }
    setSavedError("");
    setSaved(await res.json());
    setSavedLoading(false);
  }, [authHeader, logout, statusFilter]);

  useEffect(() => {
    if (tab === "saved") fetchSaved();
  }, [tab, fetchSaved]);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const industryDef = INDUSTRY_SUGGESTIONS.find((i) => i.key === industryKey);
    const industryLabel =
      industryKey === "custom" ? customIndustry.trim() : industryDef?.label || "";
    const industryQuery =
      industryKey === "custom" ? customIndustry.trim() : industryDef?.query || "";
    const loc = location === "custom" ? customLocation.trim() : location;

    if (!industryQuery) {
      setSearchError("Pick or type an industry");
      return;
    }
    if (source === "osm" && industryKey === "custom") {
      setSearchError("OSM search only supports preset industries. Switch to Google Places for custom.");
      return;
    }
    if (source === "osm" && !INDUSTRY_OSM_TAGS[industryKey]) {
      setSearchError("OSM mapping not available for this industry. Use Google Places.");
      return;
    }

    setSearching(true);
    setSearchError("");
    setResults([]);
    setSelected(new Set());

    let res: Response;
    if (source === "osm") {
      // Map PH location label → OSM location key.
      const osmLoc = PH_LOC_OSM.find((l) => l.label === loc);
      res = await fetch("/api/leads/search-osm", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          industry_key: industryKey,
          industry_label: industryLabel,
          location_key: osmLoc?.key || "",
          location_label: loc,
          enrich_emails: enrichEmails,
          limit: 120,
        }),
      });
    } else {
      res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          industry_label: industryLabel,
          industry_query: industryQuery,
          location: loc,
          pages,
          enrich_emails: enrichEmails,
        }),
      });
    }

    setSearching(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Search failed" }));
      setSearchError(err.error || "Search failed");
      return;
    }
    const data = await res.json();
    setResults(data.leads || []);
    setLastQuery(data.query || "");
    // Select all by default
    setSelected(new Set(data.leads.map((l: SearchResult) => l.google_place_id)));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((r) => r.google_place_id)));
  }

  async function saveSelected() {
    const chosen = results.filter((r) => selected.has(r.google_place_id));
    if (chosen.length === 0) return;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ leads: chosen }),
    });
    if (!res.ok) {
      setSearchError("Failed to save");
      return;
    }
    const data = await res.json();
    alert(`Saved ${data.saved} leads (${data.skipped} duplicates skipped)`);
    setTab("saved");
    fetchSaved();
  }

  async function updateStatus(id: string, status: LeadStatus) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchSaved();
  }

  async function convertLead(id: string) {
    const res = await fetch(`/api/leads/${id}/convert`, {
      method: "POST",
      headers: authHeader,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed" }));
      alert(err.error || "Failed to convert");
      return;
    }
    alert("Converted to contact. Check the Clients tab.");
    fetchSaved();
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE", headers: authHeader });
    if (res.ok) fetchSaved();
  }

  function exportCsv() {
    const rows = saved.map((l) => [
      l.name,
      l.industry,
      l.location || "",
      l.phone || "",
      l.email || "",
      l.website || "",
      l.address || "",
      l.rating || "",
      l.rating_count || "",
      l.status,
    ]);
    const header = [
      "Name",
      "Industry",
      "Location",
      "Phone",
      "Email",
      "Website",
      "Address",
      "Rating",
      "Reviews",
      "Status",
    ];
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waevpoint-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = useMemo(() => {
    return {
      total: saved.length,
      newCount: saved.filter((l) => l.status === "new").length,
      contacted: saved.filter((l) => l.status === "contacted").length,
      converted: saved.filter((l) => l.status === "converted").length,
    };
  }, [saved]);

  return (
    <div
      className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#252527] shrink-0">
        <div className="flex items-center gap-0.5">
          {(["search", "saved"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                tab === t ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {t === "search" ? "Search" : `Saved (${saved.length || "—"})`}
            </button>
          ))}
        </div>
        {tab === "saved" && saved.length > 0 && (
          <button onClick={exportCsv} className="text-[11px] text-white/70 hover:text-white border border-white/10 rounded-md px-2 py-1 hover:bg-white/[0.04]">
            Export CSV
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 md:px-5 py-3 md:py-4 max-w-6xl mx-auto">
          {tab === "search" && (
            <>
              <form onSubmit={runSearch} className="border border-white/[0.08] rounded-lg bg-[#252527] p-3 md:p-4 mb-4">
                <div className="mb-3">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Source</span>
                  <div className="inline-flex rounded-md border border-white/[0.08] overflow-hidden text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSource("osm")}
                      className={`px-3 py-1.5 transition-colors ${
                        source === "osm" ? "bg-emerald-500/20 text-emerald-300" : "text-white/60 hover:text-white"
                      }`}
                    >
                      🆓 OSM (free)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSource("places")}
                      className={`px-3 py-1.5 border-l border-white/[0.08] transition-colors ${
                        source === "places" ? "bg-blue-500/20 text-blue-300" : "text-white/60 hover:text-white"
                      }`}
                    >
                      💳 Google Places
                    </button>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1.5">
                    {source === "osm"
                      ? "OpenStreetMap + Jina Reader email scrape. Free, no API key. Lower coverage but zero cost."
                      : "Google Places API. Higher coverage, uses your paid quota."}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Industry">
                    <select value={industryKey} onChange={(e) => setIndustryKey(e.target.value)} className={inputCls}>
                      {INDUSTRY_SUGGESTIONS.map((i) => (
                        <option key={i.key} value={i.key} className="bg-neutral-900">{i.label}</option>
                      ))}
                      <option value="custom" className="bg-neutral-900">Custom…</option>
                    </select>
                  </Field>
                  {industryKey === "custom" && (
                    <Field label="Custom industry">
                      <input
                        type="text"
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        placeholder="e.g. dive shops, yoga studios"
                        className={inputCls}
                      />
                    </Field>
                  )}
                  <Field label="Location">
                    <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls}>
                      <option value="" className="bg-neutral-900">Nationwide (Philippines)</option>
                      {PH_LOCATION_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.locations.map((l) => (
                            <option key={l} value={l} className="bg-neutral-900">{l}</option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="custom" className="bg-neutral-900">Custom…</option>
                    </select>
                  </Field>
                  {location === "custom" && (
                    <Field label="Custom location">
                      <input
                        type="text"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="e.g. Dumaguete, Siquijor"
                        className={inputCls}
                      />
                    </Field>
                  )}
                  {source === "places" && (
                    <Field label="Depth (pages × 20 results)">
                      <select value={pages} onChange={(e) => setPages(Number(e.target.value))} className={inputCls}>
                        <option value={1} className="bg-neutral-900">1 page — up to 20</option>
                        <option value={2} className="bg-neutral-900">2 pages — up to 40</option>
                        <option value={3} className="bg-neutral-900">3 pages — up to 60 (max)</option>
                      </select>
                    </Field>
                  )}
                  <label className="flex items-center gap-2 text-[12px] text-white/70 self-end pb-1.5">
                    <input type="checkbox" checked={enrichEmails} onChange={(e) => setEnrichEmails(e.target.checked)} />
                    Scrape emails from websites
                  </label>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={searching}
                    className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400 disabled:opacity-50"
                  >
                    {searching ? "Searching…" : "Find prospects"}
                  </button>
                  <p className="text-[11px] text-white/40">
                    Results with no phone or email are excluded automatically.
                  </p>
                </div>
              </form>

              {searchError && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-2 rounded mb-3">{searchError}</div>}

              {results.length > 0 && (
                <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#1f1f21] mb-4">
                  <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] text-white/50 uppercase tracking-wider">Results</span>
                      <span className="text-[11px] text-white/40 ml-2">{results.length} prospects · {lastQuery}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={toggleAll} className="text-[11px] text-white/70 hover:text-white px-2 py-1">
                        {selected.size === results.length ? "Deselect all" : "Select all"}
                      </button>
                      <button
                        onClick={saveSelected}
                        disabled={selected.size === 0}
                        className="bg-cyan-500 text-black font-medium rounded-md px-3 py-1 text-[11px] hover:bg-cyan-400 disabled:opacity-40"
                      >
                        Save {selected.size} leads
                      </button>
                    </div>
                  </div>
                  <ul>
                    {results.map((r) => {
                      const isSel = selected.has(r.google_place_id);
                      return (
                        <li
                          key={r.google_place_id}
                          onClick={() => toggleSelect(r.google_place_id)}
                          className={`border-b border-white/[0.04] last:border-b-0 px-3 py-2 cursor-pointer hover:bg-white/[0.02] flex items-start gap-3 ${
                            isSel ? "bg-cyan-500/[0.04]" : ""
                          }`}
                        >
                          <input type="checkbox" checked={isSel} readOnly className="mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-[13px] font-medium">{r.name}</span>
                              {r.rating && (
                                <span className="text-[10px] text-amber-300">★ {r.rating} ({r.rating_count})</span>
                              )}
                            </div>
                            <div className="text-[11px] text-white/50 truncate">{r.address || "—"}</div>
                            <div className="text-[11px] text-white/80 mt-0.5 flex items-center gap-3 flex-wrap">
                              {r.phone && <span>📞 {r.phone}</span>}
                              {r.email && <span className="text-cyan-400">✉ {r.email}</span>}
                              {r.website && (
                                <a
                                  href={r.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-300 hover:underline"
                                >
                                  🌐 site
                                </a>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {!searching && results.length === 0 && !searchError && (
                <div className="text-center py-10 text-white/40 text-[12px]">
                  Pick an industry and location, then hit Find prospects.
                </div>
              )}
            </>
          )}

          {tab === "saved" && (
            <>
              <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4">
                <SummaryCard label="Total" value={String(stats.total)} color="text-white" />
                <SummaryCard label="New" value={String(stats.newCount)} color="text-cyan-400" />
                <SummaryCard label="Contacted" value={String(stats.contacted)} color="text-blue-400" />
                <SummaryCard label="Converted" value={String(stats.converted)} color="text-green-400" />
              </div>

              <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                {(["all", ...LEAD_STATUSES.map((s) => s.key)] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setStatusFilter(k as "all" | LeadStatus)}
                    className={`px-2 py-1 rounded text-[11px] transition-colors shrink-0 ${
                      statusFilter === k ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {k === "all" ? "All" : leadStatusMeta(k).label}
                  </button>
                ))}
              </div>

              {savedError && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-2 rounded mb-3">{savedError}</div>}

              <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#1f1f21]">
                <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider">Phone book</span>
                  <span className="text-[11px] text-white/40">{saved.length}</span>
                </div>
                {savedLoading ? (
                  <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
                ) : saved.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-white/40 text-[12px] mb-3">No leads saved yet.</p>
                    <button onClick={() => setTab("search")} className="text-cyan-400 text-[12px] hover:text-cyan-300">
                      → Go find some prospects
                    </button>
                  </div>
                ) : (
                  <ul>
                    {saved.map((l) => {
                      const s = leadStatusMeta(l.status);
                      return (
                        <li key={l.id} className="border-b border-white/[0.04] last:border-b-0 px-3 py-2 hover:bg-white/[0.02] flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-[13px] font-medium">{l.name}</span>
                              <span className="text-[10px] text-white/40 uppercase">{l.industry}</span>
                              {l.rating && (
                                <span className="text-[10px] text-amber-300">★ {l.rating} ({l.rating_count})</span>
                              )}
                              <span className={`text-[10px] uppercase tracking-wider ${s.color}`}>· {s.label}</span>
                            </div>
                            <div className="text-[11px] text-white/50 truncate">{l.address || l.location || "—"}</div>
                            <div className="text-[11px] text-white/80 mt-0.5 flex items-center gap-3 flex-wrap">
                              {l.phone && (
                                <a href={`tel:${l.phone}`} className="hover:text-cyan-400">📞 {l.phone}</a>
                              )}
                              {l.email && (
                                <a href={`mailto:${l.email}`} className="text-cyan-400 hover:underline">✉ {l.email}</a>
                              )}
                              {l.website && (
                                <a href={l.website} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">🌐 site</a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <select
                              value={l.status}
                              onChange={(e) => updateStatus(l.id, e.target.value as LeadStatus)}
                              className="bg-transparent border border-white/10 rounded text-[10px] text-white/70 px-1 py-0.5 outline-none hover:border-white/20"
                            >
                              {LEAD_STATUSES.map((st) => (
                                <option key={st.key} value={st.key} className="bg-neutral-900">{st.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => convertLead(l.id)}
                              disabled={l.status === "converted"}
                              title="Convert to contact"
                              className="text-white/40 hover:text-green-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06] disabled:opacity-30"
                            >
                              →CRM
                            </button>
                            <button
                              onClick={() => deleteLead(l.id)}
                              className="text-white/40 hover:text-rose-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]"
                              title="Delete"
                            >
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
