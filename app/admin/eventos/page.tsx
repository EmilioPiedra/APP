'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface Campaign {
  id: string
  titulo: string
  banner_url: string
  activa: boolean
  created_at: string
}

export default function EventsManagerPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Cargar Eventos
  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setCampaigns(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // 2. Activar / Desactivar (El interruptor)
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    // Cambio visual optimista (para que se sienta rápido)
    const newStatus = !currentStatus
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, activa: newStatus } : c))

    // Cambio real en base de datos
    const { error } = await supabase
      .from('campaigns')
      .update({ activa: newStatus })
      .eq('id', id)

    if (error) {
      alert('Error actualizando')
      fetchCampaigns() // Revertir si falló
    }
  }

  // 3. Borrar Evento
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de borrar este evento? Se eliminarán los precios especiales asociados.')) return

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (!error) {
      setCampaigns(campaigns.filter(c => c.id !== id))
    } else {
      alert('Error al borrar: ' + error.message)
    }
  }

  if (loading) return <div className="p-10 text-center">Cargando eventos... ⏳</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Eventos 🎉</h1>
            <p className="text-gray-500">Activa o desactiva tus campañas promocionales</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-4 py-2 border bg-white rounded-lg hover:bg-gray-50">
              ← Volver al Panel
            </Link>
            <Link href="/admin/eventos/new" className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-lg flex items-center gap-2">
              <span>+</span> Crear Nuevo Evento
            </Link>
          </div>
        </div>

        {/* LISTA DE EVENTOS */}
        <div className="grid grid-cols-1 gap-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
              <p className="text-gray-400 text-lg">No tienes eventos creados.</p>
              <Link href="/admin/eventos/new" className="text-orange-600 font-bold hover:underline mt-2 inline-block">
                ¡Crea el primero ahora!
              </Link>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row gap-6 items-center transition-all ${!campaign.activa ? 'opacity-60 grayscale' : ''}`}>
                
                {/* Banner Miniatura */}
                <div className="w-full md:w-48 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img src={campaign.banner_url} className="w-full h-full object-cover" alt="Banner" />
                  {!campaign.activa && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xs uppercase">
                      Desactivado
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-gray-800">{campaign.titulo}</h3>
                  <p className="text-xs text-gray-400">Creado el: {new Date(campaign.created_at).toLocaleDateString()}</p>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-6">
                  
                  {/* Interruptor Activo/Inactivo */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Estado</span>
                    <button 
                        onClick={() => toggleStatus(campaign.id, campaign.activa)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                        campaign.activa ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                        campaign.activa ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                    </button>
                  </div>

                  {/* Botón Borrar */}
                  <button 
                    onClick={() => handleDelete(campaign.id)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar Evento Definitivamente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}