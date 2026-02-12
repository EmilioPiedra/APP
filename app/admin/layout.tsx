import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Verificar Sesión
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Verificar Rol en Base de Datos
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 3. Reglas de Acceso
  if (profile) {
    if (profile.role === 'customer') {
        // Clientes NO entran aquí -> Al Home
        redirect('/')
    }
    // Owners y Admins pasan
  } else {
    // Si no tiene perfil, algo raro pasa -> Login
    redirect('/login')
  }
  
  return <>{children}</>
}
