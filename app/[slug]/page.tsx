import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { notFound } from 'next/navigation';

// 1. Función para obtener la campaña activa
async function getActiveCampaign(storeId: string) {
  try {
      // Intento de buscar campaña (puede fallar si no existe la tabla)
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('activa', true)
        // .eq('store_id', storeId) // Si las campañas son por tienda
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !campaign) return null

      const { data: items } = await supabase
        .from('campaign_items')
        .select(`
          precio_oferta,
          products ( * )
        `)
        .eq('campaign_id', campaign.id)

      const campaignProducts = items?.map((item: any) => {
          if (!item.products) return null
          // Verificar que el producto sea de esta tienda (por si acaso)
          if (item.products.store_id !== storeId) return null

          return {
            ...item.products,
            precio_oferta: item.precio_oferta, 
            en_oferta: true, 
            precio_original: item.products.precio 
          }
      }).filter(Boolean) || []

      return { info: campaign, products: campaignProducts }
  } catch (err) {
      return null
  }
}

// 2. Función del catálogo normal
async function getCatalog(params: any, storeId: string) {
  // A. Pedimos productos DE ESTA TIENDA
  let query = supabase
    .from('products')
    .select('*')
    .eq('estado', true)
    .eq('store_id', storeId) // <--- CRUCIAL: Filtrar por tienda
    .order('created_at', { ascending: false });
  
  // Filtros
  if (params.q) query = query.ilike('nombre', `%${params.q}%`);
  if (params.cat && params.cat !== 'Todas') query = query.eq('categoria', params.cat);
  if (params.min) query = query.gte('precio', parseFloat(params.min));
  if (params.max) query = query.lte('precio', parseFloat(params.max));

  const { data: products } = await query;
  if (!products) return [];

  // B. Intentamos buscar ofertas
  let productsWithOffers = products;
  try {
      const { data: activeOffers } = await supabase
        .from('campaign_items')
        .select('product_id, precio_oferta, campaigns!inner(activa)')
        .eq('campaigns.activa', true);

      if (activeOffers) {
          productsWithOffers = products.map((p: any) => {
            const offer = activeOffers.find((o: any) => o.product_id === p.id);
            if (offer) {
              return {
                ...p,
                precio_oferta: offer.precio_oferta,
                en_oferta: true,
                precio_original: p.precio
              };
            }
            return p;
          });
      }
  } catch (err) {
      // Ignoramos error de ofertas si no hay tabla
  }

  return productsWithOffers;
}

export default async function Home({ searchParams, params }: any) {
  const resolvedParams = await params; // { slug: '...' }
  const searchParamsResolved = await searchParams;
  
  // 1. Validar Tienda
  const { data: store, error } = await supabase
    .from('stores')
    .select('id, nombre, slug')
    .eq('slug', resolvedParams.slug) // Buscamos por el slug de la URL
    .single();

  if (error || !store) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Tienda No Encontrada 🏪</h1>
              <p className="text-gray-500">La tienda "{resolvedParams.slug}" no existe o ha sido desactivada.</p>
          </div>
      )
  }

  // 2. Cargar catálogo de ESTA tienda
  const campaign = !searchParamsResolved.q ? await getActiveCampaign(store.id) : null;
  const catalogProducts = await getCatalog(searchParamsResolved, store.id);

  const isFiltering = searchParamsResolved.q || (searchParamsResolved.cat && searchParamsResolved.cat !== 'Todas') || searchParamsResolved.min;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
            {store.nombre} {/* Usamos el nombre real de la tienda */}
        </h1>
      </header>

      {/* Hero y Buscador */}
      <div className="bg-blue-600 py-10 px-4 shadow-lg mb-8">
        <div className="max-w-4xl mx-auto text-center">
            <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        {/* SECCIÓN DE EVENTO (Banner) */}
        {campaign && campaign.products.length > 0 && (
            <section className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-100">
                <div className="relative h-48 md:h-64 w-full bg-gray-900">
                    <img src={campaign.info.banner_url} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <span className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 animate-pulse">
                            Evento Activo
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
                            {campaign.info.titulo}
                        </h2>
                    </div>
                </div>
                <div className="p-6 md:p-8 bg-gradient-to-b from-orange-50 to-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {campaign.products.map((product: any) => (
                            <ProductCard key={product.id} product={product} storeSlug={resolvedParams.slug} />
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* Catálogo Estándar */}
        <section>
            <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
                    {isFiltering ? 'Resultados de búsqueda' : 'Catálogo General'}
                </h3>
                {isFiltering && (
                    <a href={`/${resolvedParams.slug}`} className="text-sm text-red-500 hover:underline">Borrar filtros ✖</a>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {catalogProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} storeSlug={resolvedParams.slug} />
                ))}
            </div>
            
            {catalogProducts.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No encontramos productos en esta tienda.
                </div>
            )}
        </section>

      </div>
    </main>
  );
}