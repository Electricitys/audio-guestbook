import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // devIndicators: false,
  env: {
    SERVER_URL: process.env.SERVER_URL,
    APP_NAME: process.env.APP_NAME,
  },
};

export default nextConfig;
