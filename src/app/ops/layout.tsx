"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SYSTEM_FONT,
  loadSession,
  saveSession,
  touchSession,
  clearSession,
} from "@/lib/ops";
import { OpsContext } from "./OpsContext";

const MODULES = [
  { href: "/ops/inbox", label: "Inbox", icon: "✉" },
  { href: "/ops/leads", label: "Leads", icon: "⌕" },
  { href: "/ops/clients", label: "Clients", icon: "◉" },
  { href: "/ops/invoices", label: "Invoices", icon: "₱" },
  { href: "/ops/contracts", label: "Contracts", icon: "✎" },
  { href: "/ops/flights", label: "Flights", icon: "✈" },
  { href: "/ops/map", label: "Map", icon: "◎" },
  { href: "/ops/missions", label: "Missions", icon: "◇" },
  { href: "/ops/ingest", label: "Ingest", icon: "↓" },
  { href: "/ops/surveys", label: "Surveys", icon: "▣" },
  { href: "/ops/books", label: "Books", icon: "≡" },
];

function Logo({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo.png" alt="waevpoint" style={{ height: size, width: "auto" }} className={className} />
  );
}

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setHydrated(true);
    const session = loadSession();
    if (session) {
      setToken(session.token);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const events = ["click", "keydown", "scroll", "mousemove"];
    let throttle = 0;
    const handler = () => {
      const now = Date.now();
      if (now - throttle < 30000) return;
      throttle = now;
      touchSession();
    };
    events.forEach((ev) => window.addEventListener(ev, handler, { passive: true }));
    const interval = setInterval(() => {
      if (!loadSession()) {
        setAuthed(false);
        setToken("");
        setError("Session expired. Please sign in again.");
      }
    }, 60_000);
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handler));
      clearInterval(interval);
    };
  }, [authed]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setToken(password);
    setAuthed(true);
    saveSession(password);
    setPassword("");
    setError("");
  }

  function logout() {
    clearSession();
    setAuthed(false);
    setToken("");
  }

  if (!hydrated) {
    return <div className="min-h-screen" style={{ background: "#1c1c1e" }} />;
  }

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
      >
        <form onSubmit={handleLogin} className="w-full max-w-xs">
          <div className="flex flex-col items-center mb-8">
            <Logo size={56} />
            <h1 className="text-white text-[15px] font-semibold mt-4">Ops</h1>
            <p className="text-white/40 text-[12px] mt-1">Sign in to continue</p>
          </div>
          {error && <p className="text-amber-400 text-[12px] mb-3 text-center">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-white text-[13px] outline-none focus:border-cyan-400/50 mb-3"
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 text-black font-medium rounded-md py-2.5 text-[13px] hover:bg-cyan-400 transition-colors"
          >
            Sign in
          </button>
          <p className="text-white/30 text-[11px] mt-4 text-center">
            Sessions expire after 24 hours of inactivity.
          </p>
        </form>
      </div>
    );
  }

  return (
    <OpsContext.Provider value={{ token, logout }}>
      <div className="h-screen flex flex-col text-white" style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}>
        <header className="h-11 flex items-center justify-between px-3 border-b border-white/[0.08] bg-[#2c2c2e] shrink-0 gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0" title="Back to site">
            <Logo size={22} />
            <span className="text-[13px] font-semibold hidden sm:inline">waevpoint</span>
          </Link>

          <nav className="flex items-center gap-0.5 flex-1 justify-center sm:justify-start sm:ml-2 overflow-x-auto">
            {MODULES.map((m) => {
              const active = pathname.startsWith(m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] transition-colors shrink-0 ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-[11px] opacity-70">{m.icon}</span>
                  <span>{m.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="text-[11px] text-white/50 hover:text-white px-2 py-1 rounded hover:bg-white/[0.06] shrink-0"
          >
            Logout
          </button>
        </header>

        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </OpsContext.Provider>
  );
}
