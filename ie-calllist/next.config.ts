import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@libsql/client', 'libsql', '@prisma/adapter-libsql'],
  // Empty turbopack config to allow webpack configuration
  turbopack: {},
  webpack: (config) => {
    // Ensure native modules are handled correctly
    config.externals = [...(config.externals || []), '@libsql/client', 'libsql'];
    return config;
  },
};

export default nextConfig;
