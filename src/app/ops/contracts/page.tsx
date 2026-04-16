"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CONTRACT_STATUSES,
  CONTRACT_TEMPLATES,
  Contract,
  ContractStatus,
  contractStatusMeta,
} from "@/lib/contracts";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

interface Contact {
  id: string;
  name: string;
}
interface Project {
  id: string;
  name: string;
  contact_id: string | null;
}

interface ContractForm {
  title: string;
  template_key: string;
  contact_id: string;
  project_id: string;
  variables: Record<string, string>;
}

const TEMPLATE_FIELDS: Record<string, { key: string; label: string; placeholder?: string }[]> = {
  general: [
    { key: "client_name", label: "Client name" },
    { key: "contract_date", label: "Contract date", placeholder: "2028-06-15" },
    { key: "shoot_date", label: "Shoot date" },
    { key: "location", label: "Location" },
    { key: "service_description", label: "Service description" },
    { key: "deliverables", label: "Deliverables", placeholder: "e.g. 1 edited aerial video + 10 photos" },
    { key: "total_amount", label: "Total (PHP)" },
    { key: "deposit_amount", label: "Deposit (PHP)" },
    { key: "delivery_days", label: "Delivery (days)", placeholder: "14" },
  ],
  wedding: [
    { key: "client_name", label: "Client name" },
    { key: "contract_date", label: "Contract date" },
    { key: "event_type", label: "Event type", placeholder: "Wedding" },
    { key: "shoot_date", label: "Event date" },
    { key: "location", label: "Venue" },
    { key: "coverage_hours", label: "Coverage hours", placeholder: "4" },
    { key: "deliverables", label: "Deliverables" },
    { key: "total_amount", label: "Total (PHP)" },
    { key: "deposit_amount", label: "Deposit (PHP)" },
    { key: "delivery_days", label: "Delivery (days)", placeholder: "21" },
  ],
  real_estate: [
    { key: "client_name", label: "Client name" },
    { key: "contract_date", label: "Contract date" },
    { key: "location", label: "Property address" },
    { key: "shoot_date", label: "Shoot date" },
    { key: "service_description", label: "Service description" },
    { key: "deliverables", label: "Deliverables" },
    { key: "total_amount", label: "Total (PHP)" },
    { key: "delivery_days", label: "Delivery (days)", placeholder: "7" },
  ],
};

function blankForm(): ContractForm {
  return {
    title: "",
    template_key: "general",
    contact_id: "",
    project_id: "",
    variables: {
      contract_date: new Date().toISOString().slice(0, 10),
    },
  };
}

