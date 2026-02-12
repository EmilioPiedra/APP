'use client'

export default function SuperAdminConfig() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Configuración del Sistema ⚙️</h1>
      <p className="text-slate-400 mb-8">Ajustes globales de la plataforma.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA 1: ESTADO DEL SISTEMA */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-4">Estado del Sistema</h2>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-lg">
                    <span className="text-slate-400">Versión Actual</span>
                    <span className="text-white font-mono font-bold">v1.0.0</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-lg">
                    <span className="text-slate-400">Modo Mantenimiento</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" disabled />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
            </div>
        </div>

        {/* TARJETA 2: VARIABLES DE ENTORNO */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 opacity-50">
            <h2 className="text-xl font-bold text-white mb-4">Variables (Solo Lectura)</h2>
            <p className="text-sm text-yellow-500 mb-4">⚠️ Estas configuraciones se manejan desde el archivo .env</p>
            
            <div className="space-y-2 font-mono text-xs text-slate-500">
                <p>NEXT_PUBLIC_SUPABASE_URL: ********</p>
                <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: ********</p>
            </div>
        </div>

      </div>
    </div>
  )
}
