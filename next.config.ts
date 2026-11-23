import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A small self-contained server for Docker / Railway (see Dockerfile).
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
