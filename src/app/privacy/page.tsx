import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How waevpoint2740 collects, uses, and protects your personal information.",
  alternates: { canonical: "https://waevpoint.quest/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white/90 px-6 py-20">
      <article className="max-w-3xl mx-auto prose-custom">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm">← Back to home</Link>
        <h1 className="text-4xl mt-6 mb-2 font-semibold">Privacy Policy</h1>
        <p className="text-white/50 text-sm mb-10">Last updated: April 16, 2026</p>

        <section className="space-y-6 text-white/80 leading-relaxed text-[15px]">
          <p>
            This Privacy Policy explains how waevpoint2740 (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects,
            uses, and safeguards information you provide through{" "}
            <a href="https://waevpoint.quest" className="text-cyan-400">waevpoint.quest</a>.
          </p>

          <h2 className="text-xl text-white mt-10">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Contact information</strong> you submit via our contact form (name, email or phone, project details).</li>
            <li><strong>Technical data</strong> such as IP address, browser type, and pages visited, collected automatically via standard web logs and analytics.</li>
            <li><strong>Project footage and photographs</strong> we capture during engagements you book with us.</li>
          </ul>

          <h2 className="text-xl text-white mt-10">2. How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Respond to inquiries and provide quotes.</li>
            <li>Deliver drone videography and photography services you request.</li>
            <li>Improve our website, content, and services.</li>
            <li>Comply with legal obligations under Philippine law, including the Data Privacy Act of 2012 (RA 10173).</li>
          </ul>

          <h2 className="text-xl text-white mt-10">3. Sharing</h2>
          <p>
            We do not sell your personal data. We share information only with trusted service
            providers (hosting, analytics, email) strictly to operate the site, or when required
            by law or a valid legal process.
          </p>

          <h2 className="text-xl text-white mt-10">4. Cookies & Analytics</h2>
          <p>
            We may use cookies and privacy-respecting analytics to understand site usage. You may
            disable cookies in your browser settings.
          </p>

          <h2 className="text-xl text-white mt-10">5. Your Rights (RA 10173)</h2>
          <p>
            You have the right to access, correct, object to processing, or request deletion of
            your personal data. Contact us at{" "}
            <a href="mailto:hello@waevpoint.quest" className="text-cyan-400">hello@waevpoint.quest</a>.
          </p>

          <h2 className="text-xl text-white mt-10">6. Data Retention & Security</h2>
          <p>
            We retain personal data only as long as necessary to fulfill the purposes outlined
            here. We apply reasonable technical and organizational measures to protect your
            information, though no online transmission is completely secure.
          </p>

          <h2 className="text-xl text-white mt-10">7. Children</h2>
          <p>
            Our services are not directed to children under 13. We do not knowingly collect
            personal information from minors.
          </p>

          <h2 className="text-xl text-white mt-10">8. Changes</h2>
          <p>
            We may update this policy from time to time. Material changes will be reflected by
            updating the &ldquo;Last updated&rdquo; date above.
          </p>

          <h2 className="text-xl text-white mt-10">9. Contact</h2>
          <p>
            waevpoint2740<br />
            Altaraza Spine Rd, City of San Jose del Monte, Bulacan 3073, Philippines<br />
            <a href="mailto:hello@waevpoint.quest" className="text-cyan-400">hello@waevpoint.quest</a>
          </p>
        </section>
      </article>
    </main>
  );
}
