"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const projects = [
  {
    title: "Beach Aerial Tour",
    category: "Travel",
    description: "Sweeping coastline shots — waves, sand, and crystal-clear water from above.",
    specs: "4K · 60s",
    video: "https://videos.pexels.com/video-files/32950329/14043404_1280_720_60fps.mp4",
  },
  {
    title: "Outdoor Wedding",
    category: "Events",
    description: "Ceremony captured from above — wide establishing shots and detail passes.",
    specs: "4K · 60s",
    video: "https://videos.pexels.com/video-files/32150713/13707661_1280_720_24fps.mp4",
  },
  {
    title: "Solar Panel Inspection",
    category: "Commercial",
    description: "Rooftop solar array documented — panel condition, layout, and coverage.",
    specs: "1080p · Custom",
    video: "https://videos.pexels.com/video-files/9790192/9790192-hd_1280_720_30fps.mp4",
  },
  {
    title: "Park Aerial View",
    category: "Lifestyle",
    description: "Colorful playground and park area — perfect for community or real estate promo.",
    specs: "4K · 30s",
    video: "https://videos.pexels.com/video-files/31588924/13461208_1280_720_60fps.mp4",
  },
];

export default function Work() {
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

        {/* Featured — wide */}
        <ScrollReveal className="mb-4">
          <motion.div
            whileHover={{ scale: 1.003 }}
            transition={{ duration: 0.3 }}
            className="group relative aspect-[21/9] overflow-hidden rounded-xl inner-glow cursor-pointer"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={projects[0].video} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <span className="pill w-fit text-av-muted border-av-border-light mb-3">
                {projects[0].category}
              </span>
              <h3
                className="text-xl md:text-2xl mb-1"
                style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                {projects[0].title}
              </h3>
              <p className="text-sm text-av-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-md">
                {projects[0].description}
              </p>
              <span className="text-[11px] text-av-muted/60 mt-2 uppercase tracking-wider">
                {projects[0].specs}
              </span>
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.slice(1).map((p, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl inner-glow cursor-pointer"
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={p.video} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <span className="pill w-fit text-av-muted border-av-border-light">
                    {p.category}
                  </span>
                  <div>
                    <h3
                      className="text-lg mb-1"
                      style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                    >
                      {p.title}
                    </h3>
                    <span className="text-[11px] text-av-muted/60 uppercase tracking-wider">
                      {p.specs}
                    </span>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
