import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/lenis-provider";
import { SkipLink } from "@/components/skip-link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "ZeusBot — A fleet of agents",
  description:
    "ZeusBot is agentic AI as a service for small business — a coordinated fleet of specialists, always on, always shipping.",
  metadataBase: new URL("https://zeusbot-site.pages.dev"),
  openGraph: {
    title: "ZeusBot — A fleet of agents",
    description:
      "Agentic AI as a service for small business. A coordinated fleet of specialists, always on, always shipping.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeusBot — A fleet of agents",
    description:
      "Agentic AI as a service for small business. A coordinated fleet of specialists, always on, always shipping.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <head>
        {/*
          Frame backdrop preload — v4 chunked tier (scroll-choreography.md §6.2 / §7).

          Tier 1 (LCP-block, f01-f04): eager + fetchpriority=high. Mobile
          DPR=2 picks the -720 variant via imagesrcset, ~17KB × 4 = 68KB
          warm before the user's first gesture. Decoding in <40ms on
          iPhone 12 baseline keeps LCP <2.5s.

          Tier 2 (Hero rest, f05-f15): eager + fetchpriority=low. Browser
          schedules these after Tier 1 lands; covers Hero B2-B4 + the
          first content scene transition so the byte cache is warm by the
          time auto-advance runs out at ~3.2s post-mount.

          Tier 3 (Content, f16-f27): NOT preloaded in <head>. SnapRibbon
          JS-injects <link rel="prefetch"> for these after Hero B4 plays
          (~3.2s post-mount), keeping them off the critical path on mobile
          slow-4G.
        */}
        {/* Tier 1 — LCP-block */}
        <link
          rel="preload"
          as="image"
          href="/frames/f01-720.webp"
          imageSrcSet="/frames/f01-720.webp 720w, /frames/f01-1080.webp 1080w, /frames/f01.webp 1440w"
          imageSizes="100vw"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/frames/f02-720.webp"
          imageSrcSet="/frames/f02-720.webp 720w, /frames/f02-1080.webp 1080w, /frames/f02.webp 1440w"
          imageSizes="100vw"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/frames/f03-720.webp"
          imageSrcSet="/frames/f03-720.webp 720w, /frames/f03-1080.webp 1080w, /frames/f03.webp 1440w"
          imageSizes="100vw"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/frames/f04-720.webp"
          imageSrcSet="/frames/f04-720.webp 720w, /frames/f04-1080.webp 1080w, /frames/f04.webp 1440w"
          imageSizes="100vw"
          fetchPriority="high"
        />
        {/* Tier 2 — Hero rest */}
        {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => {
          const n = String(i).padStart(2, "0");
          return (
            <link
              key={`pre-${n}`}
              rel="preload"
              as="image"
              href={`/frames/f${n}-720.webp`}
              imageSrcSet={`/frames/f${n}-720.webp 720w, /frames/f${n}-1080.webp 1080w, /frames/f${n}.webp 1440w`}
              imageSizes="100vw"
              fetchPriority="low"
            />
          );
        })}
        {/* Tier 3 (f16-f27) — JS-prefetch in SnapRibbon after Hero B4 plays. */}
      </head>
      <body className="min-h-screen flex flex-col">
        {/* WCAG 2.1 AA escape hatch — must be first focusable element in <body>.
            See scroll-choreography.md §8 + components/skip-link.tsx. */}
        <SkipLink />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
