"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SYSTEM_FONT } from "@/lib/ops";

interface Deliverable {
  id: string;
  title: string;
  file_type: string;
  file_url: string | null;
  file_size_bytes: number | null;
  thumbnail_url: string | null;
  notes: string | null;
  created_at: string;
}

interface CompleteSurvey {
  id: string;
  title: string;
  survey_type: string;
  status: string;
  orthomosaic_url: string | null;
  dsm_url: string | null;
  model_3d_url: string | null;
  area_m2: number | null;
  gsd_cm_px: number | null;
  photo_count: number;
}

interface ProjectInfo {
  title: string;
  service_type: string | null;
  status: string;
  location: string | null;
  description: string | null;
  shoot_date: string | null;
}

interface DeliveryData {
  project: ProjectInfo;
  deliverables: Deliverable[];
  surveys: CompleteSurvey[];
}

const FILE_TYPE_ICONS: Record<string, string> = {
  orthomosaic: "🗺",
  "3d_model": "🧊",
  dsm: "📐",
  video: "🎬",
  photo_set: "📸",
  report: "📄",
  other: "📎",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function DeliveryPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await fetch(`/api/public/deliveries/${token}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setData(await res.json());
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}>
        <div className="text-white/40 text-[13px]">Loading delivery…</div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}>
        <div className="text-center">
          <div className="text-white/50 text-[14px] mb-2">Delivery not found</div>
          <div className="text-white/30 text-[12px]">This link may have expired or is invalid.</div>
        </div>
      </div>
    );
  }

  const { project, deliverables, surveys } = data;

  return (
    <div className="min-h-screen text-white" style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}>
      <header className="border-b border-white/[0.08] bg-[#2c2c2e]">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-2 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 24, width: "auto" }} />
            <span className="text-[11px] text-white/40 uppercase tracking-wider">Delivery</span>
          </div>
          <h1 className="text-[20px] font-semibold">{project.title}</h1>
          <div className="flex gap-3 text-[12px] text-white/50 mt-1">
            {project.service_type && <span>{project.service_type}</span>}
            {project.location && <span>{project.location}</span>}
            {project.shoot_date && <span>{new Date(project.shoot_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
          </div>
          {project.description && (
            <p className="text-[12px] text-white/40 mt-2 leading-relaxed">{project.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {deliverables.length > 0 && (
          <section>
            <h2 className="text-[13px] font-medium text-white/70 uppercase tracking-wider mb-3">Deliverables</h2>
            <div className="grid gap-3">
              {deliverables.map((d) => (
                <div key={d.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4 flex items-start gap-4">
                  {d.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.thumbnail_url}
                      alt=""
                      className="w-16 h-16 rounded-md object-cover bg-white/5 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-white/5 flex items-center justify-center text-[24px] shrink-0">
                      {FILE_TYPE_ICONS[d.file_type] || "📎"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium">{d.title}</h3>
                    <div className="flex gap-3 text-[11px] text-white/50 mt-0.5">
                      <span>{d.file_type.replace("_", " ")}</span>
                      {d.file_size_bytes && <span>{formatBytes(d.file_size_bytes)}</span>}
                      <span>{new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                    {d.notes && <p className="text-[11px] text-white/40 mt-1">{d.notes}</p>}
                  </div>
                  {d.file_url && (
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400 shrink-0"
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {surveys.length > 0 && (
          <section>
            <h2 className="text-[13px] font-medium text-white/70 uppercase tracking-wider mb-3">Survey outputs</h2>
            <div className="grid gap-3">
              {surveys.map((s) => (
                <div key={s.id} className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[14px] font-medium">{s.title}</h3>
                    <span className="text-[10px] text-purple-300 uppercase">{s.survey_type}</span>
                  </div>
                  <div className="flex gap-4 text-[11px] text-white/50 mb-3">
                    {s.photo_count > 0 && <span>{s.photo_count} photos</span>}
                    {s.area_m2 && <span>{(s.area_m2 / 10000).toFixed(2)} ha</span>}
                    {s.gsd_cm_px && <span>{s.gsd_cm_px} cm/px GSD</span>}
                  </div>
                  <div className="flex gap-2">
                    {s.orthomosaic_url && (
                      <a
                        href={s.orthomosaic_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-md px-3 py-1.5 text-[12px]"
                      >
                        🗺 Orthomosaic
                      </a>
                    )}
                    {s.dsm_url && (
                      <a
                        href={s.dsm_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-md px-3 py-1.5 text-[12px]"
                      >
                        📐 DSM
                      </a>
                    )}
                    {s.model_3d_url && (
                      <a
                        href={s.model_3d_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-md px-3 py-1.5 text-[12px]"
                      >
                        🧊 3D Model
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {deliverables.length === 0 && surveys.length === 0 && (
          <div className="text-center py-12 text-white/40 text-[13px]">
            No deliverables yet. Your files will appear here when ready.
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.06] mt-12">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-[11px] text-white/30">
          Delivered by waevpoint — Drone videography & mapping
        </div>
      </footer>
    </div>
  );
}
