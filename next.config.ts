import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // 👈 AGREGA ESTO: Vital para Docker/VPS
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;