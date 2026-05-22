import Link from "next/link";

const V = "#8b5cf6";

export default function RequestStatusPage() {
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

      <section className="px-6 py-20 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <span className="text-xl" style={{ color: V }}>RP</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>
          Request tracking is retired
        </h1>
        <p className="text-sm mb-8" style={{ color: "#777" }}>
          WaevPilots is currently focused on CAAP RPAS study, checklists, and smart logbook workflows.
          This legacy status link is no longer active.
        </p>
        <Link href="/pilots"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
          style={{ background: V, color: "#fff", fontFamily: "'League Spartan', sans-serif" }}>
          Back to WaevPilots
        </Link>
      </section>
    </div>
  );
}
