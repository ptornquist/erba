import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sport History Clue",
    template: "%s · Sport History Clue",
  },
  description:
    "Guess the moment. Name the year. A daily sports-history archive with expeditions through time.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        <SiteHeader />
        <main className="mx-auto min-h-[70vh] w-full max-w-5xl px-4 py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
