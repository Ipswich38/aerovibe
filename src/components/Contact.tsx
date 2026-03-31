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
      className="py-24 md:py-32 max-w-7xl mx-auto px-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="fade-up">
          <div className="gold-line mb-4" />
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Let&apos;s <span className="font-semibold">Create</span>
          </h2>
          <p className="text-aerovibe-light leading-relaxed mb-8 max-w-md">
            Tell us about your project. Whether it&apos;s a property listing, event
            coverage, or commercial shoot — we&apos;ll craft the perfect aerial
            story.
          </p>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-aerovibe-light">
              <svg
                className="w-4 h-4 text-aerovibe-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hello@aerovibe.rootbyte.tech
            </div>
            <div className="flex items-center gap-3 text-aerovibe-light">
              <svg
                className="w-4 h-4 text-aerovibe-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Philippines
            </div>
          </div>
        </div>

        <form
          className="fade-up space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Wire to email service or form backend
            alert("Message sent! We'll get back to you within 24 hours.");
          }}
        >
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-aerovibe-muted block mb-2">
              Name
            </label>
            <input
              type="text"
              required
              className="w-full bg-transparent border-b border-aerovibe-gray/50 focus:border-aerovibe-accent py-3 text-aerovibe-white outline-none transition-colors placeholder:text-aerovibe-gray"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-aerovibe-muted block mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-transparent border-b border-aerovibe-gray/50 focus:border-aerovibe-accent py-3 text-aerovibe-white outline-none transition-colors placeholder:text-aerovibe-gray"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-aerovibe-muted block mb-2">
              Project Type
            </label>
            <select
              required
              className="w-full bg-transparent border-b border-aerovibe-gray/50 focus:border-aerovibe-accent py-3 text-aerovibe-white outline-none transition-colors"
            >
              <option value="" className="bg-aerovibe-black">
                Select type...
              </option>
              <option value="real-estate" className="bg-aerovibe-black">
                Real Estate
              </option>
              <option value="event" className="bg-aerovibe-black">
                Wedding / Event
              </option>
              <option value="commercial" className="bg-aerovibe-black">
                Commercial
              </option>
              <option value="travel" className="bg-aerovibe-black">
                Travel / Lifestyle
              </option>
              <option value="other" className="bg-aerovibe-black">
                Other
              </option>
            </select>
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-aerovibe-muted block mb-2">
              Message
            </label>
            <textarea
              rows={4}
              required
              className="w-full bg-transparent border-b border-aerovibe-gray/50 focus:border-aerovibe-accent py-3 text-aerovibe-white outline-none transition-colors resize-none placeholder:text-aerovibe-gray"
              placeholder="Tell us about your project..."
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-aerovibe-accent text-aerovibe-black font-semibold text-sm tracking-wider uppercase hover:bg-aerovibe-accent-light transition-colors mt-4"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
