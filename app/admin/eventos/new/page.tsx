'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

// Tipo para los productos
interface Product {
  id: string
  nombre: string
  precio: number
  imagenes: string[]
  estado: boolean
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Datos del Evento
  const [titulo, setTitulo] = useState('')
  const [banner, setBanner] = useState<File | null>(null)
  
  // Lista completa de productos (Tipada)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})

  useEffect(() => {
    supabase.from('products').select('*').eq('estado', true)
      .then(({ data }) => {
        if (data) setAllProducts(data as Product[])
      })
  }, [])

  const toggleProduct = (id: string, precioOriginal: number) => {
    if (selectedItems[id]) {
      const copy = { ...selectedItems }
      delete copy[id]
      setSelectedItems(copy)
    } else {
      setSelectedItems({ ...selectedItems, [id]: precioOriginal * 0.9 })
    }
  }

  const updateOfferPrice = (id: string, price: string) => {
    setSelectedItems({ ...selectedItems, [id]: parseFloat(price) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!banner) throw new Error('Falta el banner del evento')
      if (Object.keys(selectedItems).length === 0) throw new Error('Selecciona al menos un producto')

      const fileName = `banner-${Date.now()}.png`
      const { error: upErr } = await supabase.storage.from('campaign-banners').upload(fileName, banner)
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('campaign-banners').getPublicUrl(fileName)

      const { data: campaign, error: campErr } = await supabase
        .from('campaigns')
        .insert([{ titulo, banner_url: publicUrl, activa: true }])
        .select()
        .single()
      
      if (campErr) throw campErr

      const itemsToInsert = Object.entries(selectedItems).map(([prodId, price]) => ({
        campaign_id: campaign.id,
        product_id: prodId,
        precio_oferta: price
      }))

      const { error: itemsErr } = await supabase.from('campaign_items').insert(itemsToInsert)
      if (itemsErr) throw itemsErr

      alert('¡Evento Publicado! 🚀')
      router.push('/')

    } catch (error: any) {
      alert('Error: ' + (error.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Crear Gran Evento / Oferta 🎉</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <label className="block font-bold mb-2">Título del Evento</label>
            <input required type="text" className="w-full border p-3 rounded-lg mb-4" 
              placeholder="Ej: Liquidación de Semillas 2026"
              value={titulo} onChange={e => setTitulo(e.target.value)} />
            
            <label className="block font-bold mb-2">Banner Publicitario (Imagen Horizontal)</label>
            <input required type="file" accept="image/*" className="w-full bg-white border p-2 rounded-lg"
              onChange={e => setBanner(e.target.files?.[0] || null)} />
          </div>

          <div>
            <h3 className="font-bold text-xl mb-4">Selecciona los productos para este evento:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto border p-4 rounded-xl">
              {allProducts.map(p => {
                const isSelected = selectedItems.hasOwnProperty(p.id)
                return (
                  <div key={p.id} className={`p-4 rounded-lg border transition-all ${isSelected ? 'bg-green-50 border-green-500 ring-2 ring-green-200' : 'bg-white hover:bg-gray-50'}`}>
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 mt-1"
                        checked={isSelected}
                        onChange={() => toggleProduct(p.id, p.precio)}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">{p.nombre}</div>
                        <div className="text-sm text-gray-500">Precio Normal: ${p.precio}</div>
                        {isSelected && (
                          <div className="mt-2 animate-in fade-in">
                            <label className="text-xs font-bold text-green-700">Precio Oferta Evento:</label>
                            <input 
                              type="number" 
                              className="w-full border border-green-300 p-1 rounded text-lg font-bold text-green-700"
                              value={selectedItems[p.id]}
                              onChange={(e) => updateOfferPrice(p.id, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      <img src={p.imagenes?.[0]} alt={p.nombre} className="w-12 h-12 object-cover rounded" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-blue-700 shadow-xl">
            {loading ? 'Publicando Evento...' : '🚀 PUBLICAR EVENTO AHORA'}
          </button>
        </form>
      </div>
    </div>
  )
}