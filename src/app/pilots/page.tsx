import Link from "next/link";
import { FREE_PILOT_FEATURES, PILOT_PLANS } from "@/lib/addons";

const V = "#8b5cf6";
const Vd = "rgba(139,92,246,0.15)";

const AUDIENCE_CARDS = [
  {
    title: "Aspiring pilots",
    label: "Below 7kg path",
    color: V,
    bg: Vd,
    border: `${V}33`,
    points: [
      "Study PCAR Parts 1, 2, 4, and 11 in small review blocks",
      "Prepare for the written and practical flow",
      "Build muscle memory with pre-flight and post-flight checklists",
      "Track study progress, aircraft notes, and training remarks",
    ],
  },
  {
    title: "Licensed pilots",
    label: "Policy refresher",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.07)",
    border: "rgba(6,182,212,0.24)",
    points: [
      "Revisit operating limits before each flight",
      "Keep smart logs for location, time, aircraft, and remarks",
      "Review safety prompts so important steps are not skipped",
      "Separate recurrent review from one-time exam preparation",
    ],
  },
  {
    title: "7kg and above",
    label: "Marked separately",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.24)",
    points: [
      "Clearly flag Large RPA topics instead of mixing them into below-7kg prep",
      "Track registration and certificate requirements separately",
      "Show source notes where CAAP distinguishes Small RPA and Large RPA",
      "Keep heavy-aircraft material as a dedicated expansion area",
    ],
  },
];

const CAAP_NOTES = [
  {
    title: "Small RPA",
    body: "PCAR Part 1 defines Small RPA as below 7kg gross weight. This is the current default scope of WaevPilots content.",
  },
  {
    title: "Large RPA",
    body: "PCAR Part 1 defines Large RPA as 7kg and above. WaevPilots will label this path separately because the site owner has not trained on it yet.",
  },
  {
    title: "Certificate trigger",
    body: "CAAP states that an RPA Controller Certificate is required for commercial operation or for drones weighing 7kg and above.",
  },
  {
    title: "Registration trigger",
    body: "CAAP states that commercial RPAs must be registered regardless of weight, and non-commercial Large RPAs 7kg and above must also be registered.",
  },
];

