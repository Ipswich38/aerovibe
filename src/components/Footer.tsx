export default function Footer() {
  return (
    <footer className="border-t border-aerovibe-gray/20 py-8 bg-aerovibe-black">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm tracking-wider uppercase text-aerovibe-muted">
            Aero<span className="text-aerovibe-accent">Vibe</span>
          </span>
          <span className="text-aerovibe-gray">|</span>
          <span className="text-xs text-aerovibe-muted">
            Cinematic Drone Visuals
          </span>
        </div>
        <div className="text-xs text-aerovibe-muted">
          &copy; {new Date().getFullYear()} AeroVibe. A{" "}
          <a
            href="https://rootbyte.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-aerovibe-accent hover:text-aerovibe-accent-light transition-colors"
          >
            RootByte
          </a>{" "}
          venture.
        </div>
      </div>
    </footer>
  );
}
