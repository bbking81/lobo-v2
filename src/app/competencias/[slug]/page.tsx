import { notFound } from 'next/navigation'
import { getApiData, slugToTorneo, fotoUrl } from '@/lib/api'
import Link from 'next/link'
import { DarkStatGrid, FichaPartidoLista, PartidosTitle } from '@/components/ficha'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `${slugToTorneo(slug)} | Lobo Entrerriano` }
}

interface PlantelRow { id?: number; nombre: string; foto: string | null; pj: number; goles: number; ta: number; tr: number }

export default async function CompetenciaDetallePage({ params }: Props) {
  const { slug } = await params
  const torneo = slugToTorneo(slug)
  const data = await getApiData()

  const partidos = data.partidos
    .filter(p => p.publicado && p.torneo?.trim() === torneo)
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

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

  // Plantel del Torneo (jugadores que efectivamente jugaron)
  const jugById = new Map(data.jugadores.map(j => [j.id, j]))
  const jugByNombre = new Map(data.jugadores.map(j => [j.nombre, j]))
  const plantelMap = new Map<string, PlantelRow>()
  for (const p of partidos) {
    for (const row of p.planillaGec ?? []) {
      if (!row.jugador) continue
      const jugo = row.titular === true || (row.titular === false && !!row.minE)
      if (!jugo) continue
      let ps = plantelMap.get(row.jugador)
      if (!ps) {
        const j = (row.jugador_id ? jugById.get(row.jugador_id) : undefined) ?? jugByNombre.get(row.jugador)
        ps = { id: j?.id ?? row.jugador_id, nombre: row.jugador, foto: fotoUrl(j?.foto), pj: 0, goles: 0, ta: 0, tr: 0 }
        plantelMap.set(row.jugador, ps)
      }
      ps.pj++
      let g = 0
      if (row.goles !== undefined && row.goles !== null) g = row.goles
      else if (row.minGoles) g = String(row.minGoles).trim().split(/\s+/).filter(Boolean).length
      ps.goles += g
      ps.ta += row.amarillas ?? 0
      ps.tr += row.rojas ?? 0
    }
  }
  const plantel = Array.from(plantelMap.values()).sort((a, b) => b.pj - a.pj || b.goles - a.goles)

  // Tabla de posiciones (desde competencias estructuradas)
  const competencia = data.competencias?.find(c =>
    c.nombre?.trim() === torneo || partidos.some(p => (p as { competenciaId?: number }).competenciaId === c.id)
  )

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 space-y-4">

        {/* Header + stats */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg,#1e2d42 0%,#0f1e35 100%)', padding: '22px 26px' }}>
            <span style={{ fontSize: '1.4rem' }}>🏆</span>
            <div>
              <div className="uppercase" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>Competencia</div>
              <h1 className="text-white font-extrabold" style={{ fontSize: '1.5rem', lineHeight: 1.15 }}>{torneo}</h1>
            </div>
          </div>

          <DarkStatGrid cols={4} items={[
            { num: pj, label: 'Jugados', color: '#fff', bg: '#1e2d42' },
            { num: pg, label: 'Ganados', color: '#4ade80', bg: '#14532d' },
            { num: pe, label: 'Empatados', color: '#fbbf24', bg: '#422006' },
            { num: pp, label: 'Perdidos', color: '#f87171', bg: '#450a0a' },
          ]} />

          <div className="flex items-center justify-center gap-6 flex-wrap text-[#475569]" style={{ padding: '14px 24px', fontSize: '0.85rem' }}>
            <span><b className="text-[#2563eb]">{gf}</b> goles a favor</span>
            <span>·</span>
            <span><b className="text-[#64748b]">{gc}</b> en contra</span>
            <span>·</span>
            <span><b className="text-[#1e293b]">{pts}</b> puntos</span>
          </div>
        </div>

        {/* Tabla de posiciones (si existe) */}
        {competencia?.tablaPosiciones?.map(tabla => (
          <div key={tabla.nombre} className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
            <PartidosTitle>{tabla.nombre || 'Tabla de posiciones'}</PartidosTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.85rem]">
                <thead style={{ background: '#162032' }}>
                  <tr className="text-white text-[0.7rem] font-bold uppercase tracking-[0.05em]">
                    <th className="text-left px-4 py-2.5">Equipo</th>
                    <th className="text-center px-2 py-2.5 w-9">PJ</th>
                    <th className="text-center px-2 py-2.5 w-9">PG</th>
                    <th className="text-center px-2 py-2.5 w-9">PE</th>
                    <th className="text-center px-2 py-2.5 w-9">PP</th>
                    <th className="text-center px-2 py-2.5 w-9">GF</th>
                    <th className="text-center px-2 py-2.5 w-9">GC</th>
                    <th className="text-center px-2 py-2.5 w-10">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.filas
                    .slice()
                    .sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc))
                    .map((fila, i) => {
                      const esGec = fila.equipo.toLowerCase().includes('gimnasia') &&
                        !fila.equipo.toLowerCase().includes('chivilcoy')
                      return (
                        <tr key={i} className={`border-b border-[#f1f5f9] ${esGec ? 'bg-blue-50 font-bold' : ''}`}>
                          <td className="px-4 py-2 text-[#1e293b]">{fila.equipo}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-[#64748b]">{fila.pj}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-green-700">{fila.pg}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-yellow-600">{fila.pe}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-red-600">{fila.pp}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-[#64748b]">{fila.gf}</td>
                          <td className="text-center px-2 py-2 tabular-nums text-[#64748b]">{fila.gc}</td>
                          <td className="text-center px-2 py-2 tabular-nums font-black text-[#1e293b]">{fila.pts}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Plantel del Torneo */}
        {plantel.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
            <PartidosTitle right={<span style={{ background: 'rgba(255,255,255,0.1)', color: '#93c5fd', fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{plantel.length} jugadores</span>}>
              Plantel del Torneo
            </PartidosTitle>
            {/* Encabezado de columnas */}
            <div className="flex items-center gap-3 bg-[#162032] text-white text-[0.7rem] font-bold uppercase tracking-[0.05em]" style={{ padding: '8px 16px' }}>
              <span className="w-8 shrink-0" />
              <span className="flex-1">Jugador</span>
              <span className="w-9 text-center shrink-0">PJ</span>
              <span className="w-9 text-center shrink-0">⚽</span>
              <span className="w-8 text-center shrink-0">🟨</span>
              <span className="w-8 text-center shrink-0">🟥</span>
            </div>
            <div>
              {plantel.map((ps, i) => {
                const cells = (
                  <>
                    <div className="flex items-center justify-center overflow-hidden shrink-0" style={{ width: 32, height: 32, borderRadius: '50%', background: '#162032', color: '#93c5fd', fontSize: '0.7rem', fontWeight: 700 }}>
                      {ps.foto
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={ps.foto} alt={ps.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : ps.nombre.charAt(0)}
                    </div>
                    <span className="flex-1 min-w-0 truncate font-semibold text-[#1e293b]">{ps.nombre}</span>
                    <span className="w-9 text-center shrink-0 tabular-nums text-[#1e293b]">{ps.pj}</span>
                    <span className="w-9 text-center shrink-0 tabular-nums font-bold text-[#1e293b]">{ps.goles || ''}</span>
                    <span className="w-8 text-center shrink-0 tabular-nums text-[#854d0e]">{ps.ta || ''}</span>
                    <span className="w-8 text-center shrink-0 tabular-nums text-[#dc2626]">{ps.tr || ''}</span>
                  </>
                )
                const cls = 'flex items-center gap-3 px-4 py-2 border-b border-[#f1f5f9] text-[0.85rem]'
                return ps.id
                  ? <Link key={i} href={`/jugador/${ps.id}`} className={`${cls} hover:bg-[#f8fafc] transition-colors`}>{cells}</Link>
                  : <div key={i} className={cls}>{cells}</div>
              })}
            </div>
          </div>
        )}

        {/* Lista de partidos */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <PartidosTitle>Partidos del Torneo · {pj}</PartidosTitle>
          <FichaPartidoLista partidos={partidos} />
        </div>

      </div>
    </main>
  )
}
