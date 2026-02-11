import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Permite todas las URLs de Supabase
      },
    ],
    // Esto es vital para ahorrar costos en Vercel si usas muchas fotos:
    // Si quieres que Supabase sirva la foto directa sin que Vercel la toque (más barato):
    unoptimized: true, 
  },
};

export default nextConfig;
