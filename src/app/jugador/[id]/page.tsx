import { notFound } from 'next/navigation'
import { getApiData, fotoUrl } from '@/lib/api'
import type { Metadata } from 'next'
import { PlayerHeroPhoto } from '@/components/PlayerAvatar'
import JugadorPerfil, { type PartidoRow, type ConxItem } from '@/components/JugadorPerfil'

interface Props {
  params: Promise<{ id: string }>
}

interface TorneoStat {
  nombre: string
  año: string
  pj: number; pg: number; pe: number; pp: number
  goles: number; ta: number; tr: number
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getApiData()
  const jugador = data.jugadores.find(j => j.id === parseInt(id))
  if (!jugador) return { title: 'Jugador no encontrado' }
  return { title: `${jugador.nombre} | Lobo Entrerriano` }
}

export default async function JugadorPage({ params }: Props) {
  const { id } = await params
  const data = await getApiData()
  const jugador = data.jugadores.find(j => j.id === parseInt(id))

  if (!jugador || !jugador.apellido) notFound()

  const foto = fotoUrl(jugador.foto)
  const esNueva = foto?.includes('_nobg')

  // Partidos en los que participó (todos), ordenados por fecha desc
  const partidosTodos = data.partidos
    .filter(p => p.publicado && p.planillaGec?.some(pj => pj.jugador_id === jugador.id))
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  // ── Stats por Torneo (clonado de .pjug-stats-wrap del original) ──
  const torneoMap = new Map<string, TorneoStat>()
  for (const p of partidosTodos) {
    const nombre = (p.torneo || 'Sin torneo').replace(/\s*[-–]\s*\d{4}.*$/, '').trim()
    const añoMatch = (p.torneo || '').match(/(\d{4})/)
    const año = añoMatch ? añoMatch[1] : (p.fecha ? p.fecha.substring(0, 4) : '')
    const key = `${nombre}|${año}`
    let t = torneoMap.get(key)
    if (!t) { t = { nombre, año, pj: 0, pg: 0, pe: 0, pp: 0, goles: 0, ta: 0, tr: 0 }; torneoMap.set(key, t) }
    t.pj++
    if (p.gecGF > p.gecGC) t.pg++
    else if (p.gecGF === p.gecGC) t.pe++
    else t.pp++
    const pl = p.planillaGec?.find(x => x.jugador_id === jugador.id)
    if (pl) { t.goles += pl.goles ?? 0; t.ta += pl.amarillas ?? 0; t.tr += pl.rojas ?? 0 }
  }
  const torneoStats = Array.from(torneoMap.values()).sort((a, b) =>
    b.año !== a.año ? (b.año || '0').localeCompare(a.año || '0') : b.pj - a.pj
  )

  // ── Filas de partidos + conexiones (clonado de openPerfilJugador del original) ──
  const idById = new Map(data.jugadores.map(j => [j.nombre, j.id]))
  const compMap = new Map<string, ConxItem>()
  const rivMap = new Map<string, ConxItem>()
  const dtMap = new Map<string, ConxItem>()

  const partidoRows: PartidoRow[] = partidosTodos.map(p => {
    const esLocal = p.gl === p.gv
      ? p.local.toLowerCase().includes('gimnasia')
      : (p.gecGF === p.gl && p.gecGC === p.gv)
    const rival = esLocal ? p.visitante : p.local
    const resultado: 'V' | 'E' | 'D' = p.gecGF > p.gecGC ? 'V' : p.gecGF === p.gecGC ? 'E' : 'D'
    const añoMatch = (p.torneo || '').match(/(\d{4})/)
    const año = añoMatch ? añoMatch[1] : (p.fecha ? p.fecha.substring(0, 4) : '')
    const fila = p.planillaGec?.find(x => x.jugador_id === jugador.id)
    const fechaFmt = p.fecha
      ? new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
      : '—'

    // Conexiones (acumular)
    for (const c of p.planillaGec ?? []) {
      if (c.jugador_id === jugador.id || !c.jugador?.trim()) continue
      const it = compMap.get(c.jugador) ?? { nombre: c.jugador, n: 0, jugadorId: c.jugador_id ?? idById.get(c.jugador) }
      it.n++; compMap.set(c.jugador, it)
    }
    for (const r of p.planillaRival ?? []) {
      if (!r.jugador?.trim()) continue
      const it = rivMap.get(r.jugador) ?? { nombre: r.jugador, n: 0 }
      it.n++; rivMap.set(r.jugador, it)
    }
    if (p.dtGimnasia?.trim()) {
      const it = dtMap.get(p.dtGimnasia) ?? { nombre: p.dtGimnasia, n: 0 }
      it.n++; dtMap.set(p.dtGimnasia, it)
    }

    return {
      id: p.id,
      fecha: p.fecha,
      fechaFmt,
      torneo: p.torneo || '',
      año,
      rival,
      score: `${p.gl}-${p.gv}`,
      resultado,
      esLocal,
      titular: !!fila?.titular,
      goles: fila?.goles ?? 0,
      amarillas: fila?.amarillas ?? 0,
      rojas: fila?.rojas ?? 0,
    }
  })

  const byN = (a: ConxItem, b: ConxItem) => b.n - a.n
  const companeros = Array.from(compMap.values()).sort(byN)
  const rivales = Array.from(rivMap.values()).sort(byN)
  const dts = Array.from(dtMap.values()).sort(byN)
  const fotos = jugador.mediaFotos ?? []

  const edad = jugador.nacimiento
    ? Math.floor((Date.now() - new Date(jugador.nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">

        {/* Hero jugador */}
        <div className="bg-[#1e3a5f] rounded-lg overflow-hidden flex">
          {/* Foto */}
          <div className="w-36 shrink-0 flex items-end justify-center bg-[#162e4d] overflow-hidden">
            <PlayerHeroPhoto src={foto} apellido={jugador.apellido} esNueva={!!esNueva} />
          </div>

          {/* Info */}
          <div className="flex-1 p-4 text-white">
            <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">{jugador.posicion ?? 'Sin posición'}</p>
            <h1 className="font-black text-xl leading-tight">{jugador.apellido}</h1>
            <p className="text-blue-200 text-sm">{jugador.nombres}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {edad && (
                <div>
                  <p className="text-blue-300 text-xs">Edad</p>
                  <p className="font-bold">{edad} años</p>
                </div>
              )}
              {jugador.ciudad && (
                <div>
                  <p className="text-blue-300 text-xs">Origen</p>
                  <p className="font-bold text-sm">{jugador.ciudad}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-3 border-b border-gray-100">
            Estadísticas
          </h2>
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            <Stat label="Partidos" valor={jugador.pj} />
            <Stat label="Goles" valor={jugador.goles} />
            <Stat label="Amarillas" valor={jugador.ta} />
            <Stat label="Rojas" valor={jugador.tr} />
          </div>
        </div>

        {/* Stats por Torneo */}
        {torneoStats.length > 0 && (
          <div className="bg-white rounded-[10px] border border-[#e2e8f0] overflow-hidden">
            <div className="flex items-center gap-2.5 px-[18px] py-3.5 bg-[#f1f5f9] border-b border-[#e2e8f0]">
              <span className="text-base">📊</span>
              <span className="text-[0.95rem] font-bold text-[#1e293b]">Stats por Torneo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[0.82rem]">
                <thead className="bg-[#162032]">
                  <tr className="text-white text-[0.7rem] font-bold uppercase tracking-[0.06em]">
                    <th className="text-left px-2.5 py-[7px]">Torneo</th>
                    <th className="text-center px-2 py-[7px]">Año</th>
                    <th className="text-center px-2 py-[7px]">PJ</th>
                    <th className="text-center px-2 py-[7px]">PG</th>
                    <th className="text-center px-2 py-[7px]">PE</th>
                    <th className="text-center px-2 py-[7px]">PP</th>
                    <th className="text-center px-2 py-[7px]">Goles</th>
                    <th className="text-center px-2 py-[7px]">TA</th>
                    <th className="text-center px-2 py-[7px]">TR</th>
                  </tr>
                </thead>
                <tbody>
                  {torneoStats.map((t, i) => (
                    <tr key={`${t.nombre}-${t.año}`} className="border-b border-[#e2e8f0]" style={{ background: i % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                      <td className="px-2.5 py-2 font-semibold text-[#1e293b]">{t.nombre}</td>
                      <td className="text-center px-2 py-2 text-[#64748b]">{t.año}</td>
                      <td className="text-center px-2 py-2 tabular-nums text-[#1e293b]">{t.pj}</td>
                      <td className="text-center px-2 py-2 tabular-nums font-bold text-green-600">{t.pg}</td>
                      <td className="text-center px-2 py-2 tabular-nums font-bold text-orange-500">{t.pe}</td>
                      <td className="text-center px-2 py-2 tabular-nums font-bold text-red-600">{t.pp}</td>
                      <td className="text-center px-2 py-2 tabular-nums font-bold text-[#1e293b]">{t.goles}</td>
                      <td className="text-center px-2 py-2 tabular-nums text-[#854d0e]">{t.ta || ''}</td>
                      <td className="text-center px-2 py-2 tabular-nums text-[#dc2626]">{t.tr || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filtros + lista + conexiones + galería (interactivo) */}
        <JugadorPerfil
          partidos={partidoRows}
          companeros={companeros}
          rivales={rivales}
          dts={dts}
          fotos={fotos}
        />

      </div>
    </main>
  )
}

function Stat({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex flex-col items-center py-4 gap-1">
      <span className="text-2xl font-black text-gray-800">{valor}</span>
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  )
}
