import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
