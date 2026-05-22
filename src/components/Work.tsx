"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

// ARCHIVED — hidden for now
// {
//   title: "Beach Aerial Tour",
//   category: "Travel",
//   description: "Sweeping coastline shots — waves, sand, and crystal-clear water from above.",
//   specs: "4K · 60s",
//   video: "https://videos.pexels.com/video-files/32950329/14043404_1280_720_60fps.mp4",
// },

const projects = [
  {
    title: "Park Aerial View",
    category: "Residential",
    description: "Park and open spaces inside the subdivision — ideal for community and real estate marketing.",
    specs: "4K",
    video: "/videos/sample1.mp4",
  },
  {
    title: "Real Estate Aerial",
    category: "Real Estate",
    description: "Aerial perspective showcasing the property and surrounding area — ready for listings.",
    specs: "4K",
    video: "/videos/sample2.mp4",
  },
];

type Project = (typeof projects)[0];

function PlayIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="26" fill="rgba(0,0,0,0.55)" />
      <polygon points="21,16 41,26 21,36" fill="white" />
    </svg>
  );
}

function VideoModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <span className="text-white font-semibold text-[15px]">{project.title}</span>
              <span className="text-white/40 text-[12px] ml-3 uppercase tracking-wider">{project.category}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          {/* Video */}
          <video
            ref={videoRef}
            controls
            loop
            playsInline
            className="w-full rounded-xl bg-black"
            style={{ maxHeight: "80vh" }}
          >
            <source src={project.video} type="video/mp4" />
          </video>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function VideoCard({
  project,
  aspectClass,
  featured = false,
  onOpen,
}: {
  project: Project;
  aspectClass: string;
  featured?: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.div
      whileHover={featured ? { scale: 1.003 } : { y: -3 }}
      transition={{ duration: featured ? 0.3 : 0.2 }}
      className={`group relative ${aspectClass} overflow-hidden rounded-xl inner-glow cursor-pointer`}
      onClick={onOpen}
    >
      <video
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="absolute inset-0 w-full h-full object-contain bg-black"
      >
        <source src={project.video} type="video/mp4" />
      </video>

      {/* Pop-out hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <PlayIcon />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {featured ? (
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 pointer-events-none">
          <span className="pill w-fit text-av-muted border-av-border-light mb-3">{project.category}</span>
          <h3 className="text-xl md:text-2xl mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            {project.title}
          </h3>
          <p className="text-sm text-av-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-md">
            {project.description}
          </p>
          <span className="text-[11px] text-av-muted/60 mt-2 uppercase tracking-wider">{project.specs}</span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
          <span className="pill w-fit text-av-muted border-av-border-light">{project.category}</span>
          <div>
            <h3 className="text-lg mb-1" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
              {project.title}
            </h3>
            <span className="text-[11px] text-av-muted/60 uppercase tracking-wider">{project.specs}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Work() {
  const [active, setActive] = useState<Project | null>(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="work" className="dark-section py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-14">
            <span className="label-mono text-av-muted block mb-4">Selected Work</span>
            <h2
              className="text-[clamp(2rem,4vw,2.8rem)] leading-[1.1]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Clean edits, ready to use
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <VideoCard project={p} aspectClass="aspect-video" onOpen={() => setActive(p)} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      {active && <VideoModal project={active} onClose={close} />}
    </section>
  );
}
