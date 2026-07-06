"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { EASE_LUXE } from "./reveal";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.9 } },
};

const item = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: EASE_LUXE },
  },
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-dvh items-end overflow-hidden"
    >
      {/* Background with gentle parallax — looping video of the four
         signature drinks; static poster when reduced motion is on */}
      <motion.div
        style={reduceMotion ? undefined : { y: imageY }}
        className="absolute inset-0 scale-[1.08]"
      >
        {reduceMotion ? (
          <Image
            src="/images/hero-poster.jpg"
            alt="The four Thé Noir signature drinks on a dark marble counter: milk tea, hot black tea, phin coffee and iced matcha"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/hero-poster.jpg"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        )}
      </motion.div>

      {/* Cinematic overlays — the video is already near-black, so keep
         these light: just enough for text legibility on the left/bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-noir-950/70 via-transparent to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-noir-950/80 to-transparent" />

      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gold-500/8 blur-3xl"
      />

      <motion.div
        style={reduceMotion ? undefined : { opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-40 sm:px-8 sm:pb-28"
      >
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.p
            variants={item}
            className="mb-6 flex items-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400"
          >
            <span aria-hidden className="h-px w-12 bg-gold-500/60" />
            Maison de thé · Saigon · Est. 2016
          </motion.p>

          <motion.h1
            variants={item}
            className="max-w-4xl font-serif text-5xl leading-[1.05] text-cream sm:text-7xl lg:text-8xl"
          >
            The Art of
            <br />
            <em className="italic text-gold-300">Black Tea</em>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-xl text-base leading-relaxed text-cream-muted sm:text-lg"
          >
            Single-origin leaves from Vietnam&rsquo;s misted highlands, steeped
            with the patience of a French tea house. This is tea, taken
            seriously and enjoyed slowly.
          </motion.p>

          <motion.div variants={item} className="mt-11 flex flex-wrap gap-4">
            <a
              href="#collection"
              className="inline-flex items-center bg-gold-500 px-8 py-4 text-[13px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors duration-300 hover:bg-gold-400"
            >
              Explore the Collection
            </a>
            <a
              href="#story"
              className="inline-flex items-center border border-cream/25 px-8 py-4 text-[13px] uppercase tracking-[0.2em] text-cream transition-colors duration-300 hover:border-gold-400 hover:text-gold-300"
            >
              Our Story
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-cream-faint">
          Scroll
        </span>
        <motion.span
          animate={reduceMotion ? undefined : { scaleY: [0, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="block h-12 w-px origin-top bg-gold-500/60"
        />
      </motion.div>
    </section>
  );
}
