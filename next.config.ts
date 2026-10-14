import type { NextConfig } from "next";
import os from "node:os";

const isProduction = process.env.NODE_ENV === "production";

// Next's `allowedDevOrigins` does not treat `*` as a wildcard. Discover the
// machine's actual LAN IPv4 addresses so HMR works from phones and other
// devices on the same network without opening production origins.
const localNetworkOrigins = isProduction
  ? []
  : Object.values(os.networkInterfaces())
      .flatMap((entries) => entries ?? [])
      .filter((entry) => entry.family === "IPv4" && !entry.internal)
      .map((entry) => entry.address);

const envOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean)
  : [];

const defaultOrigins = [
  "localhost",
  "127.0.0.1",
  "10.53.182.234",
  "0.0.0.0",
  "192.168.0.0/16",
  "10.0.0.0/8",
];

const nextConfig: NextConfig = {
  // Allow all dev origins from environment variable & default LAN subnets to prevent HMR cross-origin reloads
  allowedDevOrigins: Array.from(new Set([
    ...defaultOrigins,
    ...localNetworkOrigins,
    ...envOrigins.filter((origin) => origin !== "*"),
  ])),
  experimental: {
    // Proxy clones/buffers request bodies (default cap 10MB). The vault
    // streams multipart uploads up to 500MB via busboy, so raise the cap
    // past that + multipart overhead. (The upload path is additionally
    // excluded from the proxy matcher in src/proxy.ts to avoid buffering
    // large bodies in memory on small instances.)
    proxyClientMaxBodySize: "520mb",
  },  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          ...(isProduction
            ? [
                { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
                { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
                { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
              ]
            : []),
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
