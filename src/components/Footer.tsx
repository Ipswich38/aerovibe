export default function Footer() {
  return (
    <footer className="dark-section border-t border-av-border-light">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="text-sm tracking-wider lowercase"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
            >
              aerovibe
            </span>
            <span className="text-av-border-light">·</span>
            <span className="text-[11px] text-av-muted uppercase tracking-wider">
              Drone content, delivered
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-5">
              {["Services", "Work", "Pricing", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-[11px] text-av-muted uppercase tracking-wider hover:text-av-text transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-av-border-light flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-av-muted/60 uppercase tracking-wider">
            &copy; {new Date().getFullYear()} AeroVibe
          </span>
          <span className="text-[11px] text-av-muted/60 uppercase tracking-wider">
            A{" "}
            <a
              href="https://rootbyte.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-av-red/60 hover:text-av-red transition-colors"
            >
              RootByte
            </a>{" "}
            venture
          </span>
        </div>
      </div>
    </footer>
  );
}
