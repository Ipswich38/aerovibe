"use client";

import { useState } from "react";

export default function SignForm({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ name: string; signedAt: string } | null>(null);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please type your full legal name");
      return;
    }
    if (!agree) {
      setError("Please check the agreement box");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/public/contracts/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature_name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to sign" }));
        setError(err.error || "Failed to sign");
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      setDone({ name: data.client_signature_name, signedAt: data.signed_at });
    } catch {
      setError("Network error — please try again");
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
        <p className="text-2xl mb-2">✓</p>
        <p className="font-semibold text-green-900">Signed successfully</p>
        <p className="text-[12px] text-green-800 mt-1">
          {done.name} · {new Date(done.signedAt).toLocaleString()}
        </p>
        <p className="text-[11px] text-green-700 mt-3">
          Thank you. A copy has been saved. You may now close this page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSign} className="border-t-2 border-black pt-6 mt-6">
      <h2 className="font-bold text-lg mb-3">Sign to accept</h2>
      <p className="text-[12px] text-gray-700 mb-4">
        Typing your full legal name below constitutes an electronic signature with the same legal
        effect as a handwritten signature.
      </p>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[12px] p-2 rounded mb-3">{error}</div>}

      <div className="mb-3">
        <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">Your full legal name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Juan dela Cruz"
          className="w-full border-2 border-gray-300 rounded px-3 py-2 text-[14px] focus:border-black outline-none"
          autoComplete="name"
        />
        {name && (
          <p className="mt-2 text-2xl italic border-b-2 border-black pb-2 max-w-xs" style={{ fontFamily: "'Caveat', cursive" }}>
            {name}
          </p>
        )}
      </div>

      <label className="flex items-start gap-2 mb-4 text-[12px] text-gray-800 cursor-pointer">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
        <span>
          I have read, understood, and agree to the terms of this agreement.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting || !name.trim() || !agree}
        className="bg-black text-white font-semibold rounded px-5 py-2.5 text-[13px] hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Signing…" : "Sign agreement"}
      </button>
    </form>
  );
}
