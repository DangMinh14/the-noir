const ITEMS = [
  "Single-Origin Black Tea",
  "Slow-Steeped Milk Tea",
  "Phin Coffee",
  "Highlands of Vietnam",
  "Crafted Since 2016",
];

export function Marquee() {
  const row = (ariaHidden: boolean) => (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center"
    >
      {ITEMS.map((item) => (
        <li
          key={item}
          className="flex items-center gap-10 pr-10 font-serif text-lg italic text-gold-400/80 sm:text-xl"
        >
          {item}
          <span aria-hidden className="text-[9px] not-italic text-gold-600">
            ◆
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="overflow-hidden border-y border-gold-500/15 bg-noir-900 py-5">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
