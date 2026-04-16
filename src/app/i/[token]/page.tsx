import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { InvoiceItem, statusMeta } from "@/lib/invoices";
import { formatPHP, formatDate } from "@/lib/books";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: inv } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("public_token", token)
    .single();

  if (!inv) notFound();

  let clientName: string | null = null;
  if (inv.contact_id) {
    const { data: c } = await supabaseAdmin.from("contacts").select("name").eq("id", inv.contact_id).single();
    clientName = c?.name || null;
  }

  const items = (inv.items as InvoiceItem[]) || [];
  const s = statusMeta(inv.status);
  const isQuote = inv.kind === "quote";

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 print:bg-white print:py-0 print:px-0" style={{ fontFamily: "-apple-system, sans-serif" }}>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm print:shadow-none print:rounded-none">
        <div className="p-6 md:p-10 text-[13px] text-black">
          <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{isQuote ? "QUOTE" : "INVOICE"}</h1>
              <p className="text-gray-600 mt-1">#{inv.number}</p>
              <p className={`mt-2 inline-block text-[11px] uppercase tracking-wider px-2 py-0.5 rounded ${
                inv.status === "paid" ? "bg-green-100 text-green-700" :
                inv.status === "overdue" ? "bg-rose-100 text-rose-700" :
                inv.status === "cancelled" ? "bg-gray-100 text-gray-500" :
                "bg-blue-100 text-blue-700"
              }`}>{s.label}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">waevpoint</p>
              <p className="text-gray-600 text-[11px]">Drone videography & photography</p>
              <p className="text-gray-600 text-[11px]">Philippines</p>
              <p className="text-gray-600 text-[11px] mt-1">hello@waevpoint.quest</p>
              <p className="text-gray-600 text-[11px]">waevpoint.quest</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 text-[12px]">
            <div>
              <p className="text-gray-500 uppercase text-[10px] tracking-wider mb-1">Bill to</p>
              <p className="font-medium">{clientName || "—"}</p>
            </div>
            <div className="text-right">
              <p className="mb-0.5"><span className="text-gray-500">Issued:</span> {formatDate(inv.issue_date)}</p>
              {inv.due_date && (
                <p><span className="text-gray-500">{isQuote ? "Valid until:" : "Due:"}</span> {formatDate(inv.due_date)}</p>
              )}
            </div>
          </div>

          <table className="w-full text-[12px] mb-6">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 font-semibold">Description</th>
                <th className="text-right py-2 w-16 font-semibold">Qty</th>
                <th className="text-right py-2 w-28 font-semibold">Unit</th>
                <th className="text-right py-2 w-28 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
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
              <div className="flex justify-between py-1"><span className="text-gray-600">Subtotal</span><span>{formatPHP(Number(inv.subtotal))}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-600">Tax ({inv.tax_rate}%)</span><span>{formatPHP(Number(inv.tax_amount))}</span></div>
              <div className="flex justify-between py-2 border-t-2 border-black font-bold text-lg mt-1"><span>Total</span><span>{formatPHP(Number(inv.total))}</span></div>
            </div>
          </div>

          {inv.notes && <p className="text-[12px] text-gray-700 mb-4">{inv.notes}</p>}

          {inv.terms && (
            <div className="border-t border-gray-200 pt-4 mt-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Terms</p>
              <pre className="whitespace-pre-wrap text-[11px] text-gray-700 font-sans">{inv.terms}</pre>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between print:hidden">
            <p className="text-[10px] text-gray-500">Questions? Reply to this email or message us at hello@waevpoint.quest</p>
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  );
}
