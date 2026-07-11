import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { BackToTop } from "@/components/back-to-top";
import { CursorGlow } from "@/components/cursor-glow";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// Editorial humanist sans instead of the ubiquitous Inter — same clarity,
// less "every SaaS site" familiarity, still full Vietnamese diacritics.
const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const OG_IMAGE = {
  url: "/images/hero-poster.jpg",
  width: 1920,
  height: 1080,
  alt: "The four Thé Noir signature drinks on a dark marble counter",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Thé Noir · The Art of Black Tea",
  description:
    "Thé Noir is Vietnam's house of black tea. Single-origin teas, milk teas and phin coffee, served with French manners in the heart of Saigon.",
  keywords: [
    "Thé Noir",
    "black tea",
    "milk tea",
    "Vietnamese coffee",
    "tea house",
    "Vietnam",
  ],
  openGraph: {
    title: "Thé Noir · The Art of Black Tea",
    description:
      "Vietnam's house of black tea. Single-origin teas, milk teas and phin coffee, served with French manners.",
    url: SITE_URL,
    siteName: "Thé Noir",
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thé Noir · The Art of Black Tea",
    description:
      "Vietnam's house of black tea. Single-origin teas, milk teas and phin coffee, served with French manners.",
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${manrope.variable} scroll-smooth antialiased`}
    >
      <body className="bg-noir-950 text-cream font-sans selection:bg-gold-500/30 selection:text-cream">
        <CursorGlow />
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
        <BackToTop />
      </body>
    </html>
  );
}
