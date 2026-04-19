"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SYSTEM_FONT, saveDraft, loadDraft, clearDraft } from "@/lib/ops";
import { useOps } from "../OpsContext";

interface Project {
  id: string;
  contact_id: string;
  title: string;
  service_type: string | null;
  status: string;
  shoot_date: string | null;
  deadline: string | null;
  amount: number | null;
  location: string | null;
  description: string | null;
  notes: string | null;
  delivery_token: string | null;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
}

const STATUSES = ["lead", "booked", "shooting", "editing", "delivered", "cancelled"] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  lead: { bg: "bg-amber-500/15", text: "text-amber-300", bar: "#f59e0b" },
  booked: { bg: "bg-cyan-500/15", text: "text-cyan-300", bar: "#06b6d4" },
  shooting: { bg: "bg-orange-500/15", text: "text-orange-300", bar: "#f97316" },
  editing: { bg: "bg-purple-500/15", text: "text-purple-300", bar: "#a855f7" },
  delivered: { bg: "bg-green-500/15", text: "text-green-300", bar: "#22c55e" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400/60", bar: "#64748b" },
};

const SERVICE_TYPES = ["aerial-photo", "aerial-video", "mapping", "survey", "real-estate", "wedding", "event", "commercial", "other"];

const DAY_MS = 86_400_000;

interface FormState {
  contact_id: string;
  title: string;
  service_type: string;
  status: string;
  shoot_date: string;
  deadline: string;
  amount: string;
  location: string;
  description: string;
  notes: string;
}

function blankForm(): FormState {
  return {
    contact_id: "",
    title: "",
    service_type: "",
    status: "lead",
    shoot_date: "",
    deadline: "",
    amount: "",
    location: "",
    description: "",
    notes: "",
  };
}

function toFormState(p: Project): FormState {
  return {
    contact_id: p.contact_id,
    title: p.title,
    service_type: p.service_type || "",
    status: p.status,
    shoot_date: p.shoot_date || "",
    deadline: p.deadline || "",
    amount: p.amount != null ? String(p.amount) : "",
    location: p.location || "",
    description: p.description || "",
    notes: p.notes || "",
  };
}

