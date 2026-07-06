import { Leaf, Clock3, Coffee } from "lucide-react";
import { Reveal } from "./reveal";

const STEPS = [
  {
    number: "01",
    title: "The Leaf",
    icon: Leaf,
    text: "Picked at dawn, two leaves and a bud, withered on bamboo trays until the grassy edge softens into fruit and malt.",
  },
  {
    number: "02",
    title: "The Steep",
    icon: Clock3,
    text: "Water at 92°C, never boiling over the leaf. Four minutes of stillness, timed by hand at every counter, every day.",
  },
  {
    number: "03",
    title: "The Pour",
    icon: Coffee,
    text: "Served in warmed ceramic or over crystal-clear ice, finished with nothing it doesn't need. Sweetness is yours to choose.",
  },
];

export function Ritual() {
  return (
    <section id="ritual" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-4 flex items-center justify-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400">
          <span aria-hidden className="h-px w-10 bg-gold-500/60" />
          The Ritual
          <span aria-hidden className="h-px w-10 bg-gold-500/60" />
        </p>
        <h2 className="font-serif text-4xl leading-tight text-cream sm:text-5xl">
          Three acts, <em className="italic text-gold-300">one cup</em>
        </h2>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.number} delay={0.1 * i}>
            <article className="group h-full border-t border-gold-500/20 pt-8 transition-colors duration-300 hover:border-gold-400/60">
              <div className="flex items-center justify-between">
                <span className="font-serif text-5xl italic text-gold-500/40 transition-colors duration-300 group-hover:text-gold-400/70">
                  {step.number}
                </span>
                <step.icon
                  aria-hidden
                  size={26}
                  strokeWidth={1.5}
                  className="text-gold-400"
                />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-cream">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-muted">
                {step.text}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
