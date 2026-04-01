"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const slides = [
  {
    tagline: "Aerial storytelling at its finest",
    gradient: "from-[#1a0a05] via-[#2a1508] to-[#0d1520]",
    glow: "bg-amber-600/10",
  },
  {
    tagline: "Real estate that sells itself",
    gradient: "from-[#15080a] via-[#1a1008] to-[#0a0d15]",
    glow: "bg-rose-600/8",
  },
  {
    tagline: "Every island deserves a flyover",
    gradient: "from-[#051a10] via-[#0a1a18] to-[#050d1a]",
    glow: "bg-emerald-500/10",
  },
  {
    tagline: "City lights from above",
    gradient: "from-[#0a0510] via-[#0d0a1a] to-[#05101a]",
    glow: "bg-indigo-500/10",
  },
];

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export default function Hero() {
  return (
    <section className="relative h-[100vh] min-h-[700px] max-h-[900px] overflow-hidden">
      {/* Background carousel — DJI-style full-bleed with fade */}
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        speed={1200}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: "aerovibe-bullet",
          bulletActiveClass: "aerovibe-bullet-active",
        }}
        loop
        className="absolute inset-0 h-full w-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-full w-full">
              {/* Cinematic gradient background — swap with real drone photos */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
              <div className="absolute inset-0 grid-pattern opacity-30" />
              {/* Ambient glow */}
              <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] ${s.glow} rounded-full blur-[150px]`} />
              {/* Film grain */}
              <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-end pb-20 md:pb-28">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 w-full">
          {/* Eyebrow */}
          <motion.div
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3 mb-6"
          >
            <div className="accent-bar" />
            <span className="label-mono text-av-red">
              Drone Videography + Photo Prints
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="headline text-[clamp(3rem,10vw,7rem)] font-black leading-[0.9] mb-6"
          >
            Drone Shots
            <br />
            That Hit <span className="text-av-red">Different</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-av-light max-w-lg mb-8 leading-relaxed"
          >
            We fly, we edit, you get clean aerial footage —
            videos and photos, delivered straight to your device.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <a
              href="#contact"
              className="hover-lift inline-flex items-center justify-center px-8 py-4 bg-av-red text-av-white font-bold text-sm tracking-[3px] uppercase rounded-sm"
              style={{ fontFamily: "var(--font-cond)" }}
            >
              Book a Shoot
            </a>
            <a
              href="#work"
              className="hover-lift inline-flex items-center justify-center px-8 py-4 border border-av-border text-av-text text-sm tracking-[3px] uppercase rounded-sm backdrop-blur-sm bg-av-bg/20 hover:border-av-red hover:text-av-red transition-colors"
              style={{ fontFamily: "var(--font-cond)" }}
            >
              See the Work
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            custom={4}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-8 md:gap-12 border-t border-av-border/50 pt-6"
          >
            {[
              { value: "4K", label: "Resolution" },
              { value: "9:16", label: "Reels Ready" },
              { value: "📲", label: "Email / AirDrop" },
              { value: "<24h", label: "Turnaround" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-2xl md:text-3xl font-bold text-av-red"
                  style={{
                    fontFamily: "var(--font-cond)",
                    letterSpacing: "2px",
                  }}
                >
                  {stat.value}
                </div>
                <div className="label-mono text-av-muted mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-av-muted"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span className="label-mono" style={{ fontSize: "0.5rem" }}>
            Scroll
          </span>
          <svg
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
            className="mx-auto mt-1"
          >
            <path
              d="M6 2v12m0 0l-3-3m3 3l3-3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
