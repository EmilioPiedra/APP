'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

// ⚠️ PON AQUÍ TU EMAIL REAL EXACTO
const SUPER_ADMIN_EMAILS = ['admin@tienda.com']

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // 1. ¿Hay usuario logueado?
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // No está logueado -> Al Login
        router.push('/login?redirect=/super-admin/tiendas')
        return
      }

      // 2. ¿Es el Jefe Supremo?
      // Verificamos si su email está en la lista VIP
      if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
        setAuthorized(true)
      } else {
        // Es un usuario normal intentando entrar al área prohibida
        alert('⛔ ACCESO DENEGADO: Área restringida.')
        router.push('/') // Lo mandamos a la calle (Home)
      }
      setChecking(false)
    }

    checkAuth()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400 font-mono gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        <p>Verificando Credenciales...</p>
      </div>
    )
  }

  // Si pasa, mostramos el contenido con un menú lateral (Sidebar)
  return authorized ? (
    <div className="flex min-h-screen bg-slate-950">
      {/* SIDEBAR SIMPLE */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col p-6">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-10">
          Super Admin
        </div>
        <nav className="space-y-2">
          <a href="/super-admin/tiendas" className="block px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
            🏢 Tiendas
          </a>
          <a href="/super-admin/usuarios" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            👥 Usuarios
          </a>
          <a href="/super-admin/config" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            ⚙️ Configuración
          </a>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-800">
           <p className="text-xs text-slate-500 mb-2">Logueado como:</p>
           <p className="text-xs text-white truncate font-mono bg-slate-950 p-2 rounded">
             {SUPER_ADMIN_EMAILS[0]}
           </p>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  ) : null
}