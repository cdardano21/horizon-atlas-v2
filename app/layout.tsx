import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, IBM_Plex_Mono } from "next/font/google";
import GlobalHomeLink from "./components/GlobalHomeLink";
import { LAUNCH_CATALOG_SIZE } from "./lib/destinations";
import "./globals.css";

const atlasSans = Manrope({
  variable: "--font-atlas-sans",
  subsets: ["latin"],
  display: "swap",
});

const atlasMono = IBM_Plex_Mono({
  variable: "--font-atlas-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const atlasDisplay = Cormorant_Garamond({
  variable: "--font-atlas-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Horizon Atlas | Life Match retirement search",
  description:
    `Discover the best retirement destinations with a one-time Life Match search across ${LAUNCH_CATALOG_SIZE} verified cities.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${atlasSans.variable} ${atlasMono.variable} ${atlasDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--atlas-canvas)] text-[var(--atlas-ink)]">
        {children}
        <GlobalHomeLink />
      </body>
    </html>
  );
}
