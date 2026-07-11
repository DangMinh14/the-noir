"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Reveal } from "./reveal";

const STATS = [
  { value: "03", label: "Tea and coffee plots, one valley" },
  { value: "1,200 m", label: "Altitude of our gardens" },
  { value: "18", label: "Maisons across Vietnam" },
];

export function Story() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  // Moves the opposite direction and a bit further, so the inset photo
  // reads as its own layer instead of drifting in lockstep with the first.
  const image2Y = useTransform(scrollYProgress, [0, 1], ["5%", "-9%"]);

  return (
    <section
      ref={ref}
      id="story"
      className="relative overflow-hidden bg-noir-900 py-28 sm:py-36"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-gold-500/6 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24">
        {/* Two framed, independently-parallaxed photos: the tea terraces as
           the anchor image, the coffee grove as a smaller inset tucked over
           its bottom corner, like two prints from the same field visit. */}
        <Reveal>
          <div className="relative">
            <div
              aria-hidden
              className="absolute -left-4 -top-4 hidden h-full w-full border border-gold-500/30 sm:block"
            />
            <div className="relative aspect-[4/5] overflow-hidden bg-noir-800">
              <motion.div
                style={reduceMotion ? undefined : { y: imageY }}
                className="absolute inset-0 scale-[1.15]"
              >
                <Image
                  src="/images/story-tea-garden.jpg"
                  alt="Terraced tea rows curving down a fog-covered hillside in the Lâm Đồng highlands, a wooden Thé Noir trail marker in the foreground"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>

          <div className="relative -mt-16 ml-auto w-[44%] sm:-mt-20">
            <div className="relative aspect-[4/5] overflow-hidden border-4 border-noir-900 bg-noir-800 shadow-2xl shadow-black/50 ring-1 ring-gold-500/15">
              <motion.div
                style={reduceMotion ? undefined : { y: image2Y }}
                className="absolute inset-0 scale-[1.15]"
              >
                <Image
                  src="/images/story-coffee-garden.jpg"
                  alt="Ripe coffee cherries on the branch beside a Thé Noir trail marker, rows of coffee trees on the neighbouring slope"
                  fill
                  sizes="(max-width: 1024px) 44vw, 22vw"
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="mb-4 flex items-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400">
              <span aria-hidden className="h-px w-12 bg-gold-500/60" />
              Our Story
            </p>
            <h2 className="font-serif text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">
              Born in the highlands,
              <br />
              <em className="italic text-gold-300">raised on ritual</em>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 leading-relaxed text-cream-muted">
              Thé Noir began with two plots on neighbouring slopes in the Lâm
              Đồng highlands: tea terraces cut into one hillside, coffee trees
              planted on the next, ten minutes apart on foot. Same fog, same
              red soil, same hour of picking before the sun burns it off.
            </p>
            <p className="mt-5 leading-relaxed text-cream-muted">
              We learned to wither, roll and oxidise the tea leaf the slow
              way, and to pick the coffee cherries by hand, one row at a time.
              A decade later, the promise is unchanged: every cup, tea or phin
              coffee, starts with a plant we can trace back to its row on the
              hill.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-gold-500/15 pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-serif text-3xl text-gold-300 sm:text-4xl">
                    {stat.value}
                  </dd>
                  <dd className="mt-2 text-xs uppercase tracking-[0.14em] text-cream-faint">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
