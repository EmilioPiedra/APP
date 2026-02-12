'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Datos básicos
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  // 👇 DATOS DE PROMOCIÓN
  const [enOferta, setEnOferta] = useState(false)
  const [precioOferta, setPrecioOferta] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!file) throw new Error('Falta la imagen')
      
      // 1. Subir Imagen
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)

      // 2. Crear Slug
      const slug = nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4)

      // 3. Guardar con Oferta
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          nombre, slug, descripcion, categoria,
          precio: parseFloat(precio),
          imagenes: [publicUrl],
          estado: true,
          // Guardamos los datos de oferta
          en_oferta: enOferta,
          precio_oferta: enOferta ? parseFloat(precioOferta) : null
        }])

      if (insertError) throw insertError
      router.push('/admin/productos') // Volver al inventario

    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-6">
        <Link 
          href="/admin/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <span>←</span> Volver al Inventario
        </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Nuevo Producto 📦</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
            <input required type="text" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Fertilizante Premium" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Precio Original */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Precio Normal ($)</label>
              <input required type="number" step="0.01" className="w-full border p-3 rounded-lg"
                value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0.00" />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
              <input list="cats" className="w-full border p-3 rounded-lg" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Seleccionar..." />
              <datalist id="cats"><option value="Herramientas"/><option value="Semillas"/><option value="Fertilizantes"/></datalist>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
            <textarea required rows={3} className="w-full border p-3 rounded-lg"
              value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Foto</label>
            <input required type="file" accept="image/*" className="w-full border p-2 rounded-lg bg-gray-50"
              onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>

          {/* SECCIÓN DE OFERTA (Implementada) */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <label className="flex items-center gap-2 font-bold text-orange-800 mb-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-orange-600"
                checked={enOferta}
                onChange={e => setEnOferta(e.target.checked)}
              />
              ¿Este producto está en oferta?
            </label>
            
            {enOferta && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Precio de Oferta ($)</label>
                <input 
                  required={enOferta}
                  type="number" 
                  step="0.01" 
                  className="w-full border border-orange-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={precioOferta} 
                  onChange={e => setPrecioOferta(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg transition-all hover:scale-[1.01]">
            {loading ? 'Guardando...' : 'Publicar Producto'}
          </button>
        </form>
      </div>
    </div>
  )
}