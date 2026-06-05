import { getApiData, torneoToSlug } from '@/lib/api'
import SecBanner from '@/components/SecBanner'
import ListaCompetencias, { type TorneoResumen } from '@/components/ListaCompetencias'

function inferirTipo(nombre: string): string {
  const n = nombre.toLowerCase()
  if (n.includes('copa')) return 'Copa'
  if (n.includes('liga')) return 'Liga'
  if (n.includes('regional')) return 'Regional'
  if (n.includes('reducido')) return 'Reducido'
  if (n.includes('playoff') || n.includes('play off')) return 'Playoff'
  if (n.includes('amistoso')) return 'Amistoso'
  if (n.includes('federal') || n.includes('argentino') || n.includes('torneo') || n.includes('primera') || n.includes('nacional')) return 'Torneo'
  return 'Otro'
}

export default async function CompetenciasPage() {
  const data = await getApiData()
  const partidos = data.partidos.filter(p => p.publicado)

  const mapaT = new Map<string, TorneoResumen>()
  for (const p of partidos) {
    const nombre = p.torneo?.trim() ?? 'Sin torneo'
    if (!mapaT.has(nombre)) {
      mapaT.set(nombre, { nombre, slug: torneoToSlug(nombre), tipo: inferirTipo(nombre), pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, ultimaFecha: p.fecha })
    }
    const t = mapaT.get(nombre)!
    t.pj++; t.gf += p.gecGF; t.gc += p.gecGC
    if (p.gecGF > p.gecGC) t.pg++
    else if (p.gecGF === p.gecGC) t.pe++
    else t.pp++
    if (p.fecha > t.ultimaFecha) t.ultimaFecha = p.fecha
  }

  const torneos = Array.from(mapaT.values()).sort((a, b) => b.ultimaFecha.localeCompare(a.ultimaFecha))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5">
        <SecBanner
          title="Competencias"
          subtitle="Historial de torneos y competencias del club"
          icon={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>}
        />

        <ListaCompetencias torneos={torneos} />
      </div>
    </main>
  )
}
