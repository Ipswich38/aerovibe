import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal & Disclosures",
  description:
    "Legal notices, company information, and regulatory disclosures for waevpoint2740.",
  alternates: { canonical: "https://waevpoint.quest/legal" },
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white/90 px-6 py-20">
      <article className="max-w-3xl mx-auto">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm">← Back to home</Link>
        <h1 className="text-4xl mt-6 mb-2 font-semibold">Legal &amp; Disclosures</h1>
        <p className="text-white/50 text-sm mb-10">Last updated: April 16, 2026</p>

        <section className="space-y-6 text-white/80 leading-relaxed text-[15px]">
          <h2 className="text-xl text-white">Company Information</h2>
          <p>
            waevpoint2740 is a pre-launch aerial content brand preparing for formal operations
            in June 2028.<br />
            <strong>Address:</strong> Altaraza Spine Rd, City of San Jose del Monte, Bulacan 3073, Philippines<br />
            <strong>Email:</strong> <a href="mailto:hello@waevpoint.quest" className="text-cyan-400">hello@waevpoint.quest</a>
          </p>

          <h2 className="text-xl text-white mt-10">Regulatory Status</h2>
          <p>
            We are in the process of obtaining applicable certifications, including registration
            and permits under the Civil Aviation Authority of the Philippines (CAAP) for Remotely
            Piloted Aircraft Systems, and business registration with the Department of Trade and
            Industry (DTI) / Securities and Exchange Commission (SEC) as applicable. No service
            requiring a license will be performed prior to securing it.
          </p>

          <h2 className="text-xl text-white mt-10">Intellectual Property</h2>
          <p>
            All trademarks, logos, and content on waevpoint.quest are the property of
            waevpoint2740 or used with permission. No content may be reproduced without written
            consent.
          </p>

          <h2 className="text-xl text-white mt-10">Copyright &amp; Takedown</h2>
          <p>
            If you believe content on this site infringes your intellectual property, please
            contact <a href="mailto:hello@waevpoint.quest" className="text-cyan-400">hello@waevpoint.quest</a>{" "}
            with a detailed description, links to the original work, and proof of ownership.
          </p>

          <h2 className="text-xl text-white mt-10">Drone Operations Disclaimer</h2>
          <p>
            All drone flights are conducted within applicable Philippine regulations. Flight
            dates and locations are subject to weather, airspace restrictions, and safety
            assessments. We will not fly in restricted airspace or without required permissions.
          </p>

          <h2 className="text-xl text-white mt-10">Related Documents</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><Link href="/privacy" className="text-cyan-400">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-cyan-400">Terms &amp; Conditions</Link></li>
          </ul>
        </section>
      </article>
    </main>
  );
}
