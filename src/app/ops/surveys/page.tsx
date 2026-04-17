"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

interface Survey {
  id: string;
  project_id: string | null;
  title: string;
  status: string;
  survey_type: string;
  photo_count: number;
  area_m2: number | null;
  gsd_cm_px: number | null;
  altitude_m: number | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  polygon: unknown | null;
  odm_task_id: string | null;
  orthomosaic_url: string | null;
  dsm_url: string | null;
  model_3d_url: string | null;
  report_url: string | null;
  processing_started_at: string | null;
  processing_finished_at: string | null;
  error_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SurveyForm {
  title: string;
  survey_type: "2d" | "3d";
  photo_count: string;
  area_m2: string;
  gsd_cm_px: string;
  altitude_m: string;
  location: string;
  notes: string;
}

function blankForm(): SurveyForm {
  return {
    title: "",
    survey_type: "2d",
    photo_count: "0",
    area_m2: "",
    gsd_cm_px: "",
    altitude_m: "",
    location: "",
    notes: "",
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-white/10 text-white/70",
  uploading: "bg-blue-500/20 text-blue-300",
  processing: "bg-amber-500/20 text-amber-300",
  complete: "bg-green-500/20 text-green-300",
  failed: "bg-red-500/20 text-red-300",
};

export default function SurveysPage() {
  const { token, logout } = useOps();
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SurveyForm>(blankForm());
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/surveys", { headers: authHeader });
    if (res.status === 401) {
      logout();
      return;
    }
    if (res.ok) setSurveys(await res.json());
    setLoading(false);
  }, [authHeader, logout]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Auto-poll processing surveys every 10s
  useEffect(() => {
    const hasProcessing = surveys.some((s) => s.status === "processing");
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      surveys
        .filter((s) => s.status === "processing")
        .forEach((s) => checkProcessingStatus(s.id));
    }, 10_000);
    return () => clearInterval(interval);
  }, [surveys]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createSurvey(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title required");
      return;
    }
    setError("");
    const payload = {
      title: form.title,
      survey_type: form.survey_type,
      photo_count: Number(form.photo_count) || 0,
      area_m2: form.area_m2 ? Number(form.area_m2) : null,
      gsd_cm_px: form.gsd_cm_px ? Number(form.gsd_cm_px) : null,
      altitude_m: form.altitude_m ? Number(form.altitude_m) : null,
      location: form.location || null,
      notes: form.notes || null,
    };
    const res = await fetch("/api/surveys", {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Failed to create survey");
      return;
    }
    setToast("Survey created");
    setShowForm(false);
    setForm(blankForm());
    fetchSurveys();
  }

  async function triggerProcess(surveyId: string) {
    setToast("");
    setError("");
    const res = await fetch(`/api/surveys/${surveyId}/process`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Processing failed to start");
      return;
    }
    setToast(`Processing started — task ${data.task_id}`);
    fetchSurveys();
  }

