"use client";

import { useState, useEffect } from "react";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#why", label: "Why Us" },
    { href: "#work", label: "Work" },
    { href: "#services", label: "Services" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-av-dark/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="waevpoint2740"
            className="h-20 md:h-24 w-auto"
          />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] text-av-light hover:text-av-text transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" className="btn-cyan">
            Get a Quote
            <svg className="btn-arrow" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        </div>

        {/* Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
          aria-label="Menu"
        >
          <div className="flex flex-col gap-[4px]">
            <span className={`w-4 h-[1.5px] bg-av-text transition-all ${menuOpen ? "rotate-45 translate-y-[2.75px]" : ""}`} />
            <span className={`w-4 h-[1.5px] bg-av-text transition-all ${menuOpen ? "-rotate-45 -translate-y-[2.75px]" : ""}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-av-dark/98 backdrop-blur-md border-t border-av-border-light px-6 py-5 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-[13px] text-av-light hover:text-av-text transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setMenuOpen(false)} className="btn-cyan w-fit">
            Get a Quote
          </a>
        </div>
      )}
    </nav>
  );
}
