import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strip console.* in production builds (reduces bundle + improves performance score)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  // Remove X-Powered-By header (minor security + perf improvement)
  poweredByHeader: false,
  // Enable gzip compression for all pages and API routes
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.convex.cloud" },
      { protocol: "https", hostname: "**.clerk.com" },
    ],
    // Use webp format by default for better compression
    formats: ["image/webp", "image/avif"],
  },
  serverExternalPackages: ["openai"],
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",   // allow large product image uploads (batch of 10)
    },
  },
};

export default nextConfig;
