"use client";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-end pb-24 overflow-hidden">
      {/* Background — placeholder gradient until real drone footage is added */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-aerovibe-charcoal via-aerovibe-black to-aerovibe-dark" />
        {/* Animated subtle particles */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {/* Cinematic grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="gold-line mb-6" />
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] mb-6">
          Cinematic
          <br />
          <span className="font-semibold">Drone Visuals</span>
        </h1>
        <p className="text-lg md:text-xl text-aerovibe-light max-w-xl mb-10 leading-relaxed">
          Premium aerial videography and photography.
          <br />
          AI-graded. Professionally cut. Ready to publish.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-aerovibe-accent text-aerovibe-black font-semibold text-sm tracking-wider uppercase hover:bg-aerovibe-accent-light transition-colors"
          >
            Book a Shoot
          </a>
          <a
            href="#work"
            className="inline-flex items-center justify-center px-8 py-4 border border-aerovibe-gray text-aerovibe-white text-sm tracking-wider uppercase hover:border-aerovibe-accent hover:text-aerovibe-accent transition-colors"
          >
            View Work
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-aerovibe-muted animate-bounce">
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <path
            d="M8 4v16m0 0l-4-4m4 4l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </section>
  );
}
