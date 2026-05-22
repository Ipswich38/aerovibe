import Link from "next/link";

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

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>Privacy Policy</h1>
        <p className="text-[13px] mb-8" style={{ color: "#555" }}>Effective date: {EFFECTIVE}</p>

        <Section title="1. Data We Collect">
          <p>We may collect account email, name, contact, location, drone models, license or certificate notes if you provide them, study preferences, checklist state, subscription status, and logbook remarks.</p>
        </Section>

        <Section title="2. How We Use Data">
          <p>We use data to operate your account, tailor below-7kg or Large RPA study context, save checklist/logbook records, manage subscriptions, prevent abuse, and improve the product.</p>
        </Section>

        <Section title="3. Data Sharing">
          <p>We do not sell personal data. We use service providers such as Supabase, Vercel, and payment processors to operate the app. We may disclose data if legally required.</p>
        </Section>

        <Section title="4. Location and Logs">
          <p>Smart logbook entries may include location, date, time, aircraft class, checklist results, failed items, and remarks. Do not enter sensitive location details unless you are comfortable storing them in your account.</p>
        </Section>

        <Section title="5. Your Rights">
          <p>You may request access, correction, or deletion of your personal data by contacting <a href="mailto:waevpoint@gmail.com" style={{ color: V }}>waevpoint@gmail.com</a>.</p>
        </Section>
      </main>
    </div>
  );
}
