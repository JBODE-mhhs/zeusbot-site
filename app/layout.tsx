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
          Frame backdrop preload — LCP critical path only (§7.1, post §10/4 fix).

          Originally tier 1 (f01–f04) + tier 2 (f05–f15) + tier 3 (f16–f27)
          were all hinted in <head>. On slow-4G with Lighthouse simulate, the
          800 KB image bandwidth contention extended LCP to ~5.7 s (the SSR
          f01-720 backdrop competed against 27 frames on a 1638 Kbps pipe).

          New strategy: preload only the f01 LCP image in <head>. The remaining
          26 frames are decoded by ScrollEngine.preloadRemainingFrames() which
          runs in the background AFTER first paint — so they don't fight the
          LCP image for bytes.
        */}
        <link
          rel="preload"
          as="image"
          href="/frames/f01-720.webp"
          imageSrcSet="/frames/f01-720.webp 720w, /frames/f01-1080.webp 1080w, /frames/f01.webp 1440w"
          imageSizes="100vw"
          fetchPriority="high"
        />
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
