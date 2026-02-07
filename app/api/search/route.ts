import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 1. Capturamos los nuevos parámetros
    const query = searchParams.get('q') || ''
    const category = searchParams.get('cat')
    const minPrice = searchParams.get('min')
    const maxPrice = searchParams.get('max')

    console.log(`🔍 Filtros: Q="${query}", Cat="${category}", Precio=[${minPrice}-${maxPrice}]`)

    // 2. Construimos la consulta base
    let dbQuery = supabase
      .from('products')
      .select('*')
      .eq('estado', true) // Siempre solo activos

    // 3. APLICAMOS FILTROS DINÁMICAMENTE
    
    // A. Búsqueda por texto (si escribieron algo)
    if (query) {
      dbQuery = dbQuery.ilike('nombre', `%${query}%`)
    }

    // B. Filtro de Categoría
    if (category && category !== 'Todas') {
      dbQuery = dbQuery.eq('categoria', category)
    }

    // C. Filtro de Precio Mínimo
    if (minPrice) {
      dbQuery = dbQuery.gte('precio', parseFloat(minPrice)) // gte = Greater Than or Equal (Mayor o igual)
    }

    // D. Filtro de Precio Máximo
    if (maxPrice) {
      dbQuery = dbQuery.lte('precio', parseFloat(maxPrice)) // lte = Less Than or Equal (Menor o igual)
    }

    // Ejecutamos la consulta con límite
    const { data, error } = await dbQuery.limit(20)

    if (error) {
      console.error("❌ Error Supabase:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (err: any) {
    console.error("🔥 Error Servidor:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}