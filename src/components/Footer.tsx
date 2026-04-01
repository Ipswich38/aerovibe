export default function Footer() {
  return (
    <footer className="border-t border-av-border py-6 bg-av-bg">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-bold tracking-[3px] uppercase"
            style={{ fontFamily: "var(--font-cond)" }}
          >
            AERO<span className="text-av-red">VIBE</span>
          </span>
          <span className="text-av-border">|</span>
          <span className="label-mono text-av-muted">
            Drone Shots That Hit Different
          </span>
        </div>
        <div className="label-mono text-av-muted">
          &copy; {new Date().getFullYear()} AeroVibe &middot; A{" "}
          <a
            href="https://rootbyte.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-av-red hover:text-av-amber transition-colors"
          >
            RootByte
          </a>{" "}
          venture
        </div>
      </div>
    </footer>
  );
}
