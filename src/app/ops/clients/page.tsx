"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CONTACT_STATUSES,
  Contact,
  ContactStatus,
  ContactWithStats,
  PROJECT_STATUSES,
  Project,
  ProjectStatus,
  SERVICE_TYPES,
  contactStatusMeta,
  projectStatusMeta,
  serviceLabel,
} from "@/lib/clients";
import { formatDate, formatPHP } from "@/lib/books";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

interface Message {
  id: string;
  name: string;
  contact: string;
  service_type: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface Transaction {
  id: string;
  kind: string;
  date: string;
  amount: number;
  category: string;
  description: string | null;
}

interface ContactDetail {
  contact: Contact;
  projects: Project[];
  messages: Message[];
  transactions: Transaction[];
}

export default function ClientsPage() {
  const { token, logout } = useOps();
  const [contacts, setContacts] = useState<ContactWithStats[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ContactStatus>("all");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/contacts?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) {
      setError("Failed to load contacts");
      setLoading(false);
      return;
    }
    setError("");
    setContacts(await res.json());
    setLoading(false);
  }, [statusFilter, token, logout]);

  const fetchDetail = useCallback(
    async (id: string) => {
      setDetailLoading(true);
      const res = await fetch(`/api/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setDetail(null);
        setDetailLoading(false);
        return;
      }
      setDetail(await res.json());
      setDetailLoading(false);
    },
    [token, logout],
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
    else setDetail(null);
  }, [selectedId, fetchDetail]);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  function avatar(name: string) {
    const initials = name
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444"];
    const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
    return { initials, color: colors[hash % colors.length] };
  }

  async function saveContact(payload: Partial<Contact>, id?: string) {
    const url = id ? `/api/contacts/${id}` : "/api/contacts";
    const method = id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Failed to save contact");
      return null;
    }
    const data: Contact = await res.json();
    fetchContacts();
    if (id && selectedId === id) fetchDetail(id);
    else if (!id) setSelectedId(data.id);
    return data;
  }

  async function deleteContact(id: string) {
    if (!confirm("Delete this contact? This also deletes their projects.")) return;
    const res = await fetch(`/api/contacts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setSelectedId(null);
      setDetail(null);
      fetchContacts();
      if (isMobile) setMobileView("list");
    }
  }

  async function saveProject(payload: Partial<Project>, id?: string) {
    const url = id ? `/api/projects/${id}` : "/api/projects";
    const method = id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Failed to save project");
      return;
    }
    if (selectedId) fetchDetail(selectedId);
    fetchContacts();
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      if (selectedId) fetchDetail(selectedId);
      fetchContacts();
    }
  }

  const listPane = (
    <div className="flex flex-col h-full bg-[#1f1f21]">
      <div className="shrink-0 px-3 py-2 border-b border-white/[0.06] bg-[#252527] flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts"
          className="flex-1 bg-white/[0.08] rounded-md px-3 py-1.5 text-[12px] text-white outline-none placeholder:text-white/30 focus:bg-white/[0.12]"
        />
        <button
          onClick={() => setShowAddContact(true)}
          className="bg-cyan-500 text-black font-medium rounded-md px-2.5 py-1.5 text-[12px] hover:bg-cyan-400 transition-colors shrink-0"
          title="Add contact"
        >
          +
        </button>
      </div>

      <div className="shrink-0 px-3 py-1.5 border-b border-white/[0.06] flex items-center gap-0.5 overflow-x-auto">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 ${
            statusFilter === "all" ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white"
          }`}
        >
          All ({contacts.length})
        </button>
        {CONTACT_STATUSES.map((s) => {
          const count = contacts.filter((c) => c.status === s.key).length;
          return (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 ${
                statusFilter === s.key ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-white/40 text-[12px] mb-3">
              {contacts.length === 0 ? "No contacts yet." : "No matches."}
            </p>
            {contacts.length === 0 && (
              <button
                onClick={() => setShowAddContact(true)}
                className="text-cyan-400 text-[12px] hover:text-cyan-300"
              >
                + Add your first contact
              </button>
            )}
          </div>
        ) : (
          filtered.map((c) => {
            const av = avatar(c.name);
            const meta = contactStatusMeta(c.status);
            const active = selectedId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  if (isMobile) setMobileView("detail");
                }}
                className={`w-full text-left px-3 py-2 flex gap-2.5 border-b border-white/[0.04] transition-colors ${
                  active ? "bg-cyan-500/15" : "hover:bg-white/[0.03]"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white/90 shrink-0 mt-0.5"
                  style={{ background: av.color }}
                >
                  {av.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold text-white truncate">{c.name}</span>
                    <span className={`text-[10px] ${meta.color} shrink-0`}>{meta.label}</span>
                  </div>
                  <div className="text-[11px] text-white/55 truncate">{c.email || c.phone || "—"}</div>
                  <div className="text-[10px] text-white/40 flex items-center gap-2">
                    {c.project_count > 0 && <span>◉ {c.project_count}</span>}
                    {c.unread_count > 0 && <span className="text-cyan-400">✉ {c.unread_count}</span>}
                    {c.total_revenue > 0 && <span className="text-green-400/70">{formatPHP(c.total_revenue)}</span>}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const detailPane = detail ? (
    <DetailView
      detail={detail}
      detailLoading={detailLoading}
      avatar={avatar}
      onBack={() => {
        setMobileView("list");
        setSelectedId(null);
      }}
      onEdit={() => setShowEditContact(true)}
      onDelete={() => deleteContact(detail.contact.id)}
      onStatusChange={(status) => saveContact({ status }, detail.contact.id)}
      onAddProject={() => {
        setEditingProject(null);
        setShowAddProject(true);
      }}
      onEditProject={(p) => {
        setEditingProject(p);
        setShowAddProject(true);
      }}
      onDeleteProject={deleteProject}
      onNotesBlur={(notes) => saveContact({ notes }, detail.contact.id)}
      isMobile={isMobile}
    />
  ) : (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 bg-[#1c1c1e]">
      <div className="text-[28px] opacity-30 mb-3">◉</div>
      <p className="text-white/40 text-[12px]">Select a contact to view details</p>
    </div>
  );

  return (
    <div
      className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1 shrink-0">{error}</div>}

      {isMobile ? (
        <div className="flex-1 overflow-hidden">
          {mobileView === "list" ? listPane : detailPane}
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[320px] border-r border-white/[0.06] shrink-0">{listPane}</div>
          <div className="flex-1 min-w-0 overflow-hidden">{detailPane}</div>
        </div>
      )}

      {showAddContact && (
        <ContactForm
          onCancel={() => setShowAddContact(false)}
          onSave={async (payload) => {
            const saved = await saveContact(payload);
            if (saved) {
              setShowAddContact(false);
              if (isMobile) setMobileView("detail");
            }
          }}
        />
      )}

      {showEditContact && detail && (
        <ContactForm
          initial={detail.contact}
          onCancel={() => setShowEditContact(false)}
          onSave={async (payload) => {
            await saveContact(payload, detail.contact.id);
            setShowEditContact(false);
          }}
        />
      )}

      {showAddProject && detail && (
        <ProjectForm
          contactId={detail.contact.id}
          initial={editingProject}
          onCancel={() => {
            setShowAddProject(false);
            setEditingProject(null);
          }}
          onSave={async (payload) => {
            await saveProject(payload, editingProject?.id);
            setShowAddProject(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}

function DetailView({
  detail,
  detailLoading,
  avatar,
  onBack,
  onEdit,
  onDelete,
  onStatusChange,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onNotesBlur,
  isMobile,
}: {
  detail: ContactDetail;
  detailLoading: boolean;
  avatar: (n: string) => { initials: string; color: string };
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: ContactStatus) => void;
  onAddProject: () => void;
  onEditProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onNotesBlur: (notes: string) => void;
  isMobile: boolean;
}) {
  const c = detail.contact;
  const av = avatar(c.name);
  const meta = contactStatusMeta(c.status);
  const totalRevenue = detail.transactions
    .filter((t) => t.kind === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = detail.transactions
    .filter((t) => t.kind === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="h-full flex flex-col bg-[#1c1c1e]">
      <div className="h-10 px-3 md:px-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isMobile && (
            <button onClick={onBack} className="text-cyan-400 text-[13px] shrink-0">
              ← Back
            </button>
          )}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white/90 shrink-0"
            style={{ background: av.color }}
          >
            {av.initials}
          </div>
          <span className="text-[13px] font-semibold truncate">{c.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={c.status}
            onChange={(e) => onStatusChange(e.target.value as ContactStatus)}
            className={`bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5 text-[11px] ${meta.color} outline-none hover:bg-white/[0.1]`}
          >
            {CONTACT_STATUSES.map((s) => (
              <option key={s.key} value={s.key} className="bg-neutral-900 text-white">
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={onEdit}
            className="text-white/50 hover:text-white text-[11px] px-2 py-1 rounded hover:bg-white/[0.06]"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-white/50 hover:text-rose-400 text-[11px] px-2 py-1 rounded hover:bg-white/[0.06]"
          >
            Delete
          </button>
        </div>
      </div>

      {detailLoading ? (
        <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
          <div className="max-w-3xl">
            <section className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
                <Row label="Email" value={c.email || "—"} />
                <Row label="Phone" value={c.phone || "—"} />
                <Row label="Created" value={formatDate(c.created_at.slice(0, 10))} />
                <Row label="Tags" value={(c.tags && c.tags.length > 0 ? c.tags.join(", ") : "—") as string} />
              </div>
            </section>

            <section className="mb-6">
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Revenue" value={formatPHP(totalRevenue)} color="text-green-400" />
                <StatCard label="Spent on them" value={formatPHP(totalExpenses)} color="text-rose-400" />
              </div>
            </section>

            <section className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] text-white/50 uppercase tracking-wider">
                  Projects ({detail.projects.length})
                </h3>
                <button
                  onClick={onAddProject}
                  className="text-cyan-400 text-[11px] hover:text-cyan-300"
                >
                  + Add project
                </button>
              </div>
              {detail.projects.length === 0 ? (
                <p className="text-white/30 text-[11px] py-4 text-center border border-dashed border-white/[0.08] rounded-lg">
                  No projects yet.
                </p>
              ) : (
                <ul className="border border-white/[0.06] rounded-lg overflow-hidden">
                  {detail.projects.map((p) => {
                    const pm = projectStatusMeta(p.status);
                    return (
                      <li
                        key={p.id}
                        className="flex items-start gap-2 px-3 py-2 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[13px] font-medium">{p.title}</span>
                            <span className={`text-[10px] ${pm.color}`}>{pm.label}</span>
                          </div>
                          <div className="text-[11px] text-white/50 flex items-center gap-2 flex-wrap">
                            <span>{serviceLabel(p.service_type)}</span>
                            {p.shoot_date && <span>· Shoot {formatDate(p.shoot_date)}</span>}
                            {p.deadline && <span>· Due {formatDate(p.deadline)}</span>}
                            {p.amount != null && <span className="text-green-400/70">· {formatPHP(Number(p.amount))}</span>}
                            {p.location && <span>· {p.location}</span>}
                          </div>
                          {p.description && (
                            <div className="text-[11px] text-white/40 mt-0.5">{p.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => onEditProject(p)}
                            className="text-white/40 hover:text-white text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => onDeleteProject(p.id)}
                            className="text-white/40 hover:text-rose-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="mb-6">
              <h3 className="text-[11px] text-white/50 uppercase tracking-wider mb-2">
                Messages ({detail.messages.length})
              </h3>
              {detail.messages.length === 0 ? (
                <p className="text-white/30 text-[11px] py-4 text-center border border-dashed border-white/[0.08] rounded-lg">
                  No messages yet.
                </p>
              ) : (
                <ul className="border border-white/[0.06] rounded-lg overflow-hidden">
                  {detail.messages.slice(0, 5).map((m) => (
                    <li key={m.id} className="px-3 py-2 border-b border-white/[0.04] last:border-b-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[12px] font-medium truncate">
                          {m.service_type ? serviceLabel(m.service_type) : "Inquiry"}
                        </span>
                        <span className="text-[10px] text-white/40 shrink-0">
                          {formatDate(m.created_at.slice(0, 10))}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/60 line-clamp-2">{m.message}</div>
                    </li>
                  ))}
                </ul>
              )}
              {detail.messages.length > 5 && (
                <a
                  href="/ops/inbox"
                  className="text-cyan-400 text-[11px] hover:text-cyan-300 mt-2 inline-block"
                >
                  View all in Inbox →
                </a>
              )}
            </section>

            <section>
              <label className="text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                Notes
              </label>
              <textarea
                key={c.id}
                rows={3}
                defaultValue={c.notes || ""}
                onBlur={(e) => onNotesBlur(e.target.value)}
                placeholder="Internal notes about this contact…"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded px-2.5 py-2 text-white/80 text-[12px] outline-none resize-none focus:border-cyan-400/40 leading-[1.5]"
              />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] text-white/40 uppercase tracking-wider w-16 shrink-0">{label}</span>
      <span className="text-[12px] text-white/80 break-all">{value}</span>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-white/[0.06] rounded-lg bg-[#252527] px-3 py-2">
      <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      <div className={`text-[14px] font-semibold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

function ContactForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Contact;
  onCancel: () => void;
  onSave: (payload: Partial<Contact>) => void | Promise<void>;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [status, setStatus] = useState<ContactStatus>(initial?.status || "lead");
  const [tags, setTags] = useState((initial?.tags || []).join(", "));
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      status,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setSaving(false);
  }

  return (
    <Modal title={initial ? "Edit contact" : "New contact"} onClose={onCancel}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              placeholder="09XX-XXX-XXXX"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContactStatus)}
              className={inputCls}
            >
              {CONTACT_STATUSES.map((s) => (
                <option key={s.key} value={s.key} className="bg-neutral-900">
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags (comma separated)">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputCls}
              placeholder="vip, real-estate"
            />
          </Field>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Add contact"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-[12px] text-white/50 hover:text-white px-3 py-1.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProjectForm({
  contactId,
  initial,
  onCancel,
  onSave,
}: {
  contactId: string;
  initial: Project | null;
  onCancel: () => void;
  onSave: (payload: Partial<Project>) => void | Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [serviceType, setServiceType] = useState(initial?.service_type || "");
  const [status, setStatus] = useState<ProjectStatus>(initial?.status || "lead");
  const [shootDate, setShootDate] = useState(initial?.shoot_date || "");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : "");
  const [location, setLocation] = useState(initial?.location || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const amt = amount.trim() ? parseFloat(amount) : null;
    await onSave({
      contact_id: contactId,
      title: title.trim(),
      service_type: serviceType || null,
      status,
      shoot_date: shootDate || null,
      deadline: deadline || null,
      amount: amt != null && Number.isFinite(amt) ? amt : null,
      location: location.trim() || null,
      description: description.trim() || null,
    });
    setSaving(false);
  }

  return (
    <Modal title={initial ? "Edit project" : "New project"} onClose={onCancel}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
            className={inputCls}
            placeholder="e.g. Boracay resort aerial package"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Service type">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className={inputCls}
            >
              <option value="" className="bg-neutral-900">
                —
              </option>
              {SERVICE_TYPES.map((s) => (
                <option key={s.key} value={s.key} className="bg-neutral-900">
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={inputCls}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s.key} value={s.key} className="bg-neutral-900">
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Shoot date">
            <input
              type="date"
              value={shootDate}
              onChange={(e) => setShootDate(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Delivery deadline">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Amount (PHP)">
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputCls}
              placeholder="0.00"
            />
          </Field>
          <Field label="Location">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputCls}
              placeholder="City / address"
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls + " resize-none"}
            placeholder="Short description"
          />
        </Field>
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Add project"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-[12px] text-white/50 hover:text-white px-3 py-1.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      style={{ fontFamily: SYSTEM_FONT }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#252527] border border-white/[0.1] rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-10 px-4 flex items-center justify-between border-b border-white/[0.08] sticky top-0 bg-[#252527]">
          <h2 className="text-[13px] font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-[14px]">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
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
