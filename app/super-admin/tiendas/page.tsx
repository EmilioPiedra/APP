'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function SuperAdminStores() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    owner_email: ''
  })

  // 1. Cargar tiendas al entrar
  const fetchStores = async () => {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setStores(data)
  }

  useEffect(() => { fetchStores() }, [])

  // 2. Generar Slug automático al escribir el nombre
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '') // Quitar caracteres raros
      .replace(/[\s_-]+/g, '-') // Espacios a guiones
      .replace(/^-+|-+$/g, '')
    
    setFormData({ ...formData, nombre: name, slug })
  }

  // 3. Crear la Tienda en Base de Datos
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('stores').insert({
        nombre: formData.nombre,
        slug: formData.slug,
        owner_email: formData.owner_email,
        activo: true
      })

      if (error) throw error

      alert('✅ Tienda creada correctamente')
      setFormData({ nombre: '', slug: '', owner_email: '' })
      fetchStores() // Recargar lista

    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 4. Borrar Tienda (Cuidado con esto en prod)
  const handleDelete = async (id: string) => {
    if(!confirm('¿ESTÁS SEGURO? Esto borrará la tienda y sus productos.')) return;
    
    const { error } = await supabase.from('stores').delete().eq('id', id)
    if (!error) fetchStores()
    else alert(error.message)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Super Admin ⚡
            </h1>
            <p className="text-slate-500 mt-2">Gestión Central de Tenants (Tiendas)</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{stores.length}</div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Tiendas Activas</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 👈 COLUMNA IZQ: FORMULARIO */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="bg-emerald-500 w-2 h-6 rounded-full inline-block"></span>
              Nueva Tienda
            </h2>
            
            <form onSubmit={handleCreateStore} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Comercial</label>
                <input 
                  type="text" required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                  placeholder="Ej: Agro Loja"
                  value={formData.nombre}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">URL Slug (Automático)</label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3">
                  <span className="text-slate-500 select-none">/</span>
                  <input 
                    type="text" required
                    className="w-full bg-transparent p-3 text-emerald-400 font-mono outline-none"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email del Dueño</label>
                <input 
                  type="email" required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                  placeholder="cliente@gmail.com"
                  value={formData.owner_email}
                  onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                />
                <p className="text-[10px] text-slate-500 mt-1">Este email se usará para enlazar la cuenta cuando se registre.</p>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95"
              >
                {loading ? 'Procesando...' : '🚀 Crear Tenant'}
              </button>
            </form>
          </div>

          {/* 👉 COLUMNA DER: LISTA DE TIENDAS */}
          <div className="lg:col-span-2 space-y-4">
            {stores.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                    <p className="text-slate-600">No hay tiendas creadas aún.</p>
                </div>
            ) : (
                stores.map((store) => (
                    <div key={store.id} className="group bg-slate-900 hover:bg-slate-800 p-5 rounded-xl border border-slate-800 hover:border-slate-600 transition-all flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${store.activo ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                                {store.nombre.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
                                    {store.nombre}
                                </h3>
                                <div className="flex gap-3 text-sm text-slate-400">
                                    <span className="font-mono">/{store.slug}</span>
                                    <span>•</span>
                                    <span>{store.owner_email || 'Sin email'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Indicador de Estado */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${store.activo ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {store.activo ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                            
                            <button 
                                onClick={() => handleDelete(store.id)}
                                className="p-2 hover:bg-red-500/20 text-slate-600 hover:text-red-500 rounded-lg transition-colors"
                                title="Eliminar Tienda"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}