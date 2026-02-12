'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

// Definimos el tipo para que TypeScript esté feliz
interface Category {
  id: string
  nombre: string
  slug: string
  created_at?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  // Movemos la función DENTRO del efecto para cumplir las reglas de React
  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setCategories(data as Category[])
    }
    fetchCats()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const slug = nombre.toLowerCase().trim().replace(/ /g, '-')
    
    const { error } = await supabase.from('categories').insert([{ nombre, slug }])
    
    if (!error) {
      setNombre('')
      // Recargar lista manualmente
      const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
      if (data) setCategories(data as Category[])
    } else {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar esta categoría?')) return
    
    const { error } = await supabase.from('categories').delete().eq('id', id)
    
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id))
    } else {
      alert('Error al borrar: ' + error.message)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/admin" className="text-gray-500 mb-4 inline-block">← Volver al Panel</Link>
      <h1 className="text-3xl font-bold mb-8">Gestión de Categorías 🏷️</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-bold mb-4">Nueva Categoría</h2>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              className="border p-2 rounded flex-1 outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Ej: Fertilizantes" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              required
            />
            <button disabled={loading} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? '...' : '+'}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-bold mb-4">Existentes ({categories.length})</h2>
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {categories.map(cat => (
              <li key={cat.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border-b last:border-0">
                <span className="font-medium text-gray-700">{cat.nombre}</span>
                <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">🗑️</button>
              </li>
            ))}
            {categories.length === 0 && <li className="text-gray-400 text-sm text-center">Sin categorías.</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}