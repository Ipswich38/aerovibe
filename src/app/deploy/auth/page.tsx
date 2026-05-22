"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const V = "#8b5cf6";

const ROLE_COPY = {
  pilot: {
    title: "Pilot access",
    desc: "Create your pilot profile, get listed on the map, and match to client demand.",
  },
  client: {
    title: "Client access",
    desc: "Post jobs, search pilots on the map, and keep the workflow in one place.",
  },
} as const;

export default function DeployAuthPage() {
  const supabase = createSupabaseBrowser();
  const [role, setRole] = useState<"pilot" | "client">("pilot");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = "/deploy/onboarding";
    });
  }, [supabase]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const next = encodeURIComponent(`/deploy/onboarding?role=${role}`);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/deploy/auth/callback?next=${next}`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  async function signInWithGoogle() {
    setGoogleLoad(true);
    setError("");
    const next = encodeURIComponent(`/deploy/onboarding?role=${role}`);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/deploy/auth/callback?next=${next}`,
      },
    });
    if (err) {
      setError(err.message);
      setGoogleLoad(false);
    }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/deploy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.65 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.22)" }}>×</span>
          <span className="text-[15px] font-bold" style={{ fontFamily: "'League Spartan', sans-serif", color: V }}>Deploy</span>
        </div>
        <Link href="/deploy" className="text-[11px] text-white/45 hover:text-white/70">
          Back
        </Link>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">Role selection</p>
          <h1 className="mt-3 text-[clamp(2.3rem,5vw,4.5rem)] leading-[0.98]" style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 900 }}>
            Separate sign-in paths for pilots and clients.
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-white/65">
            Choose the role you want to use on Deploy. The same account can later hold both roles if you need it.
          </p>

          <div className="mt-6 grid gap-3">
            {(["pilot", "client"] as const).map((item) => {
              const active = role === item;
              return (
                <button
                  key={item}
                  onClick={() => setRole(item)}
                  className="rounded-2xl border p-4 text-left transition-all"
                  style={{
                    background: active ? "rgba(168,139,250,0.14)" : "rgba(255,255,255,0.035)",
                    borderColor: active ? "rgba(168,139,250,0.35)" : "rgba(255,255,255,0.07)",
                  }}
                >
                  <p className="text-[13px] font-semibold text-white">{ROLE_COPY[item].title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/45">{ROLE_COPY[item].desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#141416] p-5 md:p-6">
          {sent ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/12 text-violet-200">
                ✓
              </div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'League Spartan', sans-serif" }}>Check your email</h2>
              <p className="mt-2 text-[13px] text-white/60">
                We sent a magic link to <strong className="text-white">{email}</strong>. Continue as {role}.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">Login or sign up</p>
                <h2 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  {role === "pilot" ? "Pilot access" : "Client access"}
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-white/55">
                  {role === "pilot"
                    ? "Use this to create your pilot profile, appear on the map, and handle client matches."
                    : "Use this to post jobs, review pilot coverage, and manage inquiries."}
                </p>
              </div>

              {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">{error}</div>}

              <button
                onClick={signInWithGoogle}
                disabled={googleLoad}
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.05] py-3 text-[14px] font-medium text-white/85 transition-all hover:border-white/20"
              >
                {googleLoad ? "Opening Google..." : "Continue with Google"}
              </button>

              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <span className="text-[11px] text-white/30">or magic link</span>
                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              <form onSubmit={sendMagicLink} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full rounded-xl py-3 text-[14px] font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: V, fontFamily: "'League Spartan', sans-serif" }}
                >
                  {loading ? "Sending..." : `Send ${role === "pilot" ? "pilot" : "client"} link`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
