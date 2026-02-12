import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create standard supabase client for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 1. Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 2. Proteccioón de rutas (Route Guard)
    const url = request.nextUrl.clone()

    // Rutas que requieren estar logueado
    // (admin, super-admin)
    if (!user) {
        if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/super-admin')) {
            url.pathname = '/login'
            // Guardar a donde quería ir para redirigirlo despues
            url.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }
    } else {
        // Si YA está logueado y trata de ir al Login, mandarlo a su dashboard
        if (url.pathname === '/login') {
            // Opcional: Podríamos verificar el rol aquí para redirigir mejor, 
            // pero para no hacer queries extra, lo mandamos al admin por defecto o home.
            // Dejaremos que la página de login maneje la redirección inteligente si el usuario
            // insiste en entrar, o simplemente lo redirigimos al home.
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
