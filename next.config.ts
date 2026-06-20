import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
