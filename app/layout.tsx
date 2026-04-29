import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

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
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