export default function PilotsPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.6 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>x</span>
          <span className="text-[15px] font-bold" style={{ fontFamily: "'League Spartan', sans-serif", color: V }}>
            WaevPilots
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pilots/guide"
            className="hidden sm:inline-flex px-4 py-1.5 rounded-lg text-[12px] transition-all hover:border-white/20"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#aaa" }}>
            Guide
          </Link>
          <Link href="/pilots/auth"
            className="px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:opacity-90"
            style={{ background: V, color: "#fff" }}>
            Sign In
          </Link>
        </div>
      </header>

      <main>
        <section className="relative min-h-[78vh] overflow-hidden px-6">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/waevpilots-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            style={{ objectPosition: "center 72%" }}
          />
          <div className="absolute inset-0 bg-black/55" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.42) 48%, #0a0a0a 100%)",
            }}
          />

          <div className="relative z-10 flex min-h-[78vh] items-center justify-end">
            <div className="max-w-3xl pt-12 pb-20 lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] mb-6"
                style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.16)", color: "#ddd", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.14em" }}>
                BELOW 7KG PILOT REVIEW
              </div>
              <h1 className="max-w-3xl text-[clamp(3rem,8vw,6.6rem)] leading-[0.94] mb-5"
                style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 900 }}>
                Fly prepared.
                <span className="block" style={{ color: "#c4b5fd" }}>Stay current.</span>
              </h1>
              <p className="text-[clamp(1rem,2vw,1.2rem)] leading-relaxed max-w-2xl mb-9 lg:ml-auto" style={{ color: "rgba(255,255,255,0.78)" }}>
                CAAP RPAS study, pilot checklists, exam prep, and smart flight logs for aspiring and licensed drone pilots.
              </p>

              <div className="flex flex-col sm:flex-row items-start lg:items-center lg:justify-end gap-3">
            <Link href="/pilots/auth"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: V, fontFamily: "'League Spartan', sans-serif", fontSize: "1rem" }}>
              Start Free
            </Link>
            <Link href="/pilots/guide"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:border-white/30"
              style={{ background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontFamily: "'League Spartan', sans-serif", fontSize: "1rem", backdropFilter: "blur(10px)" }}>
              Read Pilot Guide
            </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-16 max-w-6xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] mb-8 text-center"
            style={{ color: "#555", fontFamily: "'IBM Plex Mono', monospace" }}>
            Same tools, different context
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AUDIENCE_CARDS.map(card => (
              <div key={card.title} className="rounded-2xl p-6"
                style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                <p className="text-[10px] uppercase tracking-[0.16em] mb-3"
                  style={{ color: card.color, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {card.label}
                </p>
                <h2 className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  {card.title}
                </h2>
                <ul className="space-y-2.5">
                  {card.points.map(point => (
                    <li key={point} className="flex gap-2 text-[12px] leading-snug" style={{ color: "#999" }}>
                      <span style={{ color: card.color }}>-</span>{point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 pb-16 max-w-5xl mx-auto">
          <div className="rounded-2xl p-6 md:p-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] mb-2"
                  style={{ color: V, fontFamily: "'IBM Plex Mono', monospace" }}>
                  Weight class awareness
                </p>
                <h2 className="text-3xl font-bold text-white"
                  style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  Below 7kg is the primary track
                </h2>
              </div>
              <Link href="/pilots/guide#weight-class"
                className="inline-flex px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:border-white/20"
                style={{ color: "#c4b5fd", border: `1px solid ${V}35`, background: Vd }}>
                View weight notes
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAAP_NOTES.map(note => (
                <div key={note.title} className="rounded-xl p-4"
                  style={{ background: "rgba(10,10,10,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[13px] font-semibold text-white mb-1">{note.title}</p>
                  <p className="text-[12px] leading-relaxed" style={{ color: "#888" }}>{note.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 pb-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[11px] uppercase tracking-[0.2em] mb-3"
              style={{ color: V, fontFamily: "'IBM Plex Mono', monospace" }}>
              Free first, upgrade for structure
            </p>
            <h2 className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Pilot study plans
            </h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: "#777" }}>
              Free access gives you the basics. Paid tiers add better review structure, smart logbook workflows, and deeper practical preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-[11px] uppercase tracking-[0.16em] mb-2" style={{ color: "#777", fontFamily: "'IBM Plex Mono', monospace" }}>Free</p>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>Community</h3>
              <p className="text-[30px] font-bold mt-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>₱0</p>
              <p className="text-[12px] mb-5" style={{ color: "#666" }}>/month</p>
              <ul className="space-y-2.5">
                {FREE_PILOT_FEATURES.map(feature => (
                  <li key={feature} className="flex gap-2 text-[12px] leading-snug" style={{ color: "#aaa" }}>
                    <span style={{ color: "#34d399" }}>-</span>{feature}
                  </li>
                ))}
              </ul>
            </div>

            {PILOT_PLANS.map(plan => (
              <div key={plan.id} className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: plan.id === "pro" ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.035)",
                  border: plan.id === "pro" ? `1px solid ${V}55` : "1px solid rgba(255,255,255,0.08)",
                }}>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] mb-2" style={{ color: plan.id === "pro" ? V : "#777", fontFamily: "'IBM Plex Mono', monospace" }}>{plan.audience}</p>
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>{plan.label}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px]" style={{ background: plan.id === "pro" ? Vd : "rgba(255,255,255,0.06)", color: plan.id === "pro" ? "#c4b5fd" : "#888" }}>
                    {plan.badge}
                  </span>
                </div>
                <p className="text-[30px] font-bold" style={{ fontFamily: "'League Spartan', sans-serif", color: plan.id === "pro" ? V : "#fff" }}>₱{plan.price}</p>
                <p className="text-[12px] mb-4" style={{ color: "#666" }}>/month</p>
                <p className="text-[12px] leading-relaxed mb-5 min-h-10" style={{ color: "#777" }}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex gap-2 text-[12px] leading-snug" style={{ color: "#aaa" }}>
                      <span style={{ color: plan.id === "pro" ? V : "#34d399" }}>-</span>{feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pilots/auth"
                  className="block w-full text-center rounded-xl py-3 text-[13px] font-semibold transition-all hover:opacity-90"
                  style={{ background: plan.id === "pro" ? V : "rgba(255,255,255,0.06)", border: plan.id === "pro" ? "none" : "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: "'League Spartan', sans-serif" }}>
                  Choose {plan.label}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 text-center border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-3">
          <Link href="/pilots/guide" className="text-xs hover:text-white transition-colors" style={{ color: "#555" }}>Guide</Link>
          <Link href="/pilots/legal" className="text-xs hover:text-white transition-colors" style={{ color: "#555" }}>Legal</Link>
          <Link href="/pilots/legal/terms" className="text-xs hover:text-white transition-colors" style={{ color: "#555" }}>Terms</Link>
          <Link href="/pilots/legal/privacy" className="text-xs hover:text-white transition-colors" style={{ color: "#555" }}>Privacy</Link>
        </div>
        <p className="text-xs" style={{ color: "#333" }}>
          WaevPilots is a learning and logging aid. Always confirm current requirements with CAAP or the relevant aviation authority.
        </p>
      </footer>
    </div>
  );
}
