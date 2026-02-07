import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';

// Función para obtener la campaña activa más reciente
async function getActiveCampaign() {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('activa', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!campaign) return null

  // Si hay campaña, buscamos sus productos y sus precios especiales
  const { data: items } = await supabase
    .from('campaign_items')
    .select(`
      precio_oferta,
      products ( * )
    `)
    .eq('campaign_id', campaign.id)

  // Transformamos los datos para que parezcan productos normales pero con el precio cambiado
  const campaignProducts = items?.map((item: any) => ({
    ...item.products,
    // Sobrescribimos el precio normal con el de oferta para visualización
    precio_oferta: item.precio_oferta, 
    en_oferta: true, // Forzamos la bandera de oferta
    precio_original: item.products.precio // Guardamos el original para comparar
  })) || []

  return { info: campaign, products: campaignProducts }
}

// Función del catálogo normal (la de siempre)
async function getCatalog(params: any) {
  let query = supabase.from('products').select('*').eq('estado', true).order('created_at', { ascending: false });
  // ... (Tus filtros de búsqueda que ya tenías van aquí)
  if (params.q) query = query.ilike('nombre', `%${params.q}%`);
  // ...
  const { data } = await query;
  return data || [];
}

export default async function Home({ searchParams }: any) {
  const params = await searchParams;
  
  // 1. Cargar Campaña (Evento)
  const campaign = !params.q ? await getActiveCampaign() : null; // Solo mostramos campaña si no están buscando algo específico
  
  // 2. Cargar Catálogo Normal
  const catalogProducts = await getCatalog(params);

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
        
        {/* 🔥 SECCIÓN DE EVENTO (SI EXISTE) 🔥 */}
        {campaign && campaign.products.length > 0 && (
            <section className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-100">
                {/* Banner del Evento */}
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

                {/* Grid de Productos del Evento */}
                <div className="p-6 md:p-8 bg-gradient-to-b from-orange-50 to-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {campaign.products.map((product: any) => (
                             // Usamos una versión especial de Card o la misma pasándole props
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* Catálogo Estándar */}
        <section>
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
                Catálogo General
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {catalogProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>

      </div>
    </main>
  );
}