"use client";

import ScrollReveal from "./ScrollReveal";

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-av-bg">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <ScrollReveal>
            <div>
              <span className="label-mono text-av-muted block mb-4">Contact</span>
              <h2
                className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1] text-av-dark mb-4"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Let&apos;s shoot
              </h2>
              <p className="text-sm text-av-muted leading-relaxed mb-10 max-w-md">
                Got a property to sell? Event coming up? Brand that needs aerial
                content? Drop us a message — we&apos;ll handle the rest.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <span className="text-sm">📍</span>
                  <span className="text-sm text-av-dark">Philippines</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">📧</span>
                  <span className="text-sm text-av-dark">
                    hello@aerovibe.rootbyte.tech
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">⚡</span>
                  <span className="text-sm text-av-muted">
                    Usually reply within 24 hours
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-av-border bg-gray-50/50">
                <span className="label-mono text-av-muted block mb-3">
                  Equipment
                </span>
                <div className="flex flex-wrap gap-2">
                  {["DJI Drones", "Photo Printer"].map((t) => (
                    <span key={t} className="pill text-av-muted bg-white">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message sent! We'll get back to you within 24 hours.");
              }}
            >
              <div>
                <label className="label-mono text-av-muted block mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-transparent border-b border-av-border focus:border-av-red py-3 text-av-dark outline-none transition-colors placeholder:text-av-muted/40 text-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="label-mono text-av-muted block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-transparent border-b border-av-border focus:border-av-red py-3 text-av-dark outline-none transition-colors placeholder:text-av-muted/40 text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="label-mono text-av-muted block mb-2">
                  Project Type
                </label>
                <select
                  required
                  className="w-full bg-transparent border-b border-av-border focus:border-av-red py-3 text-av-dark outline-none transition-colors text-sm"
                >
                  <option value="">Select type...</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="event">Wedding / Event</option>
                  <option value="commercial">Commercial</option>
                  <option value="travel">Travel / Lifestyle</option>
                  <option value="social">Social Media Content</option>
                  <option value="inspection">Site Ocular / Inspection</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label-mono text-av-muted block mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  className="w-full bg-transparent border-b border-av-border focus:border-av-red py-3 text-av-dark outline-none transition-colors resize-none placeholder:text-av-muted/40 text-sm"
                  placeholder="Tell us about your project..."
                />
              </div>
              <button type="submit" className="btn-red w-full justify-center mt-2">
                Send Message
                <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
