import { getApiData } from '@/lib/api'

export default async function EstadiosPage() {
  const data = await getApiData()
  const estadios = data.estadios
    .filter(e => e.nombre && e.pj > 0)
    .sort((a, b) => b.pj - a.pj)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e4a]">
            <span className="text-xs font-black text-white uppercase tracking-widest">Estadios</span>
            <span className="ml-auto text-xs text-blue-300">{estadios.length} estadios</span>
          </div>
          <div className="divide-y divide-gray-50">
            {estadios.map(e => {
              const pct = e.pj > 0 ? Math.round((e.pg / e.pj) * 100) : 0
              const ubicacion = [e.ciudad, e.provincia, e.pais].filter(Boolean).join(', ')
              return (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{e.nombre}</p>
                    {ubicacion && <p className="text-xs text-gray-400">{ubicacion}</p>}
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="h-1.5 rounded-full bg-gray-100 w-20 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400">{pct}% V</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-700">{e.pj} PJ</p>
                    <p className="text-xs text-gray-400">
                      <span className="text-green-600 font-bold">{e.pg}</span>
                      {' '}<span className="text-orange-500 font-bold">{e.pe}</span>
                      {' '}<span className="text-red-500 font-bold">{e.pp}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
