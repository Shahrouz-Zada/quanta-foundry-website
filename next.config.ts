import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep WebSocket-related packages as external Node.js modules
  // so Vercel's bundler doesn't break the native 'mask' function
  // used by @neondatabase/serverless.
  serverExternalPackages: ['ws', 'bufferutil', 'utf-8-validate'],
  images: {
    // Allow images from local and future CMS sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/programs',
        destination: '/focus-areas',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
