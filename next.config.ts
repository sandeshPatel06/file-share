import type { NextConfig } from "next";

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
  allowedDevOrigins: Array.from(new Set([...defaultOrigins, ...envOrigins])),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
