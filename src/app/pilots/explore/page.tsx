import Link from "next/link";

const V = "#8b5cf6";

export default function ExplorePage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/pilots">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.6 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>x</span>
          <span className="text-[15px] font-bold" style={{ fontFamily: "'League Spartan', sans-serif", color: V }}>
            WaevPilots
          </span>
        </div>
      </header>

      <main className="px-6 py-20 max-w-2xl mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] mb-3"
          style={{ color: V, fontFamily: "'IBM Plex Mono', monospace" }}>
          Resource map paused
        </p>
        <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'League Spartan', sans-serif" }}>
          Explore is being rebuilt for training
        </h1>
        <p className="text-sm mb-10" style={{ color: "#777" }}>
          This area will become a study and resource map for
          below-7kg review, Large RPA notes, checklist workflows, and practical-test preparation.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/pilots/guide"
            className="px-7 py-3.5 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ background: V, color: "#fff", fontFamily: "'League Spartan', sans-serif" }}>
            Open Pilot Guide
          </Link>
          <Link href="/pilots"
            className="px-7 py-3.5 rounded-xl font-semibold transition-all hover:border-white/20"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#ccc", fontFamily: "'League Spartan', sans-serif" }}>
            Back to WaevPilots
          </Link>
        </div>
      </main>
    </div>
  );
}
