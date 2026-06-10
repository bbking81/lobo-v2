import { getApiData } from '@/lib/api'
import Link from 'next/link'
import SecBanner from '@/components/SecBanner'
import type { Partido } from '@/types'

interface Props {
  searchParams: Promise<{ resultado?: string; condicion?: string; año?: string; torneo?: string; rival?: string }>
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
const selCls = 'w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] px-3 py-2 text-sm text-[#1e293b] outline-none'

export default async function PartidosPage({ searchParams }: Props) {
  const sp = await searchParams
  const data = await getApiData()
  const publicados = data.partidos.filter(p => p.publicado)

  const torneos = [...new Set(publicados.map(p => p.torneo?.trim()).filter(Boolean))].sort() as string[]
  const años = [...new Set(publicados.map(p => p.fecha?.slice(0, 4)).filter(Boolean))].sort().reverse() as string[]
  const rivales = [...new Set(publicados.map(p => (esGecLocal(p.local) ? p.visitante : p.local)).filter(Boolean))].sort()

  const fRes = sp.resultado ?? '', fCond = sp.condicion ?? '', fAño = sp.año ?? '', fTorneo = sp.torneo ?? '', fRival = sp.rival ?? ''

  const filtrados = publicados.filter(p => {
    if (fRes && calcRes(p.gecGF, p.gecGC) !== fRes) return false
    const local = esGecLocal(p.local)
    if (fCond === 'local' && !local) return false
    if (fCond === 'visitante' && local) return false
    if (fAño && !p.fecha?.startsWith(fAño)) return false
    if (fTorneo && p.torneo?.trim() !== fTorneo) return false
    if (fRival && (local ? p.visitante : p.local) !== fRival) return false
    return true
  })

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
  const gruposOrden = Array.from(grupos.entries()).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5">
        <SecBanner
          title="Partidos"
          subtitle="Todos los partidos oficiales de Gimnasia y Esgrima"
          icon={<><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>}
        />

        {/* Filtros */}
        <form method="GET" action="/partidos" className="bg-white border border-[#e2e8f0] rounded-xl mb-4 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Campo label="Resultado">
            <select name="resultado" defaultValue={fRes} className={selCls}>
              <option value="">Todos</option><option value="V">Ganados</option><option value="E">Empatados</option><option value="D">Perdidos</option>
            </select>
          </Campo>
          <Campo label="Condición">
            <select name="condicion" defaultValue={fCond} className={selCls}>
              <option value="">Todas</option><option value="local">Local</option><option value="visitante">Visitante</option>
            </select>
          </Campo>
          <Campo label="Año">
            <select name="año" defaultValue={fAño} className={selCls}>
              <option value="">Todos</option>{años.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </Campo>
          <Campo label="Torneo">
            <select name="torneo" defaultValue={fTorneo} className={selCls}>
              <option value="">Todos</option>{torneos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Campo>
          <Campo label="Rival">
            <select name="rival" defaultValue={fRival} className={selCls}>
              <option value="">Cualquiera</option>{rivales.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Campo>
          <div className="col-span-2 sm:col-span-3 lg:col-span-5 flex gap-2">
            <button type="submit" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-5 py-2 text-sm font-semibold transition-colors">Filtrar</button>
            {(fRes || fCond || fAño || fTorneo || fRival) && (
              <Link href="/partidos" className="text-[#64748b] hover:text-[#1e293b] rounded-lg px-4 py-2 text-sm font-semibold border border-[#e2e8f0] transition-colors">Limpiar</Link>
            )}
          </div>
        </form>

        {/* Stats */}
        {pj > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { num: pj, label: 'Jugados', color: '#2563eb', bg: '#dbeafe' },
              { num: pg, label: `Ganados ${((pg / pj) * 100).toFixed(0)}%`, color: '#16a34a', bg: '#dcfce7' },
              { num: pe, label: `Empatados ${((pe / pj) * 100).toFixed(0)}%`, color: '#ca8a04', bg: '#fef9c3' },
              { num: pp, label: `Perdidos ${((pp / pj) * 100).toFixed(0)}%`, color: '#dc2626', bg: '#fee2e2' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.bg }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.num}</p>
                <p className="text-[0.72rem] font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Lista */}
        {pj === 0 ? (
          <div className="bg-white rounded-xl border border-[#e2e8f0] py-12 text-center text-[#94a3b8] text-sm">No hay partidos con estos filtros</div>
        ) : gruposOrden.map(([año, partidos]) => (
          <div key={año} className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden mb-4">
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#162032' }}>
              <span className="text-sm font-bold text-[#f1f5f9]">{año}</span>
              <span className="text-xs text-[#94a3b8]">{partidos.length} partidos</span>
            </div>
            <div className="divide-y divide-[#f1f5f9]">
              {partidos.map(p => <PartidoFila key={p.id} partido={p} />)}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.65rem] font-bold text-[#64748b] uppercase tracking-[0.06em]">{label}</label>
      {children}
    </div>
  )
}

function PartidoFila({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const res = calcRes(p.gecGF, p.gecGC)
  const s = RES_SOLID[res]

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  // Detalle del torneo (como el original): "Fecha N · fase · subfase"
  const detalle = [p.fechaNro ? `Fecha ${p.fechaNro}` : '', p.fase || '', p.subfase || ''].filter(Boolean).join(' · ')

  return (
    <Link href={`/partido/partido-${p.id}`}
      className={`grid items-center px-4 py-3 hover:bg-[#f8fafc] transition-colors border-l-[3px] ${s.border}`}
      style={{ gridTemplateColumns: '110px 1fr 180px' }}>
      <div>
        <p className="text-[0.7rem] text-[#475569] font-medium whitespace-nowrap">{fecha}</p>
        <p className="text-[0.65rem] text-[#94a3b8] mt-0.5">{gecLocal ? 'Local' : 'Visitante'}</p>
      </div>
      <div className="flex items-center justify-center gap-2 min-w-0">
        <p className="text-[0.87rem] font-medium text-[#151e22] text-right truncate flex-1 max-w-[140px]">{gecLocal ? 'Gimnasia y Esgrima' : rival}</p>
        <div className="flex items-center gap-1.5 shrink-0 px-2">
          <span className="text-[1.15rem] font-bold text-[#151e22] tabular-nums">{golesGec}</span>
          <span className="text-[#94a3b8] text-sm">-</span>
          <span className="text-[1.15rem] font-bold text-[#151e22] tabular-nums">{golesRival}</span>
        </div>
        <p className="text-[0.87rem] font-medium text-[#151e22] truncate flex-1 max-w-[140px]">{gecLocal ? rival : 'Gimnasia y Esgrima'}</p>
      </div>
      <div className="flex items-center justify-end gap-2">
        <div className="min-w-0 text-right">
          <p className="text-[0.72rem] text-[#475569] font-medium truncate">{p.torneo?.trim()}</p>
          {detalle && <p className="text-[0.64rem] text-[#94a3b8] truncate">{detalle}</p>}
        </div>
        <span className="text-[0.62rem] font-black text-white px-2 py-0.5 rounded shrink-0" style={{ background: s.bg }}>{res}</span>
      </div>
    </Link>
  )
}
