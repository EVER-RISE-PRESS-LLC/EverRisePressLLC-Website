import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  images: {
    // Serve prepared static assets and bounded D1 uploads directly.
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
};

export default nextConfig;
