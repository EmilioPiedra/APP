import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';

// 1. Función para obtener la campaña activa (Banner gigante)
async function getActiveCampaign() {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('activa', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!campaign) return null

  const { data: items } = await supabase
    .from('campaign_items')
    .select(`
      precio_oferta,
      products ( * )
    `)
    .eq('campaign_id', campaign.id)

  const campaignProducts = items?.map((item: any) => ({
    ...item.products,
    precio_oferta: item.precio_oferta, 
    en_oferta: true, 
    precio_original: item.products.precio 
  })) || []

  return { info: campaign, products: campaignProducts }
}

// 2. Función del catálogo normal MEJORADA (Ahora detecta ofertas)
async function getCatalog(params: any) {
  // A. Pedimos productos
  let query = supabase.from('products').select('*').eq('estado', true).order('created_at', { ascending: false });
  
  // Filtros
  if (params.q) query = query.ilike('nombre', `%${params.q}%`);
  if (params.cat && params.cat !== 'Todas') query = query.eq('categoria', params.cat);
  if (params.min) query = query.gte('precio', parseFloat(params.min));
  if (params.max) query = query.lte('precio', parseFloat(params.max));

  const { data: products } = await query;
  if (!products) return [];

  // B. 🔥 EL FIX: Pedimos las ofertas activas para cruzarlas
  const { data: activeOffers } = await supabase
    .from('campaign_items')
    .select('product_id, precio_oferta, campaigns!inner(activa)')
    .eq('campaigns.activa', true);

  // C. Mezclamos (Si el producto del catálogo está en oferta, le ponemos el precio nuevo)
  const productsWithOffers = products.map((p: any) => {
    const offer = activeOffers?.find((o: any) => o.product_id === p.id);
    
    if (offer) {
      return {
        ...p,
        precio_oferta: offer.precio_oferta, // Precio rebajado
        en_oferta: true,                    // Bandera activada
        precio_original: p.precio           // Guardamos el original
      };
    }
    return p; // Si no tiene oferta, se queda igual
  });

  return productsWithOffers;
}

export default async function Home({ searchParams }: any) {
  const params = await searchParams; // Next.js 15 await
  
  // Cargamos ambas cosas
  const campaign = !params.q ? await getActiveCampaign() : null;
  const catalogProducts = await getCatalog(params);

  const isFiltering = params.q || (params.cat && params.cat !== 'Todas') || params.min;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">AgroGonzanamá</h1>
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
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* Catálogo Estándar (AHORA CON OFERTAS TAMBIÉN) */}
        <section>
            <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
                    {isFiltering ? 'Resultados de búsqueda' : 'Catálogo General'}
                </h3>
                {isFiltering && (
                    <a href="/" className="text-sm text-red-500 hover:underline">Borrar filtros ✖</a>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {catalogProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            
            {catalogProducts.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No encontramos productos con esos filtros.
                </div>
            )}
        </section>

      </div>
    </main>
  );
}