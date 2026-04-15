import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms governing the use of waevpoint2740 services and waevpoint.quest.",
  alternates: { canonical: "https://waevpoint.quest/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white/90 px-6 py-20">
      <article className="max-w-3xl mx-auto">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm">← Back to home</Link>
        <h1 className="text-4xl mt-6 mb-2 font-semibold">Terms &amp; Conditions</h1>
        <p className="text-white/50 text-sm mb-10">Last updated: April 16, 2026</p>

        <section className="space-y-6 text-white/80 leading-relaxed text-[15px]">
          <p>
            These Terms govern your access to waevpoint.quest and any drone videography,
            photography, editing, or delivery services (&ldquo;Services&rdquo;) provided by
            waevpoint2740 (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site or booking a
            Service, you agree to these Terms.
          </p>

          <h2 className="text-xl text-white mt-10">1. Services</h2>
          <p>
            We fly, capture, and deliver edited aerial content. Detailed scope, deliverables,
            schedule, and pricing for each engagement will be provided in a written quote or
            service agreement that, together with these Terms, forms the contract between us.
          </p>

          <h2 className="text-xl text-white mt-10">2. Startup Status</h2>
          <p>
            We are a pre-launch startup scheduled to formally commence operations in June 2028.
            Certain commercial licenses and accreditations are in progress. Services are offered
            subject to applicable Philippine aviation regulations, including CAAP rules for
            Remotely Piloted Aircraft Systems.
          </p>

          <h2 className="text-xl text-white mt-10">3. Booking, Payments &amp; Cancellations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bookings are confirmed once a written quote is accepted and any required deposit is received.</li>
            <li>Final payment is due upon delivery unless agreed otherwise in writing.</li>
            <li>Cancellations made less than 48 hours before a scheduled shoot may forfeit the deposit.</li>
            <li>Weather, airspace restrictions, or unsafe conditions may require rescheduling at no additional cost.</li>
          </ul>

          <h2 className="text-xl text-white mt-10">4. Intellectual Property</h2>
          <p>
            Unless otherwise agreed in writing, we retain ownership of raw footage. Clients
            receive a non-exclusive, perpetual license to use the delivered edited content for
            the agreed purpose. We may showcase delivered work in our portfolio unless you
            request otherwise.
          </p>

          <h2 className="text-xl text-white mt-10">5. Client Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate information about the shoot location and any required permissions.</li>
            <li>Secure property or venue permissions needed for flight operations.</li>
            <li>Disclose any restricted airspace or no-fly zones relevant to the shoot.</li>
          </ul>

          <h2 className="text-xl text-white mt-10">6. Safety &amp; Flight Operations</h2>
          <p>
            We operate within applicable Civil Aviation Authority of the Philippines (CAAP)
            regulations. We reserve the right to refuse, delay, or cancel a flight if conditions
            are unsafe or non-compliant, without penalty to us.
          </p>

          <h2 className="text-xl text-white mt-10">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, our total liability arising from any Service
            shall not exceed the fees paid by the client for that specific engagement. We are not
            liable for indirect, incidental, or consequential damages.
          </p>

          <h2 className="text-xl text-white mt-10">8. Website Use</h2>
          <p>
            The site is provided &ldquo;as is.&rdquo; Do not attempt to disrupt the site, scrape
            at high volume, or use it for unlawful purposes.
          </p>

          <h2 className="text-xl text-white mt-10">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of the Philippines. Any dispute
            shall be brought before the competent courts of Bulacan.
          </p>

          <h2 className="text-xl text-white mt-10">10. Contact</h2>
          <p>
            <a href="mailto:hello@waevpoint.quest" className="text-cyan-400">hello@waevpoint.quest</a>
          </p>
        </section>
      </article>
    </main>
  );
}
