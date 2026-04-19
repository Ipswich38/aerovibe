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
  loadSidebarCollapsed,
  saveSidebarCollapsed,
} from "@/lib/ops";
import { OpsContext } from "./OpsContext";
import PanchiAssistant from "./PanchiAssistant";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface Department {
  key: string;
  label: string;
  icon: string;
  items: NavItem[];
}

const DEPARTMENTS: Department[] = [
  {
    key: "field",
    label: "Field Ops",
    icon: "✈",
    items: [
      { href: "/ops/missions", label: "Missions", icon: "◇" },
      { href: "/ops/flights", label: "Flights", icon: "✈" },
      { href: "/ops/map", label: "Map", icon: "◎" },
      { href: "/ops/surveys", label: "Surveys", icon: "▣" },
    ],
  },
  {
    key: "production",
    label: "Production",
    icon: "◈",
    items: [
      { href: "/ops/studio", label: "Studio", icon: "◈" },
      { href: "/ops/ingest", label: "Ingest", icon: "↓" },
    ],
  },
  {
    key: "manage",
    label: "Manage",
    icon: "▦",
    items: [
      { href: "/ops/calendar", label: "Calendar", icon: "▥" },
      { href: "/ops/projects", label: "Projects", icon: "▦" },
      { href: "/ops/activity", label: "Activity", icon: "◷" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: "◐",
    items: [
      { href: "/ops/blitz", label: "Blitz", icon: "◐" },
    ],
  },
  {
    key: "crm",
    label: "CRM",
    icon: "◉",
    items: [
      { href: "/ops/leads", label: "Leads", icon: "⌕" },
      { href: "/ops/clients", label: "Clients", icon: "◉" },
      { href: "/ops/contracts", label: "Contracts", icon: "✎" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    icon: "₱",
    items: [
      { href: "/ops/wavi", label: "Wavi", icon: "₩" },
      { href: "/ops/invoices", label: "Invoices", icon: "₱" },
      { href: "/ops/books", label: "Books", icon: "≡" },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: "✉",
    items: [{ href: "/ops/inbox", label: "Messages", icon: "✉" }],
  },
];

function Logo({ size = 22 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo.png" alt="waevpoint" style={{ height: size, width: "auto" }} />
  );
}

function activeDepartment(pathname: string): string {
  if (pathname.startsWith("/ops/flight-assist")) return "flight-assist";
  for (const dept of DEPARTMENTS) {
    if (dept.items.some((i) => pathname.startsWith(i.href))) return dept.key;
  }
  return "field";
}

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const activeDept = activeDepartment(pathname);

  useEffect(() => {
    setHydrated(true);
    const session = loadSession();
    if (session) {
      setToken(session.token);
      setAuthed(true);
    }
    setCollapsed(loadSidebarCollapsed());
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

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    saveSidebarCollapsed(next);
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
      <div className="h-screen flex text-white" style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 bg-[#2c2c2e] border-r border-white/[0.08]
            flex flex-col transition-all duration-200 ease-out
            lg:static lg:translate-x-0 lg:z-auto
            ${collapsed ? "w-14" : "w-56"}
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Logo header */}
          <div className="h-12 flex items-center justify-between px-3 border-b border-white/[0.06] shrink-0">
            <Link href="/ops/inbox" className="flex items-center gap-2 hover:opacity-80 transition-opacity overflow-hidden">
              <Logo size={20} />
              {!collapsed && <span className="text-[13px] font-semibold tracking-tight whitespace-nowrap">waevpoint</span>}
            </Link>
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-6 h-6 items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {collapsed ? (
                  <path d="M5 3l4 4-4 4" />
                ) : (
                  <path d="M9 3L5 7l4 4" />
                )}
              </svg>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-2 px-1.5">
            {/* Flight Assist — primary CTA */}
            {collapsed ? (
              <Link
                href="/ops/flight-assist"
                title="Captain Panchi"
                className={`
                  flex items-center justify-center w-full py-2 rounded-lg text-[13px] mb-2 transition-colors
                  ${pathname.startsWith("/ops/flight-assist")
                    ? "bg-cyan-500 text-black"
                    : "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                  }
                `}
              >
                <span className="text-[13px]">⚡</span>
              </Link>
            ) : (
              <Link
                href="/ops/flight-assist"
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold mb-2 transition-colors
                  ${pathname.startsWith("/ops/flight-assist")
                    ? "bg-cyan-500 text-black"
                    : "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                  }
                `}
              >
                <span className="w-5 text-center text-[12px]">⚡</span>
                <span>Captain Panchi</span>
              </Link>
            )}

            {DEPARTMENTS.map((dept) => {
              const isActive = activeDept === dept.key;
              const singleItem = dept.items.length === 1;

              if (collapsed) {
                return (
                  <div key={dept.key} className="mb-0.5">
                    {dept.items.map((item) => {
                      const itemActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          className={`
                            flex items-center justify-center w-full py-2 rounded-lg text-[13px] transition-colors mb-0.5
                            ${itemActive
                              ? "bg-cyan-500/15 text-cyan-300"
                              : "text-white/55 hover:text-white hover:bg-white/[0.05]"
                            }
                          `}
                        >
                          <span className="text-[13px]">{item.icon}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              }

              if (singleItem) {
                const item = dept.items[0];
                const itemActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={dept.key}
                    href={item.href}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors mb-0.5
                      ${itemActive
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                      }
                    `}
                  >
                    <span className="w-5 text-center text-[12px] opacity-80">{dept.icon}</span>
                    <span className="font-medium">{dept.label}</span>
                  </Link>
                );
              }

              return (
                <div key={dept.key} className="mb-1">
                  <div
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] mb-0.5
                      ${isActive ? "text-white" : "text-white/45"}
                    `}
                  >
                    <span className="w-5 text-center text-[12px] opacity-80">{dept.icon}</span>
                    <span className="font-semibold uppercase text-[10px] tracking-widest">{dept.label}</span>
                  </div>
                  <div className="ml-3 border-l border-white/[0.06] pl-2">
                    {dept.items.map((item) => {
                      const itemActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-colors
                            ${itemActive
                              ? "bg-cyan-500/15 text-cyan-300"
                              : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                            }
                          `}
                        >
                          <span className="w-4 text-center text-[11px] opacity-70">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-2 py-3 border-t border-white/[0.06] shrink-0 space-y-1">
            <Link
              href="/"
              target="_blank"
              title={collapsed ? "View site" : undefined}
              className={`
                w-full text-[11px] text-white/40 hover:text-white py-1.5 rounded hover:bg-white/[0.06] transition-colors block
                ${collapsed ? "flex items-center justify-center" : "text-left px-2"}
              `}
            >
              {collapsed ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8M8 2h4v4M6 8l6-6" />
                </svg>
              ) : (
                "View site ↗"
              )}
            </Link>
            <button
              onClick={logout}
              title={collapsed ? "Sign out" : undefined}
              className={`
                w-full text-[11px] text-white/40 hover:text-white py-1.5 rounded hover:bg-white/[0.06] transition-colors
                ${collapsed ? "flex items-center justify-center" : "text-left px-2"}
              `}
            >
              {collapsed ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h2M9 10l3-3-3-3M12 7H5" />
                </svg>
              ) : (
                "Sign out"
              )}
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="h-12 flex items-center justify-between px-3 border-b border-white/[0.08] bg-[#252527] shrink-0 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/[0.06]"
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 5h12M3 9h12M3 13h12" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <Logo size={18} />
              <span className="text-[12px] font-semibold">{DEPARTMENTS.find((d) => d.key === activeDept)?.label}</span>
            </div>
            <div className="w-9" />
          </header>

          {/* Content */}
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>

        {/* Panchi AI Assistant */}
        <PanchiAssistant />
      </div>
    </OpsContext.Provider>
  );
}
