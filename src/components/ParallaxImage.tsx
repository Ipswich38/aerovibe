"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export default function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.3,
}: Props) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}px`, `${speed * 100}px`]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="h-[120%] w-full relative -top-[10%]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </motion.div>
    </div>
  );
}
