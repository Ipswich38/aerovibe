export type TxKind = "income" | "expense";

export interface Transaction {
  id: string;
  kind: TxKind;
  date: string;
  amount: number;
  currency: string;
  category: string;
  vendor: string | null;
  description: string | null;
  receipt_url: string | null;
  contact_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const EXPENSE_CATEGORIES = [
  "Equipment",
  "Software",
  "Training",
  "Marketing",
  "Transport",
  "Utilities",
  "Office",
  "Insurance",
  "Taxes & Fees",
  "Other",
];

export const INCOME_CATEGORIES = [
  "Drone Services",
  "Photo Services",
  "Consultation",
  "Other",
];

export function formatPHP(n: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export type Period = "30d" | "month" | "last_month" | "year" | "all";

export function periodRange(period: Period): { from: string | null; to: string | null; label: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  if (period === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString().slice(0, 10), to: today, label: "Last 30 days" };
  }
  if (period === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: from.toISOString().slice(0, 10), to: today, label: "This month" };
  }
  if (period === "last_month") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      label: "Last month",
    };
  }
  if (period === "year") {
    const from = new Date(now.getFullYear(), 0, 1);
    return { from: from.toISOString().slice(0, 10), to: today, label: "This year" };
  }
  return { from: null, to: null, label: "All time" };
}
