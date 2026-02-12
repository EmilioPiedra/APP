'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function createStoreAndUser(formData: {
    nombre: string
    slug: string
    owner_email: string
}) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    // NECESITA LA CLAVE DE SERVICIO (SERVICE_ROLE) PARA CREAR USUARIOS
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseServiceKey) {
        return {
            success: false,
            message: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en .env.local para crear usuarios automáticos.',
        }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })

    try {
        // 1. Crear (o buscar) el Usuario
        // Intentamos crear el usuario con una contraseña temporal
        const tempPassword = 'temp-password-' + Math.random().toString(36).slice(-8)

        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: formData.owner_email,
            password: tempPassword,
            email_confirm: true, // Confirmamos el email automáticamente
            user_metadata: {
                role: 'owner', // Asignamos rol inicial
            }
        })

        let userId = userData.user?.id

        // Si ya existe, buscamos su ID (El error suele ser "User already registered")
        if (userError) {
            // Si el error es que ya existe, intentamos buscarlo (aunque admin.createUser debería devolver el user si existe? No, tira error)
            // Buscamos por email
            const { data: existingUser } = await supabaseAdmin.rpc('get_user_id_by_email', { email: formData.owner_email })
            // Nota: RPC requires a custom function. 
            // Alternativa: List users (limitado) o asumir que el Super Admin debe gestionar eso.
            // Simplificación: Si falla, asumimos que existe y avisamos, o continuamos creando solo la tienda si podemos sacar el ID.
            // PERO sin el ID, no podemos linkear.

            // Mejor estrategia: Intentar obtener usuario por email usando admin.listUsers
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
            const found = listData.users.find(u => u.email === formData.owner_email)
            if (found) {
                userId = found.id
            } else {
                return { success: false, message: 'El usuario ya existe o hubo un error: ' + userError.message }
            }
        }

        if (!userId) return { success: false, message: 'No se pudo obtener el ID del usuario.' }

        // 2. Crear la Tienda
        const { data: storeData, error: storeError } = await supabaseAdmin
            .from('stores')
            .insert({
                nombre: formData.nombre,
                slug: formData.slug,
                owner_email: formData.owner_email,
                owner_id: userId, // Linkeamos al dueño
                activo: true
            })
            .select()
            .single()

        if (storeError) throw storeError

        // 3. Actualizar el Perfil del Usuario (Store ID y Rol)
        // El trigger de creación de usuario ya debió crear el perfil. Lo actualizamos.
        await supabaseAdmin
            .from('profiles')
            .update({
                store_id: storeData.id,
                role: 'owner'
            })
            .eq('id', userId)

        revalidatePath('/super-admin/tiendas')
        return { success: true, message: `Tienda creada. Usuario: ${formData.owner_email} (Pass: ${tempPassword})` }

    } catch (error: any) {
        console.error('Error creating store/user:', error)
        return { success: false, message: error.message }
    }
}
