import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// 1. Función "Detective" mejorada
async function getProduct(slug: string) {
  // A. Buscamos el producto básico
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!product || error) return null;

  // B. 🔥 EL TRUCO: Buscamos si este producto está en una campaña ACTIVA
  const { data: offer } = await supabase
    .from('campaign_items')
    .select(`
      precio_oferta,
      campaigns!inner ( activa )
    `)
    .eq('product_id', product.id)
    .eq('campaigns.activa', true) // Importante: Solo campañas encendidas
    .maybeSingle();

  // C. Si hay oferta, mezclamos los datos para que la vista lo entienda
  if (offer) {
    return {
      ...product,
      precio_oferta: offer.precio_oferta, // Ponemos el precio de oferta
      en_oferta: true,                    // Activamos la bandera "OFERTA"
      precio_original: product.precio     // Guardamos el original para tacharlo
    };
  }

  // D. Si no hay oferta, devolvemos el producto normal
  return product;
}

export default async function ProductPage({ params }: any) {
  // Esperar a los params (Requisito de Next.js 15)
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return notFound();
  }

  // Lógica visual de precios
  const esOferta = product.en_oferta;
  
  // Calcular porcentaje de ahorro para la etiqueta
  const ahorro = esOferta && product.precio_original
    ? Math.round(((product.precio_original - product.precio_oferta) / product.precio_original) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb (Navegación) */}
        <nav className="flex mb-8 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-blue-600">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="capitalize">{product.categoria || 'General'}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.nombre}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 lg:flex">
          
          {/* COLUMNA IZQUIERDA: IMAGEN */}
          <div className="lg:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative min-h-[400px]">
            
            {/* Etiquetas Flotantes */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {esOferta && (
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider animate-pulse shadow-lg border border-red-500">
                        ¡OFERTA ACTIVA! 🔥
                    </span>
                )}
            </div>

            <img 
              src={product.imagenes?.[0] || '/placeholder.png'} 
              alt={product.nombre} 
              className="max-h-[500px] w-auto object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* COLUMNA DERECHA: INFO */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-2">
              {product.categoria || 'Producto'}
            </span>
            
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
              {product.nombre}
            </h1>

            {/* SECCIÓN DE PRECIOS */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {esOferta ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400 line-through text-xl font-medium">
                                ${product.precio_original?.toFixed(2)}
                            </span>
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">
                                -{ahorro}% DESCUENTO
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1 text-red-600">
                            <span className="text-3xl font-bold">$</span>
                            <span className="text-6xl font-black">{product.precio_oferta?.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-red-500 mt-1 font-medium">
                            * Precio exclusivo por evento limitado
                        </p>
                    </div>
                ) : (
                    <div className="flex items-baseline gap-1 text-gray-900">
                        <span className="text-3xl font-bold">$</span>
                        <span className="text-6xl font-black">{product.precio?.toFixed(2)}</span>
                    </div>
                )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.descripcion || 'Sin descripción detallada.'}
            </p>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row gap-4">
                <a 
                    href={`https://wa.me/593999999999?text=Hola! Me interesa el producto "${product.nombre}" que vi en oferta por $${esOferta ? product.precio_oferta : product.precio}`}
                    target="_blank"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-3 text-lg"
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Pedir por WhatsApp
                </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}