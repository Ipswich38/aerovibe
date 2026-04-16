import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import SignForm from "./SignForm";

export const dynamic = "force-dynamic";

export default async function SignContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: contract } = await supabaseAdmin
    .from("contracts")
    .select("id, title, content, status, signed_at, client_signature_name, public_token")
    .eq("public_token", token)
    .single();

  if (!contract) notFound();

  const alreadySigned = contract.status === "signed";
  const cancelled = contract.status === "cancelled";

  return (
    <div className="min-h-screen bg-stone-100 py-6 px-4" style={{ fontFamily: "-apple-system, sans-serif" }}>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6 md:p-10 text-[13px] text-black">
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Agreement</p>
              <h1 className="text-2xl font-bold tracking-tight mt-1">{contract.title}</h1>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">waevpoint</p>
              <p className="text-gray-600 text-[11px]">waevpoint.quest</p>
            </div>
          </div>

          {cancelled && (
            <div className="bg-rose-50 border border-rose-200 rounded p-3 mb-6 text-[12px] text-rose-800">
              This contract has been cancelled and can no longer be signed.
            </div>
          )}

          {alreadySigned && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-6 text-[12px] text-green-800">
              ✓ Signed by <strong>{contract.client_signature_name}</strong> on{" "}
              {contract.signed_at ? new Date(contract.signed_at).toLocaleString() : "—"}
            </div>
          )}

          <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed mb-6">
            {contract.content}
          </pre>

          {!alreadySigned && !cancelled && (
            <SignForm token={token} />
          )}

          <div className="mt-8 pt-4 border-t border-gray-200 text-[10px] text-gray-500">
            This agreement is governed by the laws of the Republic of the Philippines.
            Questions? Contact hello@waevpoint.quest
          </div>
        </div>
      </div>
    </div>
  );
}
