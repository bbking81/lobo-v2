import { getApiData, torneoToSlug } from '@/lib/api'
import Link from 'next/link'

interface TorneoResumen {
  nombre: string
  slug: string
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  ultimaFecha: string
}

export default async function CompetenciasPage() {
  const data = await getApiData()

  const partidos = data.partidos.filter(p => p.publicado)

  // Agrupar por torneo
  const mapaT = new Map<string, TorneoResumen>()
  for (const p of partidos) {
    const nombre = p.torneo?.trim() ?? 'Sin torneo'
    if (!mapaT.has(nombre)) {
      mapaT.set(nombre, { nombre, slug: torneoToSlug(nombre), pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, ultimaFecha: p.fecha })
    }
    const t = mapaT.get(nombre)!
    t.pj++
    t.gf += p.gecGF
    t.gc += p.gecGC
    if (p.gecGF > p.gecGC) t.pg++
    else if (p.gecGF === p.gecGC) t.pe++
    else t.pp++
    if (p.fecha > t.ultimaFecha) t.ultimaFecha = p.fecha
  }

  // Ordenar por fecha descendente
  const torneos = Array.from(mapaT.values()).sort((a, b) => b.ultimaFecha.localeCompare(a.ultimaFecha))

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">
        {/* Banner */}
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1a2e4a 0%, #1e3a5f 100%)' }}>
          <svg className="text-blue-300 shrink-0" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          <div>
            <h1 className="text-white text-2xl font-black leading-tight">Competencias</h1>
            <p className="text-blue-300 text-sm mt-0.5 font-medium">Torneos y competencias oficiales</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Cabecera tabla */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
            <span>Torneo</span>
            <span className="text-center w-7">PJ</span>
            <span className="text-center w-7">PG</span>
            <span className="text-center w-7">PE</span>
            <span className="text-center w-7">PP</span>
            <span className="text-center w-12">GF-GC</span>
          </div>

          <div className="divide-y divide-gray-50">
            {torneos.map(t => (
              <Link
                key={t.nombre}
                href={`/competencias/${t.slug}`}
                className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.nombre}</p>
                </div>
                <span className="text-sm tabular-nums text-gray-600 text-center w-7">{t.pj}</span>
                <span className="text-sm tabular-nums text-green-700 font-bold text-center w-7">{t.pg}</span>
                <span className="text-sm tabular-nums text-yellow-600 font-bold text-center w-7">{t.pe}</span>
                <span className="text-sm tabular-nums text-red-600 font-bold text-center w-7">{t.pp}</span>
                <span className="text-sm tabular-nums text-gray-500 text-center w-12">{t.gf}-{t.gc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
