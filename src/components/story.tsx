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
  { value: "03", label: "Tea estates, one valley" },
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
        {/* Framed parallax image */}
        <Reveal className="relative">
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
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1400&auto=format&fit=crop"
                alt="Roasted beans and dark leaves scattered across a wooden surface"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
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
              Thé Noir began with a single hillside in the Lâm Đồng highlands:
              three hectares of old tea bushes wrapped in morning fog. We
              learned to wither, roll and oxidise the leaf the slow way, then
              borrowed the discipline of the French salon de thé to serve it.
            </p>
            <p className="mt-5 leading-relaxed text-cream-muted">
              A decade later, the promise is unchanged: every cup, from a
              ceremonial oolong to a street-sweet milk tea, starts with a leaf
              we can trace back to its row on the hill.
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
