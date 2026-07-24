import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LAUNCH_CATALOG_SIZE } from "./lib/destinations";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