export default function ProjectsPage() {
  const { token } = useOps();
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"gantt" | "list">("gantt");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const ganttRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLFormElement>(null);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projRes, contRes] = await Promise.all([
        fetch("/api/projects", { headers }),
        fetch("/api/contacts", { headers }),
      ]);
      if (!projRes.ok) throw new Error(`Failed to load projects (${projRes.status})`);
      if (!contRes.ok) throw new Error(`Failed to load contacts (${contRes.status})`);
      setProjects(await projRes.json());
      setContacts(await contRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft<FormState>("project");
    if (draft) {
      setForm(draft);
      setEditId(draft._editId || null);
      setShowForm(true);
    }
  }, []);

  // Auto-save draft when form changes
  useEffect(() => {
    if (!showForm) return;
    const hasContent = form.title.trim() || form.contact_id || form.description?.trim() || form.notes?.trim();
    if (hasContent) {
      saveDraft("project", { ...form, _editId: editId });
    }
  }, [showForm, form, editId]);

  // Warn before unload if form is open with content
  useEffect(() => {
    if (!showForm) return;
    const hasContent = form.title.trim() || form.description?.trim();
    if (!hasContent) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [showForm, form]);

  // ESC to close modal
  useEffect(() => {
    if (!showForm && !confirmDelete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmDelete) setConfirmDelete(null);
        else closeForm();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showForm, confirmDelete]);

  // Focus trap in modal
  useEffect(() => {
    if (!showForm || !modalRef.current) return;
    const firstInput = modalRef.current.querySelector<HTMLElement>("select, input, textarea, button");
    firstInput?.focus();
  }, [showForm]);

  const contactMap = useMemo(() => {
    const m: Record<string, Contact> = {};
    contacts.forEach((c) => (m[c.id] = c));
    return m;
  }, [contacts]);

  const filtered = useMemo(() => {
    let list = statusFilter === "all" ? projects : projects.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.service_type?.toLowerCase().includes(q) ||
          contactMap[p.contact_id]?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, statusFilter, search, contactMap]);

  const ganttData = useMemo(() => {
    const withDates = filtered.filter((p) => p.shoot_date || p.deadline);
    if (withDates.length === 0) return null;

    let minTs = Infinity;
    let maxTs = -Infinity;

    for (const p of withDates) {
      const start = p.shoot_date ? new Date(p.shoot_date).getTime() : new Date(p.deadline!).getTime() - 7 * DAY_MS;
      const end = p.deadline ? new Date(p.deadline).getTime() : new Date(p.shoot_date!).getTime() + 14 * DAY_MS;
      if (start < minTs) minTs = start;
      if (end > maxTs) maxTs = end;
    }

    const padding = 3 * DAY_MS;
    minTs -= padding;
    maxTs += padding;
    const totalDays = Math.ceil((maxTs - minTs) / DAY_MS);

    const weeks: { date: Date; label: string }[] = [];
    const d = new Date(minTs);
    d.setDate(d.getDate() - d.getDay());
    while (d.getTime() < maxTs) {
      weeks.push({
        date: new Date(d),
        label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
      });
      d.setDate(d.getDate() + 7);
    }

    const bars = withDates.map((p) => {
      const start = p.shoot_date ? new Date(p.shoot_date).getTime() : new Date(p.deadline!).getTime() - 7 * DAY_MS;
      const end = p.deadline ? new Date(p.deadline).getTime() : new Date(p.shoot_date!).getTime() + 14 * DAY_MS;
      const estimated = !p.shoot_date || !p.deadline;
      const leftPct = ((start - minTs) / (maxTs - minTs)) * 100;
      const widthPct = Math.max(((end - start) / (maxTs - minTs)) * 100, 1);
      return { project: p, leftPct, widthPct, estimated };
    });

    return { minTs, maxTs, totalDays, weeks, bars };
  }, [filtered]);

  function openNew() {
    setForm(blankForm());
    setEditId(null);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setForm(toFormState(p));
    setEditId(p.id);
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    clearDraft("project");
    setShowForm(false);
    setFormError("");
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.contact_id) {
      setFormError("Please select a client");
      return;
    }
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: form.amount ? Number(form.amount) : null,
        shoot_date: form.shoot_date || null,
        deadline: form.deadline || null,
        service_type: form.service_type || null,
        location: form.location || null,
        description: form.description || null,
        notes: form.notes || null,
      };

      const url = editId ? `/api/projects/${editId}` : "/api/projects";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Failed to save (${res.status})`);
      }

      clearDraft("project");
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save project");
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingStatus(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchAll();
    } catch {
      setError("Failed to update project status");
    }
    setUpdatingStatus(null);
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${confirmDelete}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Failed to delete");
      clearDraft("project");
      setConfirmDelete(null);
      setShowForm(false);
      fetchAll();
    } catch {
      setFormError("Failed to delete project");
    }
    setDeleting(false);
  }

  async function generateDeliveryToken(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ generate_delivery_token: true }),
      });
      if (!res.ok) throw new Error("Failed to generate link");
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      setFormError("Failed to generate delivery link");
    }
  }

  function copyDeliveryUrl(deliveryToken: string) {
    const url = `${window.location.origin}/d/${deliveryToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  }

  const todayPct = ganttData
    ? ((Date.now() - ganttData.minTs) / (ganttData.maxTs - ganttData.minTs)) * 100
    : 0;

  const editProject = editId ? projects.find((p) => p.id === editId) : null;

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/30";

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: SYSTEM_FONT }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[15px] font-semibold text-white">Projects</h1>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                aria-label="Search projects"
                className="bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1 pl-7 text-[11px] text-white w-36 outline-none focus:border-cyan-400/40 focus-visible:ring-2 focus-visible:ring-cyan-400/30 placeholder:text-white/25"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/25 text-[11px]">⌕</span>
            </div>
            <div className="flex bg-white/[0.04] rounded-md p-0.5" role="tablist" aria-label="View mode">
              <button
                onClick={() => setView("gantt")}
                role="tab"
                aria-selected={view === "gantt"}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  view === "gantt" ? "bg-cyan-500/20 text-cyan-300" : "text-white/50 hover:text-white"
                }`}
              >
                Gantt
              </button>
              <button
                onClick={() => setView("list")}
                role="tab"
                aria-selected={view === "list"}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  view === "list" ? "bg-cyan-500/20 text-cyan-300" : "text-white/50 hover:text-white"
                }`}
              >
                List
              </button>
            </div>
            <button
              onClick={openNew}
              aria-label="Create new project"
              className="bg-cyan-500 text-black text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              + New
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Filter by status">
          <button
            onClick={() => setStatusFilter("all")}
            role="tab"
            aria-selected={statusFilter === "all"}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              statusFilter === "all"
                ? "bg-cyan-500/20 text-cyan-300"
                : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            All ({projects.length})
          </button>
          {STATUSES.map((s) => {
            const count = projects.filter((p) => p.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                role="tab"
                aria-selected={statusFilter === s}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  statusFilter === s
                    ? `${STATUS_COLORS[s].bg} ${STATUS_COLORS[s].text}`
                    : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-5 py-2 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-red-400">{error}</span>
            <button onClick={() => { setError(""); fetchAll(); }} className="text-[11px] text-red-300 hover:text-red-200">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : view === "gantt" ? (
          <div className="h-full flex flex-col">
            {!ganttData || ganttData.bars.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/30 text-[13px] mb-2">
                    {filtered.length === 0 ? "No projects found" : "No projects with dates to display"}
                  </p>
                  <p className="text-white/20 text-[11px]">
                    {filtered.length === 0 ? "Create a project to get started" : "Add shoot dates or deadlines to see the Gantt chart"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto" ref={ganttRef}>
                <div className="min-w-[800px]">
                  {/* Week headers */}
                  <div className="flex border-b border-white/[0.06] sticky top-0 bg-[#1c1c1e] z-10">
                    <div className="w-52 shrink-0 px-3 py-2 text-[10px] text-white/30 uppercase tracking-wider font-semibold border-r border-white/[0.06]">
                      Project
                    </div>
                    <div className="flex-1 relative">
                      <div className="flex">
                        {ganttData.weeks.map((w, i) => (
                          <div
                            key={i}
                            className="text-[10px] text-white/25 py-2 text-center border-r border-white/[0.04]"
                            style={{ width: `${(7 / ganttData.totalDays) * 100}%`, minWidth: 60 }}
                          >
                            {w.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bars */}
                  {ganttData.bars.map(({ project: p, leftPct, widthPct, estimated }) => {
                    const colors = STATUS_COLORS[p.status] || STATUS_COLORS.lead;
                    const contact = contactMap[p.contact_id];
                    return (
                      <div
                        key={p.id}
                        className="flex border-b border-white/[0.04] hover:bg-white/[0.02] group"
                      >
                        <div
                          className="w-52 shrink-0 px-3 py-2.5 border-r border-white/[0.06] cursor-pointer"
                          onClick={() => openEdit(p)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && openEdit(p)}
                        >
                          <div className="text-[12px] text-white font-medium truncate">{p.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] capitalize ${colors.text}`}>{p.status}</span>
                            {contact && (
                              <span className="text-[10px] text-white/25 truncate">{contact.name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 relative py-2">
                          <div
                            className="absolute top-0 bottom-0 w-px bg-cyan-500/30"
                            style={{ left: `${todayPct}%` }}
                            aria-hidden="true"
                          />
                          <div
                            className="absolute top-2.5 h-5 rounded-full cursor-pointer transition-opacity hover:opacity-90"
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              minWidth: 8,
                              backgroundColor: colors.bar,
                              opacity: p.status === "cancelled" ? 0.3 : 0.7,
                              borderStyle: estimated ? "dashed" : "solid",
                              borderWidth: estimated ? 1 : 0,
                              borderColor: estimated ? colors.bar : "transparent",
                              backgroundImage: estimated ? `repeating-linear-gradient(90deg, ${colors.bar}, ${colors.bar} 4px, transparent 4px, transparent 8px)` : "none",
                            }}
                            onClick={() => openEdit(p)}
                            title={`${p.title}\n${p.shoot_date || "est."} → ${p.deadline || "est."}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && openEdit(p)}
                          >
                            <span className="absolute inset-0 flex items-center px-2 text-[10px] text-white font-medium truncate">
                              {widthPct > 8 ? p.title : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===== LIST VIEW ===== */
          <div className="overflow-y-auto p-5">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/30 text-[13px] mb-2">No projects found</p>
                {search && (
                  <button onClick={() => setSearch("")} className="text-[11px] text-cyan-400 hover:text-cyan-300">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-w-3xl">
                {filtered.map((p) => {
                  const colors = STATUS_COLORS[p.status] || STATUS_COLORS.lead;
                  const contact = contactMap[p.contact_id];
                  const isUpdating = updatingStatus === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`bg-white/[0.03] rounded-lg px-4 py-3 hover:bg-white/[0.06] transition-colors cursor-pointer ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                      onClick={() => openEdit(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openEdit(p)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13px] text-white font-medium truncate">{p.title}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`inline-flex items-center gap-1 text-[11px] capitalize ${colors.text}`}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.bar }} aria-hidden="true" />
                              {p.status}
                            </span>
                            {p.service_type && <span className="text-[11px] text-white/30">{p.service_type.replace(/-/g, " ")}</span>}
                            {contact && <span className="text-[11px] text-white/25">{contact.name}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {p.amount != null && (
                            <div className="text-[12px] text-white/70">₱{Number(p.amount).toLocaleString()}</div>
                          )}
                          <div className="text-[10px] text-white/25 mt-0.5">
                            {p.shoot_date && `Shoot: ${p.shoot_date}`}
                            {p.shoot_date && p.deadline && " · "}
                            {p.deadline && `Due: ${p.deadline}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {STATUSES.filter((s) => s !== p.status && s !== "cancelled").map((s) => (
                          <button
                            key={s}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(p.id, s);
                            }}
                            disabled={isUpdating}
                            className="text-[10px] text-white/25 hover:text-white/60 capitalize px-1.5 py-0.5 rounded hover:bg-white/[0.06] transition-colors focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:outline-none disabled:opacity-30"
                          >
                            → {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== PROJECT FORM MODAL ===== */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeForm()}
          role="dialog"
          aria-modal="true"
          aria-label={editId ? "Edit project" : "New project"}
        >
          <form
            ref={modalRef}
            onSubmit={saveProject}
            className="bg-[#2c2c2e] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-white/[0.08]"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <h2 className="text-[14px] font-semibold text-white">
                {editId ? "Edit Project" : "New Project"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-white/40 hover:text-white text-[18px] w-7 h-7 flex items-center justify-center rounded hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="mx-5 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-md">
                <span className="text-[12px] text-red-400">{formError}</span>
              </div>
            )}

            <div className="p-5 space-y-3">
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Client *</label>
                <select
                  value={form.contact_id}
                  onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
                  className={`${inputCls} ${!form.contact_id && formError ? "border-red-500/50" : ""}`}
                  required
                >
                  <option value="">Select client...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.email}
                    </option>
                  ))}
                </select>
                {contacts.length === 0 && (
                  <p className="text-[10px] text-amber-400/60 mt-1">No contacts found. Add a client first.</p>
                )}
              </div>
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`${inputCls} ${!form.title.trim() && formError ? "border-red-500/50" : ""}`}
                  required
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Service type</label>
                  <select
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">—</option>
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/-/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className={inputCls}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Shoot date</label>
                  <input
                    type="date"
                    value={form.shoot_date}
                    onChange={(e) => setForm({ ...form, shoot_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={inputCls}
                    maxLength={200}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none h-16`}
                  maxLength={2000}
                />
              </div>
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={`${inputCls} resize-none h-16`}
                  maxLength={2000}
                />
              </div>

              {/* Delivery link */}
              {editId && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <label className="text-[11px] text-white/40 block mb-1.5">Client delivery link</label>
                  {editProject?.delivery_token ? (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[11px] text-cyan-300/70 bg-white/[0.03] px-2 py-1.5 rounded truncate">
                        /d/{editProject.delivery_token}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyDeliveryUrl(editProject.delivery_token!)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-white/[0.06] transition-colors shrink-0"
                      >
                        {copiedToken ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => generateDeliveryToken(editId)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Generate delivery link
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
              <div>
                {editId && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(editId)}
                    className="text-[12px] text-red-400/60 hover:text-red-400 transition-colors focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none rounded px-1"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-3 py-1.5 text-[12px] text-white/50 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-cyan-500 text-black font-medium px-4 py-1.5 rounded-md text-[12px] hover:bg-cyan-400 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                >
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm delete"
        >
          <div className="bg-[#2c2c2e] rounded-xl w-full max-w-sm border border-white/[0.08] p-5">
            <h3 className="text-[14px] font-semibold text-white mb-2">Delete project?</h3>
            <p className="text-[12px] text-white/50 mb-5">
              This will permanently remove this project and all its data. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 text-[12px] text-white/50 hover:text-white transition-colors rounded focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500/80 text-white font-medium px-4 py-1.5 rounded-md text-[12px] hover:bg-red-500 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
