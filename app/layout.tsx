import type { Metadata } from "next";
import GlobalHomeLink from "./components/GlobalHomeLink";
import { LAUNCH_CATALOG_SIZE } from "./lib/destinations";
import "./globals.css";

export const metadata: Metadata = {
  title: "DestinationFinderAI | Life Match retirement search",
  description:
    `Discover the best retirement destinations with a one-time Life Match search across ${LAUNCH_CATALOG_SIZE} verified cities.`,
  icons: {
    icon: [{ url: "/brand/destinationfinder-ai-logo.png", sizes: "any", type: "image/png" }],
    shortcut: [{ url: "/brand/destinationfinder-ai-logo.png", type: "image/png" }],
    apple: [{ url: "/brand/destinationfinder-ai-logo.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "DestinationFinderAI | Life Match retirement search",
    description: "Discover the best retirement destinations with a one-time Life Match search across curated global cities.",
    type: "website",
    images: [{ url: "/brand/destinationfinder-ai-logo.png", width: 1200, height: 630, alt: "DestinationFinderAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DestinationFinderAI | Life Match retirement search",
    description: "Discover the best retirement destinations with a one-time Life Match search across curated global cities.",
    images: ["/brand/destinationfinder-ai-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--atlas-canvas)] text-[var(--atlas-ink)]">
        {children}
        <GlobalHomeLink />
      </body>
    </html>
  );
}
