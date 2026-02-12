import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Este es un Server Component ahora
export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Verificar Rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super-admin') {
    return redirect('/') // O a una página de 403
  }

  // Si llega aquí, es Super Admin
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* SIDEBAR SIMPLE */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col p-6">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-10">
          Super Admin
        </div>
        <nav className="space-y-2">
          <Link href="/super-admin/tiendas" className="block px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
            🏢 Tiendas
          </Link>
          <Link href="/super-admin/usuarios" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            👥 Usuarios
          </Link>
          <Link href="/super-admin/config" className="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            ⚙️ Configuración
          </Link>
          
          <form action="/auth/signout" method="post">
            <button 
              className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors flex items-center gap-2 mt-4"
              type="submit" // Need to implement signout route or make button client side component just for signout
            >
              🚪 Cerrar Sesión
            </button>
          </form>
        </nav>
        <p className="text-xs text-white truncate font-mono bg-slate-950 p-2 rounded">
          {user.email}
        </p>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}