import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-32 sm:py-44">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/7 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="mb-6 text-[12px] uppercase tracking-[0.32em] text-gold-400">
            Une invitation
          </p>
          <h2 className="font-serif text-4xl leading-tight text-cream sm:text-6xl">
            The kettle is on.
            <br />
            <em className="italic text-gold-300">Come sit a while.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-xl leading-relaxed text-cream-muted">
            Every maison keeps a long table, warm light and a menu that reads
            like a love letter to Vietnamese leaf. No reservation needed, just
            an unhurried hour.
          </p>
          <a
            href="#maisons"
            className="mt-11 inline-flex items-center bg-gold-500 px-9 py-4 text-[13px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors duration-300 hover:bg-gold-400"
          >
            Find your maison
          </a>
        </Reveal>
      </div>
    </section>
  );
}
