'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Verificar si hay usuario logueado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [])

  if (!user) return <div className="p-10 text-center">Cargando panel... ⏳</div>

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h1 className="text-4xl font-extrabold text-gray-800">Panel de Control 🛠️</h1>
            <p className="text-gray-500 mt-1">Bienvenido, {user.email}</p>
        </div>
        <button 
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-100"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* GRID DE BOTONES DE ACCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Nuevo Producto */}
        <Link 
          href="/admin/productos/new"
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-blue-200 flex flex-col items-center justify-center transition-all hover:-translate-y-1 group"
        >
          <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</span>
          <span className="font-bold text-lg">Nuevo Producto</span>
          <span className="text-blue-200 text-xs mt-1">Subir item individual</span>
        </Link>

        {/* 2. Ver Inventario */}
        <Link 
            href="/admin/productos"
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-emerald-200 flex flex-col items-center justify-center transition-all hover:-translate-y-1 group"
            >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</span>
            <span className="font-bold text-lg">Inventario</span>
            <span className="text-emerald-200 text-xs mt-1">Editar / Borrar / Filtrar</span>
        </Link>

        {/* 3. 🔥 NUEVO BOTÓN: CREAR EVENTO */}
        <Link 
            href="/admin/eventos" // <--- AQUÍ ESTÁ LA MAGIA
            className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-orange-200 flex flex-col items-center justify-center transition-all hover:-translate-y-1 group relative overflow-hidden"
            >
            {/* Efecto decorativo */}
            <div className="absolute top-0 right-0 bg-white/10 w-16 h-16 rounded-bl-full"></div>
            
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎉</span>
            <span className="font-bold text-lg">Crear Evento</span>
            <span className="text-orange-100 text-xs mt-1">Promociones masivas</span>
        </Link>

        {/* 4. Ver Métricas */}
        <Link 
            href="/admin/dashboard"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-purple-200 flex flex-col items-center justify-center transition-all hover:-translate-y-1 group"
            >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</span>
            <span className="font-bold text-lg">Métricas</span>
            <span className="text-purple-200 text-xs mt-1">Ver rendimiento</span>
        </Link>
      </div>

    </div>
  )
}