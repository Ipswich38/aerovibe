"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TERMS,
  INVOICE_STATUSES,
  Invoice,
  InvoiceItem,
  InvoiceKind,
  InvoiceStatus,
  computeItemAmount,
  computeTotals,
  statusMeta,
} from "@/lib/invoices";
import { formatPHP, formatDate } from "@/lib/books";
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

interface InvoiceForm {
  kind: InvoiceKind;
  contact_id: string;
  project_id: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  tax_rate: string;
  notes: string;
  terms: string;
}

function blankForm(kind: InvoiceKind = "invoice"): InvoiceForm {
  return {
    kind,
    contact_id: "",
    project_id: "",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    items: [{ description: "", quantity: 1, unit_price: 0, amount: 0 }],
    tax_rate: "0",
    notes: "",
    terms: DEFAULT_TERMS,
  };
}

export default function InvoicesPage() {
  const { token, logout } = useOps();
  const [kindFilter, setKindFilter] = useState<"all" | InvoiceKind>("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceForm>(blankForm());
  const [viewingId, setViewingId] = useState<string | null>(null);

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const q = kindFilter === "all" ? "" : `?kind=${kindFilter}`;
    const [ir, cr, pr] = await Promise.all([
      fetch(`/api/invoices${q}`, { headers: authHeader }),
      fetch("/api/contacts", { headers: authHeader }),
      fetch("/api/projects", { headers: authHeader }),
    ]);
    if (ir.status === 401) {
      logout();
      return;
    }
    if (ir.ok) setInvoices(await ir.json());
    if (cr.ok) setContacts((await cr.json()).map((c: Contact) => ({ id: c.id, name: c.name })));
    if (pr.ok) setProjects((await pr.json()).map((p: Project) => ({ id: p.id, name: p.name, contact_id: p.contact_id })));
    setLoading(false);
  }, [kindFilter, authHeader, logout]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totals = useMemo(() => {
    const outstanding = invoices
      .filter((i) => i.kind === "invoice" && ["sent", "overdue"].includes(i.status))
      .reduce((s, i) => s + Number(i.total), 0);
    const paid = invoices
      .filter((i) => i.kind === "invoice" && i.status === "paid")
      .reduce((s, i) => s + Number(i.total), 0);
    const quoteValue = invoices
      .filter((i) => i.kind === "quote" && ["sent", "accepted"].includes(i.status))
      .reduce((s, i) => s + Number(i.total), 0);
    return { outstanding, paid, quoteValue };
  }, [invoices]);

  function startAdd(kind: InvoiceKind = "invoice") {
    setForm(blankForm(kind));
    setEditingId(null);
    setShowForm(true);
    setViewingId(null);
  }

  function startEdit(inv: Invoice) {
    setForm({
      kind: inv.kind,
      contact_id: inv.contact_id || "",
      project_id: inv.project_id || "",
      issue_date: inv.issue_date,
      due_date: inv.due_date || "",
      items: inv.items.length ? inv.items : [{ description: "", quantity: 1, unit_price: 0, amount: 0 }],
      tax_rate: String(inv.tax_rate),
      notes: inv.notes || "",
      terms: inv.terms || DEFAULT_TERMS,
    });
    setEditingId(inv.id);
    setShowForm(true);
    setViewingId(null);
  }

  function updateItem(idx: number, patch: Partial<InvoiceItem>) {
    setForm((f) => {
      const items = [...f.items];
      const merged = { ...items[idx], ...patch };
      merged.amount = computeItemAmount(Number(merged.quantity) || 0, Number(merged.unit_price) || 0);
      items[idx] = merged;
      return { ...f, items };
    });
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { description: "", quantity: 1, unit_price: 0, amount: 0 }] }));
  }

  function removeItem(idx: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    const items = form.items.filter((i) => i.description.trim());
    if (items.length === 0) {
      setError("Add at least one line item");
      return;
    }
    const payload = {
      kind: form.kind,
      contact_id: form.contact_id || null,
      project_id: form.project_id || null,
      issue_date: form.issue_date,
      due_date: form.due_date || null,
      items,
      tax_rate: Number(form.tax_rate) || 0,
      notes: form.notes,
      terms: form.terms,
    };
    const url = editingId ? `/api/invoices/${editingId}` : "/api/invoices";
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

  async function updateStatus(id: string, status: InvoiceStatus) {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchAll();
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE", headers: authHeader });
    if (res.ok) fetchAll();
  }

  function copyLink(inv: Invoice) {
    if (!inv.public_token) return;
    const url = `${window.location.origin}/i/${inv.public_token}`;
    navigator.clipboard.writeText(url);
    alert("Link copied: " + url);
  }

  const contactById = useMemo(() => new Map(contacts.map((c) => [c.id, c.name])), [contacts]);
  const formTotals = computeTotals(form.items, Number(form.tax_rate) || 0);
  const viewInv = viewingId ? invoices.find((i) => i.id === viewingId) : null;
  const filteredProjects = form.contact_id
    ? projects.filter((p) => p.contact_id === form.contact_id)
    : projects;

  return (
    <div
      className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#252527] shrink-0 gap-2">
        <div className="flex items-center gap-0.5">
          {(["all", "invoice", "quote"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                kindFilter === k ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {k === "all" ? "All" : k === "invoice" ? "Invoices" : "Quotes"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => startAdd("quote")} className="text-[11px] text-white/70 hover:text-white border border-white/10 rounded-md px-2 py-1 hover:bg-white/[0.04]">
            + Quote
          </button>
          <button onClick={() => startAdd("invoice")} className="bg-cyan-500 text-black font-medium rounded-md px-2.5 py-1 text-[11px] hover:bg-cyan-400">
            + Invoice
          </button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{error}</div>}

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 md:px-5 py-3 md:py-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
            <SummaryCard label="Outstanding" value={formatPHP(totals.outstanding)} color="text-amber-400" />
            <SummaryCard label="Paid" value={formatPHP(totals.paid)} color="text-green-400" />
            <SummaryCard label="Quote pipeline" value={formatPHP(totals.quoteValue)} color="text-cyan-400" />
          </div>

          {showForm && (
            <form onSubmit={saveForm} className="mb-4 border border-white/[0.08] rounded-lg bg-[#252527] p-3 md:p-4">
              <div className="flex items-center gap-1 mb-3">
                <button type="button" onClick={() => setForm({ ...form, kind: "invoice" })} className={`px-3 py-1 rounded text-[12px] ${form.kind === "invoice" ? "bg-cyan-500/20 text-cyan-300" : "text-white/50 hover:text-white hover:bg-white/[0.04]"}`}>
                  Invoice
                </button>
                <button type="button" onClick={() => setForm({ ...form, kind: "quote" })} className={`px-3 py-1 rounded text-[12px] ${form.kind === "quote" ? "bg-cyan-500/20 text-cyan-300" : "text-white/50 hover:text-white hover:bg-white/[0.04]"}`}>
                  Quote
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="ml-auto text-[11px] text-white/40 hover:text-white/70 px-2">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Field label="Client">
                  <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value, project_id: "" })} className={inputCls}>
                    <option value="" className="bg-neutral-900">Select client…</option>
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
                <Field label="Issue date">
                  <input type="date" required value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className={inputCls} />
                </Field>
                <Field label={form.kind === "quote" ? "Valid until" : "Due date"}>
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputCls} />
                </Field>
              </div>

              <div className="border border-white/[0.08] rounded-md overflow-hidden mb-3">
                <div className="grid grid-cols-[1fr_80px_120px_110px_40px] gap-2 px-2 py-1.5 bg-white/[0.04] text-[10px] text-white/50 uppercase tracking-wider">
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Unit (PHP)</span>
                  <span className="text-right">Amount</span>
                  <span></span>
                </div>
                {form.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_80px_120px_110px_40px] gap-2 px-2 py-1.5 border-t border-white/[0.04] items-center">
                    <input type="text" value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} placeholder="Service / item" className="bg-transparent border-0 text-[12px] outline-none text-white" />
                    <input type="number" min="0" step="0.01" value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} className="bg-transparent border-0 text-[12px] outline-none text-white" />
                    <input type="number" min="0" step="0.01" value={it.unit_price} onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })} className="bg-transparent border-0 text-[12px] outline-none text-white" />
                    <span className="text-[12px] text-right text-white/80">{formatPHP(it.amount)}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-white/40 hover:text-rose-400 text-[12px]">
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addItem} className="w-full px-2 py-1.5 text-[11px] text-cyan-400 hover:bg-white/[0.04] border-t border-white/[0.04]">
                  + Add line
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3 mb-3">
                <div className="grid gap-3">
                  <Field label="Notes (shown on document)">
                    <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Thank you…" className={inputCls} />
                  </Field>
                  <Field label="Terms">
                    <textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} rows={4} className={inputCls + " resize-none"} />
                  </Field>
                </div>
                <div className="border border-white/[0.08] rounded-md p-3 text-[12px] space-y-1 self-start bg-[#1f1f21]">
                  <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span>{formatPHP(formTotals.subtotal)}</span></div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Tax</span>
                    <input type="number" step="0.01" min="0" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} className="w-14 bg-transparent border border-white/10 rounded px-1 py-0.5 text-[11px] text-right" />
                    <span className="text-white/50 text-[10px]">%</span>
                    <span>{formatPHP(formTotals.tax)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/[0.08] font-semibold text-cyan-400">
                    <span>Total</span><span>{formatPHP(formTotals.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="submit" className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400">
                  {editingId ? "Save changes" : `Create ${form.kind}`}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-[12px] text-white/50 hover:text-white px-3 py-1.5">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#1f1f21]">
            <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-white/50 uppercase tracking-wider">Documents</span>
              <span className="text-[11px] text-white/40">{invoices.length}</span>
            </div>
            {loading ? (
              <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
            ) : invoices.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-white/40 text-[12px] mb-3">No quotes or invoices yet.</p>
                <button onClick={() => startAdd("quote")} className="text-cyan-400 text-[12px] hover:text-cyan-300">
                  + Create your first quote
                </button>
              </div>
            ) : (
              <ul>
                {invoices.map((i) => {
                  const s = statusMeta(i.status);
                  return (
                    <li key={i.id} className="border-b border-white/[0.04] last:border-b-0 px-3 py-2 hover:bg-white/[0.02] flex items-center gap-3">
                      <span className={`w-1 h-7 rounded-full shrink-0 ${i.kind === "quote" ? "bg-cyan-400/60" : "bg-white/30"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[13px] font-medium">{i.number}</span>
                          <span className="text-[10px] text-white/40 uppercase">{i.kind}</span>
                          {i.contact_id && contactById.get(i.contact_id) && (
                            <span className="text-[11px] text-white/50">· {contactById.get(i.contact_id)}</span>
                          )}
                          <span className={`text-[10px] uppercase tracking-wider ${s.color}`}>· {s.label}</span>
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {formatDate(i.issue_date)}
                          {i.due_date && <> · Due {formatDate(i.due_date)}</>}
                          <> · {i.items.length} item{i.items.length !== 1 ? "s" : ""}</>
                        </div>
                      </div>
                      <span className="text-[13px] font-semibold shrink-0 text-cyan-400">{formatPHP(Number(i.total))}</span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <select
                          value={i.status}
                          onChange={(e) => updateStatus(i.id, e.target.value as InvoiceStatus)}
                          className="bg-transparent border border-white/10 rounded text-[10px] text-white/70 px-1 py-0.5 outline-none hover:border-white/20"
                        >
                          {INVOICE_STATUSES.map((st) => (
                            <option key={st.key} value={st.key} className="bg-neutral-900">{st.label}</option>
                          ))}
                        </select>
                        <button onClick={() => copyLink(i)} className="text-white/40 hover:text-cyan-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Copy public link">
                          🔗
                        </button>
                        <button onClick={() => setViewingId(i.id)} className="text-white/40 hover:text-white text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="View">
                          👁
                        </button>
                        <button onClick={() => startEdit(i)} className="text-white/40 hover:text-white text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Edit">
                          ✎
                        </button>
                        <button onClick={() => deleteInvoice(i.id)} className="text-white/40 hover:text-rose-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]" title="Delete">
                          ✕
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {viewInv && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setViewingId(null)}>
          <div className="bg-white text-black w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-10 text-[13px]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{viewInv.kind === "quote" ? "QUOTE" : "INVOICE"}</h2>
                  <p className="text-gray-600 mt-1">#{viewInv.number}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">waevpoint</p>
                  <p className="text-gray-600 text-[11px]">Drone videography & photography</p>
                  <p className="text-gray-600 text-[11px]">hello@waevpoint.quest</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6 text-[12px]">
                <div>
                  <p className="text-gray-500 uppercase text-[10px] tracking-wider mb-1">Bill to</p>
                  <p>{viewInv.contact_id ? contactById.get(viewInv.contact_id) : "—"}</p>
                </div>
                <div className="text-right">
                  <p><span className="text-gray-500">Issued:</span> {formatDate(viewInv.issue_date)}</p>
                  {viewInv.due_date && <p><span className="text-gray-500">{viewInv.kind === "quote" ? "Valid until:" : "Due:"}</span> {formatDate(viewInv.due_date)}</p>}
                  <p><span className="text-gray-500">Status:</span> {statusMeta(viewInv.status).label}</p>
                </div>
              </div>
              <table className="w-full text-[12px] mb-6">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2 w-16">Qty</th>
                    <th className="text-right py-2 w-24">Unit</th>
                    <th className="text-right py-2 w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewInv.items.map((it, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-2">{it.description}</td>
                      <td className="text-right py-2">{it.quantity}</td>
                      <td className="text-right py-2">{formatPHP(it.unit_price)}</td>
                      <td className="text-right py-2">{formatPHP(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mb-6">
                <div className="w-64 text-[12px]">
                  <div className="flex justify-between py-1"><span>Subtotal</span><span>{formatPHP(Number(viewInv.subtotal))}</span></div>
                  <div className="flex justify-between py-1"><span>Tax ({viewInv.tax_rate}%)</span><span>{formatPHP(Number(viewInv.tax_amount))}</span></div>
                  <div className="flex justify-between py-2 border-t-2 border-black font-bold text-base"><span>Total</span><span>{formatPHP(Number(viewInv.total))}</span></div>
                </div>
              </div>
              {viewInv.notes && <p className="text-[12px] text-gray-700 mb-3">{viewInv.notes}</p>}
              {viewInv.terms && <pre className="whitespace-pre-wrap text-[11px] text-gray-600 font-sans border-t border-gray-200 pt-3">{viewInv.terms}</pre>}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => window.print()} className="bg-black text-white rounded px-3 py-1.5 text-[12px]">Print / PDF</button>
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
