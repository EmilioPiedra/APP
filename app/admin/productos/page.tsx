'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Product } from '@/types/product'

export default function ProductsTablePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // 🔍 ESTADOS PARA LOS FILTROS
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todas')

  // 1. Cargar productos al entrar
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setProducts(data as Product[])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // 2. Lógica de Filtrado (La Magia ✨)
  const filteredProducts = products.filter(product => {
    // A. Coincidencia de Nombre (Ignora mayúsculas)
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    
    // B. Coincidencia de Categoría
    const matchesCategory = filterCategory === 'Todas' || product.categoria === filterCategory

    return matchesSearch && matchesCategory
  })

  // Obtener categorías únicas dinámicamente para el select
  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.categoria || 'General')))]

  // 3. Funciones de Acción (Borrar y Estado)
  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar producto?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) setProducts(products.filter(p => p.id !== id))
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    setProducts(products.map(p => p.id === id ? { ...p, estado: newStatus } : p))
    await supabase.from('products').update({ estado: newStatus }).eq('id', id)
  }

  if (loading) return <div className="p-10 text-center">Cargando inventario... ⏳</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inventario 📋</h1>
            <p className="text-gray-500 text-sm mt-1">
              Viendo {filteredProducts.length} de {products.length} productos
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-4 py-2 border rounded-lg hover:bg-white transition-colors">
              ← Panel
            </Link>
            <Link href="/admin/productos/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2">
              <span>+</span> Nuevo
            </Link>
          </div>
        </div>

        {/* 🛠️ BARRA DE HERRAMIENTAS (FILTROS) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4">
            
            {/* Buscador */}
            <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="Buscar por nombre..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Selector de Categoría */}
            <div className="w-full md:w-64">
                <select 
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        
                        {/* Imagen y Nombre */}
                        <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border">
                            <img 
                                src={product.imagenes?.[0] || '/placeholder.png'} 
                                alt={product.nombre}
                                className="w-full h-full object-cover"
                            />
                            </div>
                            <div className="font-semibold text-gray-900">{product.nombre}</div>
                        </div>
                        </td>

                        {/* Categoría */}
                        <td className="p-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                            {product.categoria || 'General'}
                        </span>
                        </td>

                        {/* Precio */}
                        <td className="p-4 font-mono font-medium text-gray-700">
                        ${product.precio?.toFixed(2)}
                        </td>

                        {/* Estado Switch */}
                        <td className="p-4 text-center">
                        <button 
                            onClick={() => handleToggleStatus(product.id, product.estado)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.estado ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            product.estado ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                        </td>

                        {/* Acciones */}
                        <td className="p-4 text-right">
                        <button 
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            🗑️
                        </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="p-10 text-center text-gray-500">
                            No se encontraron productos con "{searchTerm}" en {filterCategory}. 🦗
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}