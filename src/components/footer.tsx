const NAV = [
  { href: "#collection", label: "Collection" },
  { href: "#story", label: "Our Story" },
  { href: "#ritual", label: "The Ritual" },
  { href: "#maisons", label: "Maisons" },
];

const SOCIAL = [
  { href: "#", label: "Instagram" },
  { href: "#", label: "Facebook" },
  { href: "#", label: "TikTok" },
];

export function Footer() {
  return (
    <footer className="border-t border-gold-500/15 bg-noir-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-16 sm:px-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl text-cream">
            Thé <span className="italic text-gold-400">Noir</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-muted">
            Vietnam&rsquo;s house of black tea. Single-origin leaves, slow
            ritual, French manners. Open daily from 7:00 to 22:30.
          </p>
        </div>

        <nav aria-label="Footer">
          <h3 className="text-[11px] uppercase tracking-[0.28em] text-gold-400">
            Explore
          </h3>
          <ul className="mt-5 space-y-3">
            {NAV.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-cream-muted transition-colors duration-200 hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-[11px] uppercase tracking-[0.28em] text-gold-400">
            Follow
          </h3>
          <ul className="mt-5 space-y-3">
            {SOCIAL.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-cream-muted transition-colors duration-200 hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-cream-faint">
            hello@thenoir.vn
            <br />
            +84 28 3512 2016
          </p>
        </div>
      </div>

      <div className="border-t border-gold-500/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-cream-faint sm:flex-row sm:px-8">
          <p>© 2026 Thé Noir. A fictional brand, brewed for a portfolio.</p>
          <p className="italic">L&rsquo;art du thé noir, né au Việt Nam.</p>
        </div>
      </div>
    </footer>
  );
}
