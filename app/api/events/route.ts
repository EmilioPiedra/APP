import { supabase } from '@/lib/supabaseClient' // <--- IMPORTANTE: Usar la compartida
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Insertar evento
    const { error } = await supabase.from('events').insert({
      type: body.type,       // 'click', 'search', etc.
      product_id: body.product_id || null,
      session_id: body.session_id,
      query: body.query || null // Guardar lo que escribió el usuario
    })

    if (error) {
      console.error('Error Supabase:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}