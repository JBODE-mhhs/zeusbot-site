import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  // Pin Turbopack root so Next doesn't latch onto the parent Sage lockfile
  // (this repo is a sibling working dir inside the Sage tree).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
