import type { Metadata } from "next";
import GlobalHomeLink from "./components/GlobalHomeLink";
import { LAUNCH_CATALOG_SIZE } from "./lib/destinations";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horizon Atlas | Life Match retirement search",
  description:
    `Discover the best retirement destinations with a one-time Life Match search across ${LAUNCH_CATALOG_SIZE} verified cities.`,
  icons: {
    icon: [{ url: "/brand/horizon-atlas-icon.svg", sizes: "any", type: "image/svg+xml" }],
    shortcut: [{ url: "/brand/horizon-atlas-icon.svg", type: "image/svg+xml" }],
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
