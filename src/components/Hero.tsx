"use client";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-av-bg via-av-surface to-av-bg" />
        <div className="absolute inset-0 grid-pattern" />
        {/* Ambient glow — like RootByte category cards */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-av-red/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-av-cyan/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-4 md:px-6 w-full pt-24 pb-16">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8">
          <div className="accent-bar" />
          <span className="label-mono text-av-red">Drone Videography + AI Editing</span>
        </div>

        {/* Main headline — Barlow Condensed, dramatic */}
        <h1
          className="headline text-[clamp(3rem,10vw,7rem)] font-black leading-[0.9] mb-8"
        >
          Drone Shots
          <br />
          That Hit{" "}
          <span className="text-av-red">Different</span>
        </h1>

        {/* Subtext — Libre Baskerville for editorial feel */}
        <p className="text-lg md:text-xl text-av-light max-w-lg mb-10 leading-relaxed">
          We fly. AI scores every frame. You get cinematic footage —
          color-graded, cut to length, ready to post.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a
            href="#contact"
            className="hover-lift inline-flex items-center justify-center px-8 py-4 bg-av-red text-av-white font-bold text-sm tracking-[3px] uppercase rounded-sm"
            style={{ fontFamily: "var(--font-cond)" }}
          >
            Book a Shoot
          </a>
          <a
            href="#work"
            className="hover-lift inline-flex items-center justify-center px-8 py-4 border border-av-border text-av-text text-sm tracking-[3px] uppercase rounded-sm hover:border-av-red hover:text-av-red transition-colors"
            style={{ fontFamily: "var(--font-cond)" }}
          >
            See the Work
          </a>
        </div>

        {/* Stats strip — mono, technical */}
        <div className="flex flex-wrap gap-8 md:gap-12 border-t border-av-border pt-8">
          {[
            { value: "4K", label: "Resolution" },
            { value: "AI", label: "Scored" },
            { value: "9:16", label: "Reels Ready" },
            { value: "<24h", label: "Turnaround" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="text-2xl md:text-3xl font-bold text-av-red"
                style={{ fontFamily: "var(--font-cond)", letterSpacing: "2px" }}
              >
                {stat.value}
              </div>
              <div className="label-mono text-av-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-av-muted animate-bounce">
        <span className="label-mono" style={{ fontSize: "0.5rem" }}>
          Scroll
        </span>
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <path d="M6 2v12m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </section>
  );
}
