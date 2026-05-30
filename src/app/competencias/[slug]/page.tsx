import { notFound } from 'next/navigation'
import { getApiData, slugToTorneo } from '@/lib/api'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Partido } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `${slugToTorneo(slug)} | Lobo Entrerriano` }
}

function calcularResultado(gecGF: number, gecGC: number) {
  if (gecGF > gecGC) return 'V'
  if (gecGF === gecGC) return 'E'
  return 'D'
}

const colorRes: Record<string, string> = {
  V: 'bg-green-600',
  E: 'bg-yellow-500',
  D: 'bg-red-600',
}

export default async function CompetenciaDetallePage({ params }: Props) {
  const { slug } = await params
  const torneo = slugToTorneo(slug)
  const data = await getApiData()

  const partidos = data.partidos
    .filter(p => p.publicado && p.torneo?.trim() === torneo)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  if (partidos.length === 0) notFound()

  // Stats globales
  let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0
  for (const p of partidos) {
    gf += p.gecGF; gc += p.gecGC
    if (p.gecGF > p.gecGC) pg++
    else if (p.gecGF === p.gecGC) pe++
    else pp++
  }
  const pj = partidos.length
  const pts = pg * 3 + pe

  // Tabla de posiciones (desde competencias estructuradas)
  const competencia = data.competencias?.find(c =>
    c.nombre?.trim() === torneo || partidos.some(p => (p as { competenciaId?: number }).competenciaId === c.id)
  )

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-[#1e3a5f] text-white px-4 py-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/escudo-gec" alt="GEC" className="h-10 w-10 object-contain" />
        <div>
          <Link href="/" className="font-black text-lg leading-tight hover:text-blue-200 transition-colors">
            Lobo Entrerriano
          </Link>
          <p className="text-blue-200 text-xs">
            <Link href="/competencias" className="hover:text-white">Competencias</Link>
            {' › '}{torneo}
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">

        {/* Stats GEC en esta competencia */}
        <div className="bg-[#1e3a5f] rounded-lg text-white overflow-hidden">
          <div className="text-center py-2 text-xs text-blue-200 uppercase tracking-widest border-b border-blue-800">
            {torneo}
          </div>
          <div className="grid grid-cols-5 divide-x divide-blue-800 py-4">
            {[
              { label: 'PJ', val: pj },
              { label: 'PG', val: pg },
              { label: 'PE', val: pe },
              { label: 'PP', val: pp },
              { label: 'Pts', val: pts },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-black">{s.val}</span>
                <span className="text-xs text-blue-300 uppercase">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 pb-3 text-sm text-blue-200">
            <span>{gf} goles a favor</span>
            <span>·</span>
            <span>{gc} goles en contra</span>
          </div>
        </div>

        {/* Tabla de posiciones (si existe) */}
        {competencia?.tablaPosiciones?.map((tabla: {
          nombre: string
          filas: { equipo: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }[]
        }) => (
          <div key={tabla.nombre} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-3 border-b border-gray-100">
              {tabla.nombre || 'Tabla de posiciones'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left px-4 py-2 font-bold uppercase tracking-wide">Equipo</th>
                    <th className="text-center px-2 py-2 w-8">PJ</th>
                    <th className="text-center px-2 py-2 w-8">PG</th>
                    <th className="text-center px-2 py-2 w-8">PE</th>
                    <th className="text-center px-2 py-2 w-8">PP</th>
                    <th className="text-center px-2 py-2 w-8">GF</th>
                    <th className="text-center px-2 py-2 w-8">GC</th>
                    <th className="text-center px-2 py-2 w-10 font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tabla.filas
                    .sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc))
                    .map((fila, i) => {
                      const esGec = fila.equipo.toLowerCase().includes('gimnasia') &&
                        !fila.equipo.toLowerCase().includes('chivilcoy')
                      return (
                        <tr key={i} className={esGec ? 'bg-blue-50 font-bold' : ''}>
                          <td className="px-4 py-2 text-gray-800">{fila.equipo}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-gray-600">{fila.pj}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-green-700">{fila.pg}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-yellow-600">{fila.pe}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-red-600">{fila.pp}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-gray-600">{fila.gf}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-gray-600">{fila.gc}</td>
                          <td className="text-center px-2 py-2 tabular-nums font-black text-gray-800">{fila.pts}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Lista de partidos */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-3 border-b border-gray-100">
            Partidos ({pj})
          </h2>
          <div className="divide-y divide-gray-50">
            {partidos.map(p => <PartidoFila key={p.id} partido={p} />)}
          </div>
        </div>

      </div>
    </main>
  )
}

function PartidoFila({ partido: p }: { partido: Partido }) {
  const gecLocal = p.local.toLowerCase().includes('gimnasia') &&
    !p.local.toLowerCase().includes('chivilcoy') &&
    !p.local.toLowerCase().includes('gualeguay')
  const rival = gecLocal ? p.visitante : p.local
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const res = calcularResultado(p.gecGF, p.gecGC)

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Link href={`/partido/partido-${p.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">vs {rival}</p>
        <p className="text-xs text-gray-400">{fecha} · {gecLocal ? 'Local' : 'Visitante'}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-black tabular-nums text-gray-700">{golesGec}-{golesRival}</span>
        <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded text-white ${colorRes[res]}`}>
          {res}
        </span>
      </div>
    </Link>
  )
}
