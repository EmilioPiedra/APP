'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Usamos sessionId del hook para no tener errores manuales
  const { sessionId } = useAnalytics() 

  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('cat') || 'Todas')
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '')
  const [searching, setSearching] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)

    // 1. TRACKING CORREGIDO ✅
    if (query && sessionId) {
       fetch('/api/events', {
         method: 'POST', 
         // Ahora enviamos el sessionId correcto que nos da el hook
         body: JSON.stringify({ type: 'search', query: query, session_id: sessionId })
       })
    }

    // 2. Construir URL (Igual que antes)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category !== 'Todas') params.set('cat', category)
    if (minPrice) params.set('min', minPrice)
    if (maxPrice) params.set('max', maxPrice)

    router.push(`/?${params.toString()}`)
    setSearching(false)
  }

  return (
    // ... (El resto de tu HTML/JSX se queda IGUAL, no lo cambies)
    <div className="w-full max-w-4xl mx-auto mb-8 relative z-50">
      <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            
            {/* Input Texto */}
            <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl border focus-within:border-blue-500 focus-within:bg-white transition-all">
                <span className="text-gray-400 mr-2">🔍</span>
                <input
                  type="text"
                  placeholder="Ej: Machete, Semillas..."
                  className="w-full py-3 bg-transparent outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Botones */}
            <div className="flex gap-2">
                <button 
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                >
                    <span>🌪️</span> <span className="hidden sm:inline">Filtros</span>
                </button>
                <button 
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                >
                    {searching ? '...' : 'Buscar'}
                </button>
            </div>
        </form>

        {/* Panel Desplegable de Filtros (Igual que antes) */}
        {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                    <select 
                        value={category} onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 rounded border bg-gray-50 mt-1"
                    >
                        <option value="Todas">Todas</option>
                        <option value="Herramientas">Herramientas</option>
                        <option value="Semillas">Semillas</option>
                        <option value="Fertilizantes">Fertilizantes</option>
                        <option value="Maquinaria">Maquinaria</option>
                        <option value="Ropa de Trabajo">Ropa de Trabajo</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Precio Mín</label>
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full p-2 rounded border bg-gray-50 mt-1" placeholder="0" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Precio Máx</label>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full p-2 rounded border bg-gray-50 mt-1" placeholder="Sin límite" />
                </div>
            </div>
        )}
      </div>
    </div>
  )
}