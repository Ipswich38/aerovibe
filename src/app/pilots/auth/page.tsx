"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const V = "#8b5cf6";

export default function PilotAuthPage() {
  const [email,      setEmail]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [sent,       setSent]       = useState(false);
  const [error,      setError]      = useState("");
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    // Read error from URL
    const urlError = new URLSearchParams(window.location.search).get("error");
    if (urlError) setError(urlError);
    // If already logged in → go to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = "/pilots/dashboard";
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/pilots/auth/callback`,
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  async function signInWithGoogle() {
    setGoogleLoad(true); setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/pilots/auth/callback`,
      },
    });
    if (err) { setError(err.message); setGoogleLoad(false); }
  }

  return (
    <div className="min-h-screen text-white flex flex-col"
      style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>

      <header className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/pilots">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.6 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>×</span>
          <span className="font-bold text-[15px]" style={{ color: V, fontFamily: "'League Spartan', sans-serif" }}>
            WaevPilots
          </span>
        </div>
        <Link href="/pilots" className="text-[11px] hover:text-white transition-colors" style={{ color: "#555" }}>
          ← Marketplace
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(139,92,246,0.15)", border: `1px solid ${V}40` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={V} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                Check your email
              </h2>
              <p className="text-sm mb-2" style={{ color: "#888" }}>
                We sent a magic link to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-sm mb-8" style={{ color: "#666" }}>
                Click the link to continue. New accounts go to profile setup.
                Returning members go straight to the dashboard.
              </p>
              <button onClick={() => setSent(false)}
                className="text-[12px] hover:text-white transition-colors" style={{ color: "#555" }}>
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🚁</div>
                <h1 className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  Welcome to WaevPilots
                </h1>
                <p className="text-[13px]" style={{ color: "#666" }}>
                  New here? We&apos;ll set up your profile after sign in.
                  Returning? You&apos;ll go straight to your dashboard.
                </p>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 mb-5"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-[13px]" style={{ color: "#ef4444" }}>
                    {error === "auth_failed" ? "Authentication failed. Please try again." : error}
                  </p>
                </div>
              )}

              {/* Google */}
              <button onClick={signInWithGoogle} disabled={googleLoad}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-4 font-medium text-[14px] transition-all hover:border-white/25"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#ddd" }}>
                {googleLoad ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                <span className="text-[11px]" style={{ color: "#444" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Magic link */}
              <form onSubmit={sendMagicLink} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button type="submit" disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-xl font-semibold text-[14px] transition-all"
                  style={{
                    background: loading ? `${V}60` : V,
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'League Spartan', sans-serif",
                  }}>
                  {loading ? "Sending…" : "Send Magic Link"}
                </button>
              </form>

              <p className="text-[11px] text-center mt-6" style={{ color: "#444" }}>
                <Link href="/pilots" className="hover:text-white transition-colors" style={{ color: "#666" }}>
                  ← Back to WaevPilots
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
