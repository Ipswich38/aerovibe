"use client";

import ScrollReveal from "./ScrollReveal";

export default function Contact() {
  return (
    <section id="contact" className="relative py-28 md:py-36 overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/6223513/6223513-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Left — text */}
          <ScrollReveal>
            <div className="md:pt-8">
              <h2
                className="text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.1] text-white mb-5"
                style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}
              >
                Tara, let&apos;s capture the moment!
              </h2>
              <p className="text-base text-white/60 leading-relaxed mb-10 max-w-md">
                Have a project in mind? Or just curious how drone content could
                work for you? Message us — no pressure, no hard sell.
                We&apos;re happy to give you a free quote.
              </p>

              <div className="space-y-5 mb-10">
                <div className="flex items-center gap-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 shrink-0">
                    <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <address className="not-italic text-sm text-white/80">
                    Altaraza Spine Rd, City of San Jose del Monte, Bulacan 3073, Philippines
                  </address>
                </div>
                <div className="flex items-center gap-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 shrink-0">
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href="mailto:hello@waevpoint.quest" className="text-sm text-white/80 hover:text-cyan-400 transition-colors">hello@waevpoint.quest</a>
                </div>
                <div className="flex items-center gap-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 shrink-0">
                    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-white/50">Usually reply within a few hours</span>
                </div>
              </div>            </div>
          </ScrollReveal>

          {/* Right — form card */}
          <ScrollReveal delay={0.15}>
            <div className="bg-white/[0.07] backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-10 shadow-[0_8px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
              <h3
                className="text-lg text-white mb-6"
                style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}
              >
                Send us a message
              </h3>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Message sent! We'll get back to you shortly.");
                }}
              >
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-sm outline-none transition-all placeholder:text-white/20 focus:border-cyan-400/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-sm outline-none transition-all placeholder:text-white/20 focus:border-cyan-400/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    placeholder="your@email.com or 09XX-XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
                    What do you need?
                  </label>
                  <select
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-sm outline-none transition-all focus:border-cyan-400/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  >
                    <option value="" className="bg-neutral-900">Select type...</option>
                    <option value="social" className="bg-neutral-900">Social Media Content</option>
                    <option value="real-estate" className="bg-neutral-900">Real Estate / Property</option>
                    <option value="event" className="bg-neutral-900">Wedding / Event</option>
                    <option value="construction" className="bg-neutral-900">Construction Progress</option>
                    <option value="travel" className="bg-neutral-900">Travel / Tourism</option>
                    <option value="commercial" className="bg-neutral-900">Commercial / Business</option>
                    <option value="just-asking" className="bg-neutral-900">Just curious about pricing</option>
                    <option value="other" className="bg-neutral-900">Something else</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-sm outline-none transition-all resize-none placeholder:text-white/20 focus:border-cyan-400/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <button type="submit" className="btn-cyan w-full justify-center mt-2">
                  Send Message
                  <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
