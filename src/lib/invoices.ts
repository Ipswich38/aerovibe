export type InvoiceKind = "quote" | "invoice";
export type InvoiceStatus = "draft" | "sent" | "accepted" | "paid" | "cancelled" | "overdue";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  kind: InvoiceKind;
  number: string;
  contact_id: string | null;
  project_id: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  public_token: string | null;
  paid_at: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export const INVOICE_STATUSES: { key: InvoiceStatus; label: string; color: string }[] = [
  { key: "draft", label: "Draft", color: "text-white/50" },
  { key: "sent", label: "Sent", color: "text-cyan-400" },
  { key: "accepted", label: "Accepted", color: "text-blue-400" },
  { key: "paid", label: "Paid", color: "text-green-400" },
  { key: "overdue", label: "Overdue", color: "text-rose-400" },
  { key: "cancelled", label: "Cancelled", color: "text-white/30" },
];

export function statusMeta(key: string): { label: string; color: string } {
  return INVOICE_STATUSES.find((s) => s.key === key) || { label: key, color: "text-white/50" };
}

export const DEFAULT_TERMS = `Payment due within 7 days of invoice date.
Accepted: GCash, bank transfer. Contact hello@waevpoint.quest for payment details.

Thank you for choosing waevpoint.`;

export function computeItemAmount(qty: number, price: number): number {
  return Math.round(qty * price * 100) / 100;
}

export function computeTotals(items: InvoiceItem[], taxRate: number) {
  const subtotal = items.reduce((s, i) => s + Number(i.amount), 0);
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}
