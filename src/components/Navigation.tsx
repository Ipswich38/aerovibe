"use client";

import { useState, useEffect } from "react";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#work", label: "Work" },
    { href: "#services", label: "Services" },
    { href: "#process", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Book" },
  ];

  return (
    <>
      {/* Red progress bar — RootByte signature */}
      <div
        className="progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav
        className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-av-bg/95 backdrop-blur-md border-b border-av-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span
              className="text-xl font-black tracking-[4px] uppercase text-av-text"
              style={{ fontFamily: "var(--font-cond)" }}
            >
              AERO<span className="text-av-red">VIBE</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="label-mono text-av-muted hover:text-av-red transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              className="pill bg-av-red/10 border-av-red/30 text-av-red hover:bg-av-red hover:text-av-white hover:border-av-red transition-all"
            >
              Get a Quote
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2"
            aria-label="Menu"
          >
            <span
              className={`w-5 h-[1.5px] bg-av-text transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[3.25px]" : ""}`}
            />
            <span
              className={`w-5 h-[1.5px] bg-av-text transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`w-5 h-[1.5px] bg-av-text transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[3.25px]" : ""}`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-av-bg/98 backdrop-blur-md border-t border-av-border px-6 py-6 flex flex-col gap-5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="label-mono text-av-muted hover:text-av-red transition-colors text-sm"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
