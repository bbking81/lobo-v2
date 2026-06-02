import { getApiData } from '@/lib/api'

const ORDEN: Record<string, number> = { Arquero: 1, Defensor: 2, Lateral: 3, Mediocampista: 4, Volante: 5, Extremo: 6, Delantero: 7 }
function ordenPos(pos: string | null) {
  if (!pos) return 99
  for (const [k, v] of Object.entries(ORDEN)) if (pos.toLowerCase().includes(k.toLowerCase())) return v
  return 50
}

export default async function JugadoresRivalesPage() {
  const data = await getApiData()
  const jugadores = data.jugadoresRivales
    .filter(j => j.apellido && j.pj > 0)
    .sort((a, b) => ordenPos(a.posicion) - ordenPos(b.posicion) || b.pj - a.pj)

  const grupos = new Map<string, typeof jugadores>()
  for (const j of jugadores) {
    const pos = j.posicion ?? 'Sin posición'
    if (!grupos.has(pos)) grupos.set(pos, [])
    grupos.get(pos)!.push(j)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-3">
        {Array.from(grupos.entries()).map(([pos, lista]) => (
          <div key={pos} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-[#1a2e4a]">
              <span className="text-xs font-black text-white uppercase tracking-widest">{pos}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {lista.map(j => (
                <div key={j.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{j.apellido}, {j.nombres}</p>
                    {j.equipo && <p className="text-xs text-gray-400 truncate">{j.equipo}</p>}
                  </div>
                  <div className="text-right shrink-0 text-xs text-gray-500">
                    <p className="font-bold">{j.pj} PJ</p>
                    {j.goles > 0 && <p className="text-green-600 font-bold">{j.goles} ⚽</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
