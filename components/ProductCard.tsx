'use client'
import { Product } from '@/types/product';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { trackEvent } = useAnalytics();
  const imagen = product.imagenes?.[0] || 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

  // Lógica de Precios
  const esOferta = product.en_oferta && product.precio_oferta;
  const precioFinal = esOferta ? product.precio_oferta : product.precio;
  
  // Calcular porcentaje de ahorro
  const porcentajeDescuento = esOferta && product.precio 
    ? Math.round(((product.precio - product.precio_oferta!) / product.precio) * 100) 
    : 0;

  return (
    <Link 
        href={`/productos/${product.slug}`} 
        className="group block h-full relative"
        onClick={() => trackEvent('click', product.id)}
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        
        {/* IMAGEN */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
          <img
            src={imagen}
            alt={product.nombre}
            className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* ETIQUETAS FLOTANTES */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {esOferta && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md uppercase tracking-wider animate-pulse">
                ¡Oferta!
              </span>
            )}
            <span className="bg-white/90 backdrop-blur text-gray-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100">
              {product.categoria || 'General'}
            </span>
          </div>

          {/* Badge de Descuento Circular */}
          {esOferta && porcentajeDescuento > 0 && (
            <div className="absolute bottom-3 right-3 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
              -{porcentajeDescuento}%
            </div>
          )}
        </div>
        
        {/* INFO */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.nombre}
          </h3>
          
          <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between">
            <div className="flex flex-col">
                {esOferta ? (
                    <>
                        <span className="text-xs text-gray-400 line-through font-medium mb-0.5">
                            USD {product.precio?.toFixed(2)}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-red-600">$</span>
                            <span className="text-2xl font-extrabold text-red-600">{product.precio_oferta?.toFixed(2)}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="text-xs text-gray-400 font-medium mb-0.5">Precio</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-gray-900">$</span>
                            <span className="text-2xl font-extrabold text-gray-900">{product.precio?.toFixed(2)}</span>
                        </div>
                    </>
                )}
            </div>

            <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${esOferta ? 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14 0"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}