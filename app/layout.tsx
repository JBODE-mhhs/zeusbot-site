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
          Frame backdrop preload — LCP critical path only (v6 §6.3 / §7.2).

          v6.1 ships 240 frames (16fps × 15s, 4-section 60/60/60/60). Preloading
          multiple frames in <head> would multiply the LCP-bandwidth contention
          the v5 §10/4 fix already isolated. Strategy is unchanged: hint only
          the f001 LCP image here. ScrollEngine.preloadRemainingFrames()
          decodes f002..f240 in the background AFTER first paint via
          fire-and-forget decode() so they don't fight the LCP image for
          bytes on slow-4G.
        */}
        <link
          rel="preload"
          as="image"
          href="/frames/f001-720.webp"
          imageSrcSet="/frames/f001-720.webp 720w, /frames/f001-1080.webp 1080w, /frames/f001.webp 1440w"
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
