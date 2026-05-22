import Link from "next/link";
import DeployMap from "@/components/DeployMap";

const V = "#8b5cf6";

const FEATURES = [
  { title: "Pilot signup", desc: "Licensed pilots create a profile, set services, and show up on the map." },
  { title: "Client signup", desc: "Clients post jobs, find pilots, and move from inquiry to match." },
  { title: "Live map", desc: "Use coordinates, service filters, and visible coverage to shortlist fast." },
  { title: "Shared ops", desc: "Same data model, one platform, separated sign-in paths." },
];

export default function DeployHome() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.65 }} />
          <span style={{ color: "rgba(255,255,255,0.22)" }}>×</span>
          <span className="text-[15px] font-bold" style={{ fontFamily: "'League Spartan', sans-serif", color: V }}>Deploy</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/deploy/auth?role=pilot" className="rounded-lg px-4 py-1.5 text-[12px] text-white/70" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Pilot login
          </Link>
          <Link href="/deploy/auth?role=client" className="rounded-lg px-4 py-1.5 text-[12px] text-white" style={{ background: V }}>
            Client signup
          </Link>
        </div>
      </header>

      <main className="px-6 py-8 md:py-10">
        <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] tracking-[0.14em] text-white/70">
              PILOTS + CLIENTS · LIVE MATCHING
            </div>
            <h1 className="mt-5 max-w-2xl text-[clamp(3rem,7vw,6rem)] leading-[0.95]" style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 900 }}>
              One platform.
              <span className="block" style={{ color: "#c4b5fd" }}>Separate flows.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[clamp(1rem,2vw,1.15rem)] leading-relaxed text-white/70">
              Deploy connects licensed pilots and clients with a shared map, clean role-based signup, and a simple path from profile to posting and matching.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/deploy/auth?role=pilot" className="rounded-xl px-6 py-3 text-[13px] font-semibold text-white" style={{ background: V, fontFamily: "'League Spartan', sans-serif" }}>
                Join as Pilot
              </Link>
              <Link href="/deploy/auth?role=client" className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-6 py-3 text-[13px] font-semibold text-white/80" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                Join as Client
              </Link>
              <Link href="/deploy/dashboard" className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-6 py-3 text-[13px] font-semibold text-white/60" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                Open Dashboard
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <p className="text-[13px] font-semibold text-white">{feature.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/48">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <DeployMap compact />
        </section>
      </main>
    </div>
  );
}
