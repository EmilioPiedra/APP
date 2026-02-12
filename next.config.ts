import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Vital para tu servidor en Docker/VPS

  // Se eliminaron las opciones de 'ignore' para mayor seguridad.
  // Si tienes errores de TypeScript, es mejor arreglarlos antes de subir.

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // 'unoptimized: true' es necesario si no usas el optimizador de imágenes de Vercel pagado
    unoptimized: true, 
  },
};

export default nextConfig;