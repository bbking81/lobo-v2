import { notFound } from 'next/navigation'
import { getApiData, fotoUrl } from '@/lib/api'
import type { Metadata } from 'next'
import Flag from '@/components/Flag'
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
  const nacFmt = jugador.nacimiento ? new Date(jugador.nacimiento + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const lugar = [jugador.ciudad, jugador.provincia].filter(Boolean).join(', ')

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">

        {/* Ficha header + stats (estilo original) */}
        <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden">
          {/* perfil-header oscuro */}
          <div className="flex flex-col sm:flex-row items-center gap-6" style={{ background: '#162032', padding: '32px 28px 24px' }}>
            <div className="shrink-0 flex items-center justify-center overflow-hidden" style={{ width: 170, height: 170, borderRadius: 24, border: '3px solid #60a5fa', background: '#fff', fontSize: '3rem', fontWeight: 800, color: '#344D83' }}>
              {foto
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={foto} alt={jugador.apellido} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} />
                : jugador.apellido.charAt(0)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="uppercase" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', marginBottom: 6 }}>{jugador.posicion || 'Jugador'}</div>
              <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>{jugador.nombre}</h1>
              <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {jugador.pais && <span className="flex items-center gap-1.5" style={{ fontSize: '0.85rem' }}><Flag pais={jugador.pais} size={20} /> {jugador.pais}</span>}
                {nacFmt && <span className="flex items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {nacFmt}{edad ? ` · ${edad} años` : ''}</span>}
                {lugar && <span className="flex items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {lugar}</span>}
              </div>
            </div>
          </div>

          {/* Stats en tarjetas oscuras */}
          <div className="flex flex-col gap-3.5" style={{ padding: '16px 20px', background: '#f8fafc' }}>
            <div>
              <StatLabel>Resultados</StatLabel>
              <div className="grid grid-cols-3 gap-2">
                <DarkStat bg="#14532d" color="#4ade80" num={jugador.pg} label="Ganados" />
                <DarkStat bg="#713f12" color="#fbbf24" num={jugador.pe} label="Empatados" />
                <DarkStat bg="#7f1d1d" color="#f87171" num={jugador.pp} label="Perdidos" />
              </div>
            </div>
            <div>
              <StatLabel>Goles</StatLabel>
              <DarkStat bg="#431407" color="#fb923c" num={jugador.goles} label="Goles" />
            </div>
            <div>
              <StatLabel>Tarjetas</StatLabel>
              <div className="grid grid-cols-2 gap-2">
                <DarkStat bg="#422006" color="#fbbf24" num={jugador.ta} label="Amarillas" />
                <DarkStat bg="#450a0a" color="#f87171" num={jugador.tr} label="Rojas" />
              </div>
            </div>
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

function StatLabel({ children }: { children: React.ReactNode }) {
  return <div className="uppercase" style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 8 }}>{children}</div>
}
function DarkStat({ bg, color, num, label }: { bg: string; color: string; num: number; label: string }) {
  return (
    <div className="text-center" style={{ background: bg, borderRadius: 10, padding: '16px 10px' }}>
      <div className="tabular-nums" style={{ fontSize: '1.9rem', fontWeight: 900, color, lineHeight: 1 }}>{num ?? 0}</div>
      <div className="uppercase" style={{ fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>{label}</div>
    </div>
  )
}
