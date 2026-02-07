'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

// Definimos los tipos aquí mismo para evitar errores de importación
interface DashboardStats {
  totalProducts: number
  totalInteractions: number
  topSearches: { term: string; count: number }[]
  topProducts: { name: string; count: number }[]
}

export default function MetricsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalInteractions: 0,
    topSearches: [],
    topProducts: []
  })

  useEffect(() => {
    async function loadStats() {
      // 1. Cargar Productos (solo necesitamos ID y nombre)
      const { data: products } = await supabase.from('products').select('id, nombre')
      
      // 2. Cargar Eventos (Search y Clicks)
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2000) // Analizamos los últimos 2000 eventos

      if (products && events) {
        processStats(products, events)
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  const processStats = (products: any[], events: any[]) => {
    // A. Top Búsquedas
    const searchMap: Record<string, number> = {}
    events
      .filter(e => e.type === 'search' && e.query)
      .forEach(e => {
        // Normalizamos: "Machete" es igual a "machete "
        const term = e.query.toLowerCase().trim()
        searchMap[term] = (searchMap[term] || 0) + 1
      })
    
    // B. Top Productos (Clics)
    const clickMap: Record<string, number> = {}
    events
      .filter(e => e.type === 'click' && e.product_id)
      .forEach(e => {
        clickMap[e.product_id] = (clickMap[e.product_id] || 0) + 1
      })

    // Convertir mapas a arrays ordenados
    const topSearches = Object.entries(searchMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }))

    const topProducts = Object.entries(clickMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => {
        const p = products.find(prod => prod.id === id)
        return { name: p ? p.nombre : 'Producto Eliminado', count }
      })

    setStats({
      totalProducts: products?.length || 0,
      totalInteractions: events?.length || 0,
      topSearches,
      topProducts
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado con botón de volver */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 bg-white rounded-lg border hover:bg-gray-100 transition-colors">
            ← Volver
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Métricas y Análisis 📊</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Calculando datos... ⏳</div>
        ) : (
          <div className="space-y-8">
            
            {/* TARJETAS KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Total Productos" value={stats.totalProducts} color="blue" />
              <StatCard title="Total Eventos" value={stats.totalInteractions} color="purple" />
              <StatCard title="Términos Buscados" value={stats.topSearches.length} color="orange" />
              <StatCard title="Prod. Clickeados" value={stats.topProducts.length} color="green" />
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lo más buscado */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold text-lg mb-4 text-gray-700">🔍 Lo más buscado</h3>
                {stats.topSearches.length === 0 ? <p className="text-sm text-gray-400">Sin datos aún.</p> : (
                  <div className="space-y-3">
                    {stats.topSearches.map((s, i) => (
                      <Barra key={i} label={s.term} count={s.count} max={stats.topSearches[0].count} color="bg-orange-400" />
                    ))}
                  </div>
                )}
              </div>

              {/* Lo más visto */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold text-lg mb-4 text-gray-700">⭐ Productos Estrella (Clicks)</h3>
                {stats.topProducts.length === 0 ? <p className="text-sm text-gray-400">Sin datos aún.</p> : (
                  <div className="space-y-3">
                    {stats.topProducts.map((p, i) => (
                      <Barra key={i} label={p.name} count={p.count} max={stats.topProducts[0].count} color="bg-blue-500" />
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

// Componentes visuales simples
function StatCard({ title, value, color }: any) {
  const colors: any = { blue: 'text-blue-600', purple: 'text-purple-600', orange: 'text-orange-600', green: 'text-emerald-600' }
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
      <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs text-gray-500 font-bold uppercase mt-1">{title}</div>
    </div>
  )
}

function Barra({ label, count, max, color }: any) {
  const percent = Math.max((count / max) * 100, 10)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium capitalize">{label}</span>
        <span className="font-bold">{count}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  )
}