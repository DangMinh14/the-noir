"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";

const CITIES = [
  { name: "Sài Gòn", count: "09 maisons", note: "Flagship · 42 Vườn Trà" },
  { name: "Hà Nội", count: "05 maisons", note: "Salon · 18 Sương Mai" },
  { name: "Đà Nẵng", count: "03 maisons", note: "Riverside · 27 Bến Lá" },
  { name: "Huế", count: "01 maison", note: "Garden house · 15 Đồi Mây" },
];

export function Maisons() {
  return (
    <section id="maisons" className="bg-noir-900 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="mb-4 flex items-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400">
            <span aria-hidden className="h-px w-12 bg-gold-500/60" />
            Find Us
          </p>
          <h2 className="max-w-2xl font-serif text-4xl leading-tight text-cream sm:text-6xl">
            Eighteen maisons,
            <em className="italic text-gold-300"> four cities</em>
          </h2>
        </Reveal>

        <ul className="mt-14">
          {CITIES.map((city, i) => (
            <Reveal key={city.name} delay={0.06 * i}>
              <li>
                <a
                  href="#maisons"
                  aria-label={`Thé Noir in ${city.name}: ${city.note}`}
                  className="group flex items-center justify-between gap-4 border-t border-gold-500/15 py-7 transition-colors duration-300 last:border-b hover:bg-gold-500/[0.04] sm:py-9"
                >
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-8">
                    <h3 className="font-serif text-3xl text-cream transition-colors duration-300 group-hover:text-gold-300 sm:text-4xl">
                      {city.name}
                    </h3>
                    <p className="text-sm text-cream-faint">{city.note}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="hidden text-[12px] uppercase tracking-[0.2em] text-cream-muted sm:block">
                      {city.count}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/30 text-gold-400 transition-all duration-300 group-hover:border-gold-400 group-hover:bg-gold-500 group-hover:text-noir-950">
                      <ArrowUpRight size={18} aria-hidden />
                    </span>
                  </div>
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
