'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SuperAdminUsuarios() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Pedimos perfiles y la tienda asociada (si tienen)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          stores ( nombre, slug )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
      const confirmChange = confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)
      if (!confirmChange) return

      try {
          const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

          if (error) throw error
          
          alert('Rol actualizado correctamente')
          fetchUsers() // Recargar lista
      } catch (err: any) {
          console.error(err)
          alert('Error actualizando rol: ' + err.message)
      }
  }

  if (loading) return <div className="p-10 text-emerald-400">Cargando usuarios...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios 👥</h1>
      <p className="text-slate-400 mb-8">Listado global de cuentas registradas en el sistema.</p>

      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Email / ID</th>
                <th className="p-4 font-medium">Rol</th>
                <th className="p-4 font-medium">Tienda Asignada</th>
                <th className="p-4 font-medium">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-white">{user.email || 'Sin Email'}</div>
                    <div className="text-xs text-slate-600 font-mono mt-1 group-hover:text-slate-500 transition-colors">
                      {user.id}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-bold uppercase border bg-slate-900 outline-none cursor-pointer ${
                            user.role === 'super-admin' ? 'text-purple-400 border-purple-500/50' :
                            user.role === 'owner' ? 'text-blue-400 border-blue-500/50' :
                            user.role === 'customer' ? 'text-slate-400 border-slate-600' :
                            'text-cyan-400 border-cyan-500/50'
                        }`}
                    >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner (Dueño)</option>
                        <option value="admin">Admin (Empleado)</option>
                        <option value="super-admin">Super Admin</option>
                    </select>
                  </td>

                  <td className="p-4">
                    {user.stores ? (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span>🏢</span>
                        <span className="font-medium">{user.stores.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-sm italic">-- Sin Tienda --</span>
                    )}
                  </td>

                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
            <div className="p-10 text-center text-slate-500">
                No hay usuarios registrados aún.
            </div>
        )}
      </div>
    </div>
  )
}
