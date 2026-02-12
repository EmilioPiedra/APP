'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // 1. Validaciones Locales
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' })
      return
    }

    if (formData.password.length < 6) {
      setMessage({ text: 'La contraseña debe tener al menos 6 caracteres', type: 'error' })
      return
    }

    setLoading(true)

    try {
      // 2. Verificar si el email está autorizado (Tiene tienda asignada)
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, nombre')
        .eq('owner_email', formData.email)
        .single()

      if (!store || storeError) {
        throw new Error('Este correo no tiene ninguna tienda asignada. Contacta al Super Admin.')
      }

      // 3. Crear Usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            store_id: store.id // Guardamos el store_id en los metadatos
          }
        }
      })

      if (authError) throw authError

      // 4. Crear Profile (Si no existe trigger, lo hacemos manual por seguridad)
      // Nota: Idealmente esto se hace con un Trigger en Postgres
      if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: formData.email,
                role: 'owner',
                store_id: store.id
            })
            .select()
        
        if (profileError && !profileError.message.includes('duplicate key')) {
             // Ignoramos error de duplicado por si ya existía
             console.error('Error creando perfil:', profileError)
        }

        // 5. Actualizar Store con owner_id
        await supabase
            .from('stores')
            .update({ owner_id: authData.user.id })
            .eq('id', store.id)
      }

      setMessage({ text: '¡Cuenta creada! Redirigiendo...', type: 'success' })
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900">Activa tu Cuenta 🚀</h1>
            <p className="text-gray-500 mt-2">Ingresa el correo autorizado por el administrador</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 text-center text-sm font-medium ${
            message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tu Correo Institucional</label>
            <input 
              type="email" required
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="nombre@ejemplo.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña Nueva</label>
            <input 
              type="password" required
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar Contraseña</label>
            <input 
              type="password" required
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando y Creando...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="text-center mt-6">
            <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600 font-medium">
                ¿Ya tienes cuenta? Inicia Sesión
            </Link>
        </div>

      </div>
    </div>
  )
}