  async function checkProcessingStatus(surveyId: string) {
    const res = await fetch(`/api/surveys/${surveyId}/status`, { headers: authHeader });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Status check failed");
      return;
    }
    const data = await res.json();
    if (data.status === "complete") {
      setToast("Processing complete — outputs ready!");
    } else if (data.status === "failed") {
      setError(`Processing failed: ${data.error || "unknown"}`);
    } else {
      setToast(`Processing: ${Math.round(data.progress || 0)}% complete`);
    }
    fetchSurveys();
  }

  return (
    <div
      className="h-full overflow-auto text-white"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-semibold">Surveys</h1>
            <p className="text-white/40 text-[12px] mt-0.5">
              Photogrammetry jobs — upload geotagged photos, process with WebODM.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setForm(blankForm());
            }}
            className="bg-cyan-500 text-black font-medium rounded-md px-3 py-1.5 text-[12px] hover:bg-cyan-400"
          >
            + New survey
          </button>
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

        {showForm && (
          <form onSubmit={createSurvey} className="mb-5 rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block col-span-2">
                <span className="block text-[11px] text-white/50 mb-1">Title *</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Casa Blanca Site Survey"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] text-white/50 mb-1">Type</span>
                <select
                  value={form.survey_type}
                  onChange={(e) => setForm({ ...form, survey_type: e.target.value as "2d" | "3d" })}
                  className={inputCls}
                >
                  <option value="2d" className="bg-[#1c1c1e]">2D — Orthomosaic + DSM</option>
                  <option value="3d" className="bg-[#1c1c1e]">3D — Orthomosaic + 3D Mesh</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-[11px] text-white/50 mb-1">Photo count</span>
                <input
                  type="number"
                  value={form.photo_count}
                  onChange={(e) => setForm({ ...form, photo_count: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] text-white/50 mb-1">Area (m²)</span>
                <input
                  type="number"
                  value={form.area_m2}
                  onChange={(e) => setForm({ ...form, area_m2: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] text-white/50 mb-1">GSD (cm/px)</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.gsd_cm_px}
                  onChange={(e) => setForm({ ...form, gsd_cm_px: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] text-white/50 mb-1">Altitude (m)</span>
                <input
                  type="number"
                  value={form.altitude_m}
                  onChange={(e) => setForm({ ...form, altitude_m: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="block text-[11px] text-white/50 mb-1">Location</span>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="block col-span-2">
                <span className="block text-[11px] text-white/50 mb-1">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className={inputCls + " resize-none"}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400"
              >
                Create survey
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[12px] text-white/60 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/[0.06]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && surveys.length === 0 && (
          <div className="text-white/40 text-[12px] py-8 text-center">Loading…</div>
        )}

        {!loading && surveys.length === 0 && !showForm && (
          <div className="text-white/40 text-[12px] py-12 text-center">
            No surveys yet. Click &ldquo;New survey&rdquo; after flying a MAP-2 polygon mission.
          </div>
        )}

        <div className="space-y-3">
          {surveys.map((s) => (
            <div key={s.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-medium truncate">{s.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] || "bg-white/10"}`}>
                      {s.status}
                    </span>
                    <span className="text-[10px] text-white/40 uppercase">{s.survey_type}</span>
                  </div>
                  <div className="flex gap-4 text-[11px] text-white/50">
                    {s.photo_count > 0 && <span>{s.photo_count} photos</span>}
                    {s.area_m2 && <span>{(s.area_m2 / 10000).toFixed(2)} ha</span>}
                    {s.gsd_cm_px && <span>{s.gsd_cm_px} cm/px</span>}
                    {s.altitude_m && <span>{s.altitude_m}m AGL</span>}
                    {s.location && <span>{s.location}</span>}
                  </div>
                  {s.error_message && (
                    <div className="text-[11px] text-red-400 mt-1">{s.error_message}</div>
                  )}
                  {s.notes && <div className="text-[11px] text-white/40 mt-1">{s.notes}</div>}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {s.status === "pending" && (
                    <button
                      onClick={() => triggerProcess(s.id)}
                      className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-md px-3 py-1 text-[11px]"
                    >
                      Process
                    </button>
                  )}
                  {s.status === "processing" && (
                    <button
                      onClick={() => checkProcessingStatus(s.id)}
                      className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-md px-3 py-1 text-[11px]"
                    >
                      Check status
                    </button>
                  )}
                  {s.orthomosaic_url && (
                    <a
                      href={s.orthomosaic_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-md px-3 py-1 text-[11px]"
                    >
                      Orthomosaic
                    </a>
                  )}
                  {s.model_3d_url && (
                    <a
                      href={s.model_3d_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-md px-3 py-1 text-[11px]"
                    >
                      3D Model
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-2 text-[10px] text-white/30">
                <span>Created {new Date(s.created_at).toLocaleDateString()}</span>
                {s.processing_started_at && (
                  <span>Started {new Date(s.processing_started_at).toLocaleString()}</span>
                )}
                {s.processing_finished_at && (
                  <span>Finished {new Date(s.processing_finished_at).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[12px] text-white outline-none focus:border-cyan-400/50";
