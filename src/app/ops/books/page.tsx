"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Period,
  Transaction,
  TxKind,
  formatDate,
  formatPHP,
  periodRange,
} from "@/lib/books";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

const PERIODS: { key: Period; label: string }[] = [
  { key: "30d", label: "30d" },
  { key: "month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "year", label: "This year" },
  { key: "all", label: "All" },
];

interface FormState {
  kind: TxKind;
  date: string;
  amount: string;
  category: string;
  customCategory: string;
  vendor: string;
  description: string;
  receipt_url: string;
  notes: string;
}

function blankForm(kind: TxKind = "expense"): FormState {
  return {
    kind,
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    category: "",
    customCategory: "",
    vendor: "",
    description: "",
    receipt_url: "",
    notes: "",
  };
}

export default function BooksPage() {
  const { token, logout } = useOps();
  const [period, setPeriod] = useState<Period>("month");
  const [kindFilter, setKindFilter] = useState<"all" | TxKind>("all");
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [saving, setSaving] = useState(false);

  const range = useMemo(() => periodRange(period), [period]);

  const fetchTxs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    if (kindFilter !== "all") params.set("kind", kindFilter);
    const res = await fetch(`/api/transactions?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) {
      setError("Failed to load transactions");
      setLoading(false);
      return;
    }
    setError("");
    setTxs(await res.json());
    setLoading(false);
  }, [range, kindFilter, token, logout]);

  useEffect(() => {
    fetchTxs();
  }, [fetchTxs]);

  const totals = useMemo(() => {
    const income = txs.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = txs.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0);
    return { income, expenses, net: income - expenses };
  }, [txs]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { kind: TxKind; amount: number }>();
    for (const t of txs) {
      const key = `${t.kind}:${t.category}`;
      const prev = map.get(key);
      if (prev) prev.amount += Number(t.amount);
      else map.set(key, { kind: t.kind, amount: Number(t.amount) });
    }
    const rows: { kind: TxKind; category: string; amount: number }[] = [];
    for (const [k, v] of map) {
      const [, category] = k.split(":", 2);
      rows.push({ kind: v.kind, category, amount: v.amount });
    }
    rows.sort((a, b) => b.amount - a.amount);
    return rows;
  }, [txs]);

  function startAdd(kind: TxKind = "expense") {
    setForm(blankForm(kind));
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(t: Transaction) {
    const cats = t.kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const known = cats.includes(t.category);
    setForm({
      kind: t.kind,
      date: t.date,
      amount: String(t.amount),
      category: known ? t.category : "__custom__",
      customCategory: known ? "" : t.category,
      vendor: t.vendor || "",
      description: t.description || "",
      receipt_url: t.receipt_url || "",
      notes: t.notes || "",
    });
    setEditingId(t.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!Number.isFinite(amt) || amt < 0) {
      setError("Enter a valid amount");
      return;
    }
    const category =
      form.category === "__custom__" ? form.customCategory.trim() : form.category.trim();
    if (!category) {
      setError("Pick or type a category");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      kind: form.kind,
      date: form.date,
      amount: amt,
      category,
      vendor: form.vendor,
      description: form.description,
      receipt_url: form.receipt_url,
      notes: form.notes,
    };

    const url = editingId ? `/api/transactions/${editingId}` : "/api/transactions";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Failed to save");
      return;
    }
    setShowForm(false);
    setEditingId(null);
    fetchTxs();
  }

  async function deleteTx(id: string) {
    if (!confirm("Delete this transaction?")) return;
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchTxs();
  }

  const cats = form.kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div
      className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#252527] shrink-0 gap-2 overflow-x-auto">
        <div className="flex items-center gap-0.5 shrink-0">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors shrink-0 ${
                period === p.key ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-0.5">
            {(["all", "income", "expense"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  kindFilter === k ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {k === "all" ? "All" : k === "income" ? "Income" : "Expense"}
              </button>
            ))}
          </div>
          <button
            onClick={() => startAdd("expense")}
            className="bg-cyan-500 text-black font-medium rounded-md px-2.5 py-1 text-[11px] hover:bg-cyan-400 transition-colors shrink-0"
          >
            + Add
          </button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{error}</div>}

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 md:px-5 py-3 md:py-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
            <SummaryCard label="Income" value={formatPHP(totals.income)} color="text-green-400" />
            <SummaryCard label="Expenses" value={formatPHP(totals.expenses)} color="text-rose-400" />
            <SummaryCard
              label="Net"
              value={formatPHP(totals.net)}
              color={totals.net >= 0 ? "text-cyan-400" : "text-amber-400"}
            />
          </div>

          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">{range.label}</p>

          {showForm && (
            <form
              onSubmit={saveForm}
              className="mb-4 border border-white/[0.08] rounded-lg bg-[#252527] p-3 md:p-4"
            >
              <div className="flex items-center gap-1 mb-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, kind: "expense", category: "" }))}
                  className={`px-3 py-1 rounded text-[12px] transition-colors ${
                    form.kind === "expense"
                      ? "bg-rose-500/20 text-rose-300"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, kind: "income", category: "" }))}
                  className={`px-3 py-1 rounded text-[12px] transition-colors ${
                    form.kind === "income"
                      ? "bg-green-500/20 text-green-300"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="ml-auto text-[11px] text-white/40 hover:text-white/70 px-2"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Amount (PHP)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    autoFocus
                    required
                    className={inputCls}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Date">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className={inputCls}
                  />
                </Field>
                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className={inputCls}
                  >
                    <option value="" className="bg-neutral-900">
                      Select…
                    </option>
                    {cats.map((c) => (
                      <option key={c} value={c} className="bg-neutral-900">
                        {c}
                      </option>
                    ))}
                    <option value="__custom__" className="bg-neutral-900">
                      Custom…
                    </option>
                  </select>
                </Field>
                {form.category === "__custom__" && (
                  <Field label="Custom category">
                    <input
                      type="text"
                      value={form.customCategory}
                      onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                      placeholder="e.g. Drone repair"
                      className={inputCls}
                    />
                  </Field>
                )}
                <Field label={form.kind === "income" ? "From (payer)" : "Vendor / Paid to"}>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder={form.kind === "income" ? "Client name" : "e.g. DJI, Lazada, Shopee"}
                    className={inputCls}
                  />
                </Field>
                <Field label="Description">
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description"
                    className={inputCls}
                  />
                </Field>
                <Field label="Receipt URL (optional)">
                  <input
                    type="url"
                    value={form.receipt_url}
                    onChange={(e) => setForm({ ...form, receipt_url: e.target.value })}
                    placeholder="https://…"
                    className={inputCls}
                  />
                </Field>
                <Field label="Notes (optional)">
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Internal notes"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add transaction"}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-[12px] text-white/50 hover:text-white px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3 md:gap-4">
            <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#1f1f21]">
              <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-white/50 uppercase tracking-wider">Transactions</span>
                <span className="text-[11px] text-white/40">{txs.length}</span>
              </div>
              {loading ? (
                <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
              ) : txs.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-white/40 text-[12px] mb-3">No transactions yet for {range.label.toLowerCase()}.</p>
                  <button
                    onClick={() => startAdd("expense")}
                    className="text-cyan-400 text-[12px] hover:text-cyan-300"
                  >
                    + Log your first expense
                  </button>
                </div>
              ) : (
                <ul>
                  {txs.map((t) => (
                    <li key={t.id} className="border-b border-white/[0.04] last:border-b-0">
                      <div className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.02]">
                        <span
                          className={`w-1 h-7 rounded-full shrink-0 ${
                            t.kind === "income" ? "bg-green-400/70" : "bg-rose-400/70"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[13px] font-medium truncate">
                              {t.vendor || t.description || t.category}
                            </span>
                            <span className="text-[10px] text-white/40 shrink-0">{formatDate(t.date)}</span>
                          </div>
                          <div className="text-[11px] text-white/50 truncate">
                            <span className="text-white/60">{t.category}</span>
                            {t.description && t.vendor && <span> · {t.description}</span>}
                            {t.receipt_url && (
                              <>
                                {" · "}
                                <a
                                  href={t.receipt_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-400 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  receipt
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[13px] font-semibold shrink-0 ${
                            t.kind === "income" ? "text-green-400" : "text-rose-400"
                          }`}
                        >
                          {t.kind === "income" ? "+" : "−"}
                          {formatPHP(Number(t.amount))}
                        </span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => startEdit(t)}
                            className="text-white/40 hover:text-white text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteTx(t.id)}
                            className="text-white/40 hover:text-rose-400 text-[11px] px-1.5 py-1 rounded hover:bg-white/[0.06]"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#1f1f21]">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <span className="text-[11px] text-white/50 uppercase tracking-wider">By category</span>
              </div>
              {byCategory.length === 0 ? (
                <p className="text-white/30 text-[11px] text-center py-6">—</p>
              ) : (
                <ul>
                  {byCategory.map((c) => (
                    <li
                      key={`${c.kind}:${c.category}`}
                      className="px-3 py-1.5 flex items-center justify-between border-b border-white/[0.04] last:border-b-0"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            c.kind === "income" ? "bg-green-400" : "bg-rose-400"
                          }`}
                        />
                        <span className="text-[12px] text-white/80 truncate">{c.category}</span>
                      </span>
                      <span className="text-[11px] text-white/60 shrink-0">{formatPHP(c.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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
