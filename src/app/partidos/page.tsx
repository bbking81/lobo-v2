import { getApiData } from '@/lib/api'
import Link from 'next/link'
import type { Partido } from '@/types'

interface Props {
  searchParams: Promise<{ torneo?: string; año?: string }>
}

function calcRes(gecGF: number, gecGC: number): 'V' | 'E' | 'D' {
  if (gecGF > gecGC) return 'V'
  if (gecGF === gecGC) return 'E'
  return 'D'
}

function esGecLocal(local: string) {
  const l = local.toLowerCase()
  return l.includes('gimnasia') && !l.includes('chivilcoy') && !l.includes('gualeguay') && !l.includes('jujuy') && !l.includes('mendoza')
}

const RES_SOLID = {
  V: { bg: '#16a34a', border: 'border-l-[#16a34a]' },
  E: { bg: '#64748b', border: 'border-l-[#ca8a04]' },
  D: { bg: '#dc2626', border: 'border-l-[#dc2626]' },
}

export default async function PartidosPage({ searchParams }: Props) {
  const { torneo: torneoFiltro, año: añoFiltro } = await searchParams
  const data = await getApiData()

  const publicados = data.partidos.filter(p => p.publicado)
  const torneos = [...new Set(publicados.map(p => p.torneo?.trim()).filter(Boolean))] as string[]
  const años = [...new Set(publicados.map(p => p.fecha?.slice(0, 4)).filter(Boolean))].sort().reverse() as string[]

  let filtrados = publicados
  if (torneoFiltro) filtrados = filtrados.filter(p => p.torneo?.trim() === torneoFiltro)
  if (añoFiltro)    filtrados = filtrados.filter(p => p.fecha?.startsWith(añoFiltro))

  const pj = filtrados.length
  const pg = filtrados.filter(p => p.gecGF > p.gecGC).length
  const pe = filtrados.filter(p => p.gecGF === p.gecGC).length
  const pp = filtrados.filter(p => p.gecGF < p.gecGC).length

  const grupos = new Map<string, Partido[]>()
  for (const p of filtrados) {
    const año = p.fecha?.slice(0, 4) ?? 'Sin fecha'
    if (!grupos.has(año)) grupos.set(año, [])
    grupos.get(año)!.push(p)
  }

  const makeUrl = (newTorneo?: string | null, newAño?: string | null) => {
    const params = new URLSearchParams()
    const t = newTorneo === undefined ? torneoFiltro : (newTorneo ?? undefined)
    const a = newAño === undefined ? añoFiltro : (newAño ?? undefined)
    if (t) params.set('torneo', t)
    if (a) params.set('año', a)
    const q = params.toString()
    return `/partidos${q ? '?' + q : ''}`
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5">

        {/* Banner */}
        <div className="rounded-xl px-7 py-6 mb-4 flex items-center gap-4" style={{ background: '#1e3a5f' }}>
          <svg width="36" height="36" fill="none" stroke="#93c5fd" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div>
            <p className="text-white font-bold mb-1" style={{ fontSize: '1.8rem' }}>Partidos</p>
            <p style={{ fontSize: '0.88rem', color: '#93c5fd' }}>Todos los partidos oficiales de Gimnasia y Esgrima</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl mb-4 p-5">
          <div className="flex flex-wrap gap-4">
            {/* Temporada */}
            <div>
              <p className="text-[0.7rem] text-[#64748b] font-medium mb-1.5">Temporada</p>
              <div className="flex flex-wrap gap-1.5">
                <Link href={makeUrl(undefined, null)}
                  className="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
                  style={!añoFiltro ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' } : { color: '#64748b', borderColor: '#e2e8f0' }}>
                  Todos
                </Link>
                {años.map(a => (
                  <Link key={a} href={makeUrl(undefined, a)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
                    style={añoFiltro === a ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' } : { color: '#64748b', borderColor: '#e2e8f0' }}>
                    {a}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {pj > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { num: pj, label: 'Jugados', color: '#2563eb', bg: '#dbeafe' },
              { num: pg, label: `Ganados ${((pg/pj)*100).toFixed(0)}%`, color: '#16a34a', bg: '#dcfce7' },
              { num: pe, label: `Empatados ${((pe/pj)*100).toFixed(0)}%`, color: '#ca8a04', bg: '#fef9c3' },
              { num: pp, label: `Perdidos ${((pp/pj)*100).toFixed(0)}%`, color: '#dc2626', bg: '#fee2e2' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center border" style={{ background: s.bg, borderColor: 'transparent' }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.num}</p>
                <p className="text-[0.72rem] font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Lista */}
        {pj === 0 ? (
          <div className="bg-white rounded-xl border border-[#e2e8f0] py-12 text-center text-[#94a3b8] text-sm">
            No hay partidos con estos filtros
          </div>
        ) : (
          Array.from(grupos.entries()).map(([año, partidos]) => (
            <div key={año} className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden mb-4">
              {/* Header — bg #162032 igual al original */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#162032' }}>
                <span className="text-sm font-bold text-[#f1f5f9]">{año}</span>
                <span className="text-xs text-[#64748b]">{partidos.length} partidos</span>
              </div>

              {/* Filas — .partido-row: grid 110px 1fr 200px */}
              <div className="divide-y divide-[#f1f5f9]">
                {partidos.map(p => <PartidoFila key={p.id} partido={p} />)}
              </div>
            </div>
          ))
        )}

      </div>
    </main>
  )
}

function PartidoFila({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const res = calcRes(p.gecGF, p.gecGC)
  const s = RES_SOLID[res]

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Link
      href={`/partido/partido-${p.id}`}
      className={`grid items-center px-4 py-3 hover:bg-[#f8fafc] transition-colors border-l-[3px] ${s.border}`}
      style={{ gridTemplateColumns: '110px 1fr 180px' }}
    >
      {/* Fecha */}
      <div>
        <p className="text-[0.7rem] text-[#475569] font-medium whitespace-nowrap">{fecha}</p>
        <p className="text-[0.65rem] text-[#94a3b8] mt-0.5">{gecLocal ? 'Local' : 'Visitante'}</p>
      </div>

      {/* Equipos centrados */}
      <div className="flex items-center justify-center gap-2 min-w-0">
        <p className="text-[0.87rem] font-medium text-[#151e22] text-right truncate flex-1 max-w-[140px]">
          {gecLocal ? 'Gimnasia y Esgrima' : rival}
        </p>
        <div className="flex items-center gap-1.5 shrink-0 px-2">
          <span className="text-[1.15rem] font-bold text-[#151e22] tabular-nums">{golesGec}</span>
          <span className="text-[#94a3b8] text-sm">-</span>
          <span className="text-[1.15rem] font-bold text-[#151e22] tabular-nums">{golesRival}</span>
        </div>
        <p className="text-[0.87rem] font-medium text-[#151e22] truncate flex-1 max-w-[140px]">
          {gecLocal ? rival : 'Gimnasia y Esgrima'}
        </p>
      </div>

      {/* Resultado + torneo */}
      <div className="flex items-center justify-end gap-2">
        <p className="text-[0.72rem] text-[#94a3b8] truncate text-right max-w-[120px]">{p.torneo?.trim()}</p>
        <span className="text-[0.62rem] font-black text-white px-2 py-0.5 rounded shrink-0"
          style={{ background: s.bg }}>
          {res}
        </span>
      </div>
    </Link>
  )
}
