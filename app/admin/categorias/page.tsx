'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  // Cargar categorías
  const fetchCats = async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
    if (data) setCategories(data)
  }
  useEffect(() => { fetchCats() }, [])

  // Crear nueva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const slug = nombre.toLowerCase().trim().replace(/ /g, '-')
    
    const { error } = await supabase.from('categories').insert([{ nombre, slug }])
    
    if (!error) {
      setNombre('')
      fetchCats()
    } else {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  // Borrar
  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCats()
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
              className="border p-2 rounded flex-1" 
              placeholder="Ej: Fertilizantes" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              required
            />
            <button disabled={loading} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
              {loading ? '...' : '+'}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-bold mb-4">Existentes ({categories.length})</h2>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border-b">
                <span>{cat.nombre}</span>
                <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700">🗑️</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}