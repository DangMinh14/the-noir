import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Collection } from "@/components/collection";
import { Story } from "@/components/story";
import { Ritual } from "@/components/ritual";
import { Maisons } from "@/components/maisons";
import { FinalCta } from "@/components/cta";
import { Footer } from "@/components/footer";
import { Preloader } from "@/components/preloader";

export default function Home() {
  return (
    <div className="grain">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-noir-950"
      >
        Skip to content
      </a>
      <Preloader />
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <Collection />
        <Story />
        <Ritual />
        <Maisons />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
