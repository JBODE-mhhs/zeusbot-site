import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
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
          Frame backdrop preload chain (scroll-choreography.md v5 §7.1).

          Tier 1 (LCP-block, f01–f04): high priority. Mobile DPR=2 picks
          the -720 variant via imageSrcSet (~17 KB × 4 = ~68 KB) so the
          FrameCanvas can paint the first frame within the LCP window.

          Tier 2 (Hero rest, f05–f15): low priority. Browser schedules
          after Tier 1; warms the byte cache before the hero pin's scrub
          range covers them.

          Tier 3 (Content, f16–f27): prefetch hints in head; lower priority
          still, off the LCP critical path. The canvas preload pass kicks
          off Image() decode for all 27 frames after first paint.
        */}
        {/* Tier 1 — LCP-block */}
        {[1, 2, 3, 4].map((i) => {
          const n = String(i).padStart(2, "0");
          return (
            <link
              key={`pre-${n}`}
              rel="preload"
              as="image"
              href={`/frames/f${n}-720.webp`}
              imageSrcSet={`/frames/f${n}-720.webp 720w, /frames/f${n}-1080.webp 1080w, /frames/f${n}.webp 1440w`}
              imageSizes="100vw"
              fetchPriority="high"
            />
          );
        })}
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
        {/* Tier 3 — Content (prefetch, off LCP path) */}
        {[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27].map((i) => {
          const n = String(i).padStart(2, "0");
          return (
            <link
              key={`prefetch-${n}`}
              rel="prefetch"
              as="image"
              href={`/frames/f${n}-720.webp`}
              imageSrcSet={`/frames/f${n}-720.webp 720w, /frames/f${n}-1080.webp 1080w, /frames/f${n}.webp 1440w`}
              imageSizes="100vw"
            />
          );
        })}
      </head>
      <body className="min-h-screen flex flex-col">
        {/* WCAG 2.1 AA escape hatch — must be first focusable element in <body>.
            v5: ribbon doesn't lock body overflow, so the skip-link is just
            a normal anchor link. */}
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
