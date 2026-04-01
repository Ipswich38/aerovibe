"use client";

import { useEffect, useRef } from "react";

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    const elements = sectionRef.current?.querySelectorAll(".fade-up") ?? [];
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 md:py-28 max-w-[1180px] mx-auto px-4 md:px-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        <div className="fade-up">
          <div className="accent-bar mb-4" />
          <h2 className="headline text-3xl md:text-5xl font-bold mb-6">
            Let&apos;s <span className="text-av-red">Shoot</span>
          </h2>
          <p className="text-av-muted leading-relaxed mb-8 max-w-md text-sm">
            Got a property to sell? Event coming up? Brand that needs aerial
            content? Drop us a message — we&apos;ll handle the rest.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-av-red">📍</span>
              <span className="text-sm text-av-light">Philippines</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-av-red">📧</span>
              <span className="text-sm text-av-light">
                hello@aerovibe.rootbyte.tech
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-av-red">⚡</span>
              <span className="text-sm text-av-light">
                Usually reply within 24 hours
              </span>
            </div>
          </div>

          {/* Tech stack badge — shows the AI angle */}
          <div className="mt-10 p-4 rounded-lg border border-av-border bg-av-surface/50">
            <span className="label-mono text-av-red block mb-2">
              Powered By
            </span>
            <div className="flex flex-wrap gap-2">
              {["DJI Neo 2", "Gemini Vision AI", "FFmpeg", "Cinematic LUTs"].map(
                (t) => (
                  <span key={t} className="pill text-av-muted">
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <form
          className="fade-up space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Message sent! We'll get back to you within 24 hours.");
          }}
        >
          <div>
            <label className="label-mono text-av-muted block mb-2">Name</label>
            <input
              type="text"
              required
              className="w-full bg-transparent border-b border-av-border focus:border-av-red py-3 text-av-text outline-none transition-colors placeholder:text-av-muted/40"
              style={{ fontFamily: "var(--font-serif)" }}
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
              className="w-full bg-transparent border-b border-av-border focus:border-av-red py-3 text-av-text outline-none transition-colors placeholder:text-av-muted/40"
              style={{ fontFamily: "var(--font-serif)" }}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="label-mono text-av-muted block mb-2">
              Project Type
            </label>
            <select
              required
              className="w-full bg-transparent border-b border-av-border focus:border-av-red py-3 text-av-text outline-none transition-colors"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
            >
              <option value="" className="bg-av-bg">
                Select type...
              </option>
              <option value="real-estate" className="bg-av-bg">
                🏠 Real Estate
              </option>
              <option value="event" className="bg-av-bg">
                💒 Wedding / Event
              </option>
              <option value="commercial" className="bg-av-bg">
                🏢 Commercial
              </option>
              <option value="travel" className="bg-av-bg">
                🌴 Travel / Lifestyle
              </option>
              <option value="social" className="bg-av-bg">
                📱 Social Media Content
              </option>
              <option value="other" className="bg-av-bg">
                ✨ Other
              </option>
            </select>
          </div>
          <div>
            <label className="label-mono text-av-muted block mb-2">
              Message
            </label>
            <textarea
              rows={4}
              required
              className="w-full bg-transparent border-b border-av-border focus:border-av-red py-3 text-av-text outline-none transition-colors resize-none placeholder:text-av-muted/40"
              style={{ fontFamily: "var(--font-serif)" }}
              placeholder="Tell us about your project..."
            />
          </div>
          <button
            type="submit"
            className="hover-lift w-full py-4 bg-av-red text-av-white font-bold text-sm tracking-[3px] uppercase rounded-sm mt-2"
            style={{ fontFamily: "var(--font-cond)" }}
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
