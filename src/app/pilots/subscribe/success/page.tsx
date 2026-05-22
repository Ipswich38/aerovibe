"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const V = "#8b5cf6";

export default function SubscribeSuccess() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give webhook a moment to process
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-6"
      style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>

      {!ready ? (
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm" style={{ color: "#888" }}>Activating your subscription…</p>
        </div>
      ) : (
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">RP</div>
          <h1 className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "'League Spartan', sans-serif" }}>
            You&apos;re subscribed!
          </h1>
          <p className="text-[14px] mb-2" style={{ color: "#888" }}>
            Your WaevPilots subscription is now active.
          </p>
          <p className="text-[13px] mb-10" style={{ color: "#666" }}>
            Study, checklist, and logbook tools are now unlocked for your pilot profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pilots/dashboard"
              className="px-7 py-3.5 rounded-xl font-semibold transition-all hover:opacity-90"
              style={{ background: V, color: "#fff", fontFamily: "'League Spartan', sans-serif" }}>
              Go to Dashboard
            </Link>
            <Link href="/pilots/subscribe"
              className="px-7 py-3.5 rounded-xl font-semibold transition-all hover:border-white/20"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#ccc", fontFamily: "'League Spartan', sans-serif" }}>
              Manage Subscription
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