export default function ContractsPage() {
  const { token, logout } = useOps();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractForm>(blankForm());
  const [viewingId, setViewingId] = useState<string | null>(null);

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [cr, ctr, pr] = await Promise.all([
      fetch("/api/contracts", { headers: authHeader }),
      fetch("/api/contacts", { headers: authHeader }),
      fetch("/api/projects", { headers: authHeader }),
    ]);
    if (cr.status === 401) {
      logout();
      return;
    }
    if (cr.ok) setContracts(await cr.json());
    if (ctr.ok) setContacts((await ctr.json()).map((c: Contact) => ({ id: c.id, name: c.name })));
    if (pr.ok) setProjects((await pr.json()).map((p: Project) => ({ id: p.id, name: p.name, contact_id: p.contact_id })));
    setLoading(false);
  }, [authHeader, logout]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function startAdd() {
    setForm(blankForm());
    setEditingId(null);
    setShowForm(true);
    setViewingId(null);
  }

  function startEdit(c: Contract) {
    setForm({
      title: c.title,
      template_key: c.template_key || "general",
      contact_id: c.contact_id || "",
      project_id: c.project_id || "",
      variables: c.variables || {},
    });
    setEditingId(c.id);
    setShowForm(true);
    setViewingId(null);
  }

  function updateVar(key: string, value: string) {
    setForm((f) => ({ ...f, variables: { ...f.variables, [key]: value } }));
  }

  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title required");
      return;
    }
    // auto-fill client_name from contact if blank
    const contact = contacts.find((c) => c.id === form.contact_id);
    const vars = { ...form.variables };
    if (contact && !vars.client_name) vars.client_name = contact.name;

    const payload = {
      title: form.title.trim(),
      template_key: form.template_key,
      contact_id: form.contact_id || null,
      project_id: form.project_id || null,
      variables: vars,
    };
    const url = editingId ? `/api/contracts/${editingId}` : "/api/contracts";
    const method = editingId ? "PATCH" : "POST";
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
    setShowForm(false);
    setEditingId(null);
    fetchAll();
  }

  async function updateStatus(id: string, status: ContractStatus) {
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchAll();
  }

  async function deleteContract(id: string) {
    if (!confirm("Delete this contract?")) return;
    const res = await fetch(`/api/contracts/${id}`, { method: "DELETE", headers: authHeader });
    if (res.ok) fetchAll();
  }

  function copyLink(c: Contract) {
    if (!c.public_token) return;
    const url = `${window.location.origin}/sign/${c.public_token}`;
    navigator.clipboard.writeText(url);
    alert("Sign link copied: " + url);
  }

  const contactById = useMemo(() => new Map(contacts.map((c) => [c.id, c.name])), [contacts]);
  const viewContract = viewingId ? contracts.find((c) => c.id === viewingId) : null;
  const fields = TEMPLATE_FIELDS[form.template_key] || TEMPLATE_FIELDS.general;
  const filteredProjects = form.contact_id
    ? projects.filter((p) => p.contact_id === form.contact_id)
    : projects;

  const stats = useMemo(() => {
    return {
      draft: contracts.filter((c) => c.status === "draft").length,
      sent: contracts.filter((c) => c.status === "sent").length,
      signed: contracts.filter((c) => c.status === "signed").length,
    };
  }, [contracts]);

  return (
    <div
      className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#252527] shrink-0">
        <span className="text-[11px] text-white/50 uppercase tracking-wider">Contracts</span>
        <button onClick={startAdd} className="bg-cyan-500 text-black font-medium rounded-md px-2.5 py-1 text-[11px] hover:bg-cyan-400">
          + New contract
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{error}</div>}

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 md:px-5 py-3 md:py-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
            <SummaryCard label="Draft" value={String(stats.draft)} color="text-white/60" />
            <SummaryCard label="Awaiting signature" value={String(stats.sent)} color="text-cyan-400" />
            <SummaryCard label="Signed" value={String(stats.signed)} color="text-green-400" />
          </div>

          {showForm && (
            <form onSubmit={saveForm} className="mb-4 border border-white/[0.08] rounded-lg bg-[#252527] p-3 md:p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-medium">{editingId ? "Edit contract" : "New contract"}</span>
                <button type="button" onClick={() => setShowForm(false)} className="text-white/40 hover:text-white/70 text-[12px]">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Field label="Title (internal)">
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Smith wedding aerial" className={inputCls} />
                </Field>
                <Field label="Template">
                  <select value={form.template_key} onChange={(e) => setForm({ ...form, template_key: e.target.value })} className={inputCls}>
                    {Object.entries(CONTRACT_TEMPLATES).map(([k, v]) => (
                      <option key={k} value={k} className="bg-neutral-900">{v.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Client">
                  <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value, project_id: "" })} className={inputCls}>
                    <option value="" className="bg-neutral-900">Select…</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id} className="bg-neutral-900">{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Project (optional)">
                  <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} className={inputCls}>
                    <option value="" className="bg-neutral-900">—</option>
                    {filteredProjects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="border-t border-white/[0.06] pt-3 mt-3 mb-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Fill in the blanks</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fields.map((fld) => (
                    <Field key={fld.key} label={fld.label}>
                      <input
                        type={fld.key.includes("date") ? "date" : "text"}
                        value={form.variables[fld.key] || ""}
                        onChange={(e) => updateVar(fld.key, e.target.value)}
                        placeholder={fld.placeholder}
                        className={inputCls}
                      />
                    </Field>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="submit" className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400">
                  {editingId ? "Save changes" : "Create contract"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-[12px] text-white/50 hover:text-white px-3 py-1.5">Cancel</button>
              </div>
            </form>
          )}

          <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#1f1f21]">
            <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-white/50 uppercase tracking-wider">All contracts</span>
              <span className="text-[11px] text-white/40">{contracts.length}</span>
            </div>
            {loading ? (
              <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
            ) : contracts.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-white/40 text-[12px] mb-3">No contracts yet.</p>
                <button onClick={startAdd} className="text-cyan-400 text-[12px] hover:text-cyan-300">+ Create your first contract</button>
              </div>
            ) : (
              <ul>
                {contracts.map((c) => {
                  const s = contractStatusMeta(c.status);
                  return (
                    <li key={c.id} className="border-b border-white/[0.04] last:border-b-0 px-3 py-2 hover:bg-white/[0.02] flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[13px] font-medium truncate">{c.title}</span>
                          {c.contact_id && contactById.get(c.contact_id) && (
                            <span className="text-[11px] text-white/50">· {contactById.get(c.contact_id)}</span>
                          )}
                          <span className={`text-[10px] uppercase tracking-wider ${s.color}`}>· {s.label}</span>
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {c.template_key && <>{CONTRACT_TEMPLATES[c.template_key]?.label || c.template_key} · </>}
                          {c.signed_at ? (
                            <>Signed by {c.client_signature_name} on {new Date(c.signed_at).toLocaleDateString()}</>
                          ) : c.sent_at ? (
                            <>Sent {new Date(c.sent_at).toLocaleDateString()}</>
                          ) : (
                            <>Created {new Date(c.created_at).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c.id, e.target.value as ContractStatus)}
                          disabled={c.status === "signed"}
                          className="bg-transparent border border-white/10 rounded text-[10px] text-white/70 px-1 py-0.5 outline-none hover:border-white/20 disabled:opacity-50"
                        >
                          {CONTRACT_STATUSES.map((st) => (
                            <option key={st.key} value={st.key} className="bg-neutral-900">{st.label}</option>
                          ))}
                        </select>
                        <button onClick={() => copyLink(c)} className="text-white/40 hover:text-cyan-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Copy sign link">🔗</button>
                        <button onClick={() => setViewingId(c.id)} className="text-white/40 hover:text-white text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Preview">👁</button>
                        <button onClick={() => startEdit(c)} className="text-white/40 hover:text-white text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Edit" disabled={c.status === "signed"}>✎</button>
                        <button onClick={() => deleteContract(c.id)} className="text-white/40 hover:text-rose-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Delete">✕</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {viewContract && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setViewingId(null)}>
          <div className="bg-white text-black w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-10 text-[13px]">
              <h2 className="text-xl font-bold mb-4">{viewContract.title}</h2>
              <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed">{viewContract.content}</pre>
              {viewContract.signed_at && (
                <div className="mt-6 pt-4 border-t-2 border-black">
                  <p className="font-bold">Signed</p>
                  <p className="text-[12px] mt-1">{viewContract.client_signature_name}</p>
                  <p className="text-[11px] text-gray-600">{new Date(viewContract.signed_at).toLocaleString()}</p>
                  {viewContract.signed_ip && <p className="text-[10px] text-gray-500 mt-1">IP: {viewContract.signed_ip}</p>}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => window.print()} className="bg-black text-white rounded px-3 py-1.5 text-[12px]">Print</button>
                <button onClick={() => setViewingId(null)} className="bg-gray-200 rounded px-3 py-1.5 text-[12px]">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
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
