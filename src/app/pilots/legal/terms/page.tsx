import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — WaevPilots",
  description: "Terms for using WaevPilots as an RPAS study, checklist, and flight-logbook aid.",
};

const V = "#8b5cf6";
const EFFECTIVE = "May 22, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>{title}</h2>
      <div className="space-y-3 text-[14px] leading-relaxed" style={{ color: "#888" }}>{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-30"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,10,10,0.95)", backdropFilter: "blur(10px)" }}>
        <div className="flex items-center gap-3">
          <Link href="/pilots"><img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.6 }} /></Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>x</span>
          <span className="font-bold text-[15px]" style={{ color: V, fontFamily: "'League Spartan', sans-serif" }}>WaevPilots</span>
        </div>
        <Link href="/pilots/legal" className="text-[11px] hover:text-white transition-colors" style={{ color: "#555" }}>Legal</Link>
      </header>

      <main className="px-6 py-10 max-w-3xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "#555", fontFamily: "'IBM Plex Mono', monospace" }}>WaevPilots Legal</p>
        <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>Terms & Conditions</h1>
        <p className="text-[13px] mb-8" style={{ color: "#555" }}>Effective date: {EFFECTIVE}</p>

        <Section title="1. Purpose">
          <p>WaevPilots is a study, checklist, and smart logbook aid for aspiring and licensed drone pilots. It is not an aviation authority and does not replace official CAAP requirements.</p>
        </Section>

        <Section title="2. Regulatory Responsibility">
          <p>You are responsible for checking current CAAP requirements or the applicable aviation authority before flying. WaevPilots summarizes and organizes study material, but official regulations, certificates, permits, and advisories control.</p>
        </Section>

        <Section title="3. Weight-Class Scope">
          <p>The current product is written primarily for below-7kg drone review. Topics for 7kg and above may be included as Large RPA notes and should be treated as a separate path until confirmed against current official requirements.</p>
        </Section>

        <Section title="4. Subscriptions">
          <p>Paid plans unlock additional review, checklist, and logbook workflows. Pricing may change with notice. You may pause or cancel according to the payment provider and account tools available at the time.</p>
        </Section>

        <Section title="5. No Warranty">
          <p>WaevPilots is provided as is. We do not guarantee that a user will pass an exam, qualify for a certificate, avoid incidents, or satisfy every regulatory requirement. Use your own judgment and verify official sources.</p>
        </Section>

        <Section title="6. Contact">
          <p>Questions about these terms may be sent to <a href="mailto:waevpoint@gmail.com" style={{ color: V }}>waevpoint@gmail.com</a>.</p>
        </Section>
      </main>
    </div>
  );
}
