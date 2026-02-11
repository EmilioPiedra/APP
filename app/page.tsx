import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-2xl text-center space-y-8">
        
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Tu Tienda SaaS
        </h1>
        
        <p className="text-xl text-slate-400">
          La plataforma para crear tu e-commerce en segundos.
        </p>

        <div className="flex gap-4 justify-center">
          <Link 
            href="/login" 
            className="bg-white text-slate-950 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/agro-gonzanama" 
            className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-500 transition-colors"
          >
            Ver Demo Tienda
          </Link>
        </div>

      </div>
    </div>
  )
}