const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent better-sqlite3 and bcryptjs from being bundled client-side
  // In Next.js 14 App Router, this config key is correct
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'bcryptjs'],
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };
    return config;
  },
};

module.exports = nextConfig;
