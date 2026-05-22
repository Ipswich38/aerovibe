import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal — WaevPilots",
  robots: { index: true, follow: true },
};

const V = "#8b5cf6";

export default function LegalHub() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/pilots">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.6 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>×</span>
          <span className="font-bold text-[15px]" style={{ color: V, fontFamily: "'League Spartan', sans-serif" }}>WaevPilots</span>
        </div>
        <Link href="/pilots" className="text-[11px] hover:text-white transition-colors" style={{ color: "#555" }}>Back</Link>
      </header>

      <section className="px-6 py-20 max-w-2xl mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: "#555", fontFamily: "'IBM Plex Mono', monospace" }}>Legal</p>
        <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'League Spartan', sans-serif" }}>Legal Documents</h1>
        <p className="text-sm mb-12" style={{ color: "#666" }}>
          By using WaevPilots, you agree to these documents. Last updated: May 2026.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {[
            {
              href: "/pilots/legal/terms",
              title: "Terms & Conditions",
              desc: "Rules for using WaevPilots as a study, checklist, and flight-logbook aid.",
              icon: "✎",
            },
            {
              href: "/pilots/legal/privacy",
              title: "Privacy Policy",
              desc: "What data we collect, how we use it, and your rights under GDPR, PDPA, CCPA, and other frameworks.",
              icon: "⊘",
            },
          ].map(doc => (
            <Link key={doc.href} href={doc.href}
              className="rounded-2xl p-6 transition-all hover:border-white/20 block"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-3" style={{ color: V }}>{doc.icon}</div>
              <h2 className="text-[16px] font-semibold text-white mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>{doc.title}</h2>
              <p className="text-[12px] leading-relaxed" style={{ color: "#777" }}>{doc.desc}</p>
              <p className="text-[11px] mt-4" style={{ color: V }}>Read →</p>
            </Link>
          ))}
        </div>

        <p className="text-[11px] mt-10" style={{ color: "#444" }}>
          Questions about these documents?{" "}
          <a href="mailto:waevpoint@gmail.com" className="hover:text-white transition-colors" style={{ color: "#666" }}>
            waevpoint@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
