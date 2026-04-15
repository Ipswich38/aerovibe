export default function Footer() {
  return (
    <footer className="dark-section border-t border-av-border-light">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="waevpoint2740"
              className="h-16 w-auto"
            />
            <span className="text-av-border-light">&middot;</span>
            <span className="text-[11px] text-av-muted uppercase tracking-wider">
              Drone content, delivered
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-5">
              {["Why Us", "Services", "Work", "Pricing", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "")}`}
                  className="text-[11px] text-av-muted uppercase tracking-wider hover:text-av-text transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <address className="not-italic mt-6 text-[11px] text-av-muted/80 text-center md:text-left">
          Altaraza Spine Rd, City of San Jose del Monte, Bulacan 3073, Philippines · <a href="mailto:hello@waevpoint.quest" className="hover:text-cyan-400 transition-colors">hello@waevpoint.quest</a>
        </address>

        <nav className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-[11px] uppercase tracking-wider">
          <a href="/privacy" className="text-av-muted hover:text-av-text transition-colors">Privacy</a>
          <a href="/terms" className="text-av-muted hover:text-av-text transition-colors">Terms</a>
          <a href="/legal" className="text-av-muted hover:text-av-text transition-colors">Legal</a>
        </nav>

        <div className="mt-4 pt-6 border-t border-av-border-light flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-av-muted/60 uppercase tracking-wider">
            &copy; {new Date().getFullYear()} waevpoint2740
          </span>
          <span className="text-[11px] text-av-muted/60 uppercase tracking-wider">
            A{" "}
            <a
              href="https://rootbyte.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400/60 hover:text-cyan-400 transition-colors"
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
