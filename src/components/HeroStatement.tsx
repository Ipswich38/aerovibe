"use client";

import { motion } from "framer-motion";

export default function HeroStatement() {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Original hero video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/36769747/15582644_1280_720_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(2.8rem,7vw,5rem)] leading-[1.05] mb-6"
          style={{
            fontFamily: "'League Spartan', sans-serif",
            fontWeight: 800,
            textWrap: "balance",
          }}
        >
          Come see your world{" "}
          <span className="text-cyan-400">from the clouds.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(0.95rem,1.8vw,1.15rem)] text-white/60 leading-relaxed max-w-xl mx-auto"
        >
          Cinematic aerial visuals for properties, events, and content projects
          across the Philippines.
        </motion.p>
      </div>
    </section>
  );
}
