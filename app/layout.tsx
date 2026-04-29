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
          Frame backdrop preload chain (scroll-choreography.md §7).
          f01–f08 are eager + high-priority — they cover B1 (4 frames) and
          the leading edge of B2 (next 4) so the byte cache is warm before
          the user's first downward gesture. f09–f27 ride the lower-priority
          tail; SnapRibbon also fires preloadFrames(2,27) on mount as
          belt-and-braces for slow connections.
        */}
        <link rel="preload" as="image" href="/frames/f01.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/f02.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/f03.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/f04.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/f05.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/f06.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/f07.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/f08.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/frames/f09.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f10.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f11.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f12.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f13.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f14.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f15.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f16.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f17.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f18.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f19.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f20.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f21.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f22.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f23.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f24.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f25.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f26.webp" fetchPriority="low" />
        <link rel="preload" as="image" href="/frames/f27.webp" fetchPriority="low" />
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
