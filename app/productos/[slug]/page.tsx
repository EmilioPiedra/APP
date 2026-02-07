import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types/product';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Product;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return notFound();
  }

  const imagen = product.imagenes?.[0] || 'https://via.placeholder.com/600?text=No+Image';
  
  // 🟢 CONFIGURACIÓN WHATSAPP
  // Cambia este número por el tuyo real (código país + número)
  const telefono = "593999999999"; 
  const mensaje = `Hola, me interesa el producto *${product.nombre}* que vi en la web.`;
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  return (
    <main className="min-h-screen bg-white pb-20">
      
      {/* Botón Volver */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/" className="text-gray-600 hover:text-blue-600 flex items-center gap-2 font-medium">
          ← Volver al catálogo
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Columna Izquierda: Imagen */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden aspect-square flex items-center justify-center p-4">
          <img 
            src={imagen} 
            alt={product.nombre} 
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Columna Derecha: Información */}
        <div className="flex flex-col justify-center pt-4">
          <span className="text-sm text-blue-600 font-bold tracking-widest uppercase mb-3">
            {product.categoria || 'Producto Destacado'}
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {product.nombre}
          </h1>

          <div className="text-3xl font-bold text-gray-900 mb-6 flex items-baseline gap-2">
            ${product.precio?.toFixed(2)}
            <span className="text-sm font-normal text-gray-500">USD</span>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Descripción:</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
                {product.descripcion}
            </p>
          </div>

          <div className="space-y-4">
            {/* 👇 AQUÍ ESTÁ EL BOTÓN VERDE 👇 */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-green-200"
            >
              {/* Icono de WhatsApp (SVG) */}
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Comprar por WhatsApp
            </a>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Respuesta inmediata
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}