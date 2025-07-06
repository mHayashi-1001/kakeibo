import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve("buffer"),
      async_hooks: require.resolve("async_hooks"),
    };
    return config;
  },
};

export default nextConfig;
