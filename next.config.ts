import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The API runs on localhost in dev, which Next 16 blocks by default as
    // an SSRF guard (image URLs resolving to a private IP). Scoped to dev
    // only: a real deployment points remotePatterns at a public API domain,
    // not localhost, so this must never be true in a production build.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5051",
      },
      {
        protocol: "https",
        hostname: "*.fly.dev",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },
    ],
  },
};

export default nextConfig;
