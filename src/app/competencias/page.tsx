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
      <div className="max-w-2xl mx-auto px-3 py-4">
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
