import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
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
    type: "website",
    locale: "en_US",
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
      className={`${playfair.variable} ${inter.variable} scroll-smooth antialiased`}
    >
      <body className="bg-noir-950 text-cream font-sans selection:bg-gold-500/30 selection:text-cream">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
