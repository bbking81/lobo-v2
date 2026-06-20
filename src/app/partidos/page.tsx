import { getApiData } from '@/lib/api'
import { pageMeta } from '@/lib/seo'
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
  V: { bg: '#16a34a' },
  E: { bg: '#ca8a04' },
  D: { bg: '#dc2626' },
}
const selCls = 'w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] px-3 py-2 text-sm text-[#1e293b] outline-none'

export const metadata = pageMeta({
  title: 'Partidos de Gimnasia y Esgrima',
  description: 'Todos los partidos oficiales de Gimnasia y Esgrima de Concepción del Uruguay: resultados, rivales, torneos y condición.',
  path: '/partidos',
})

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

  // Nombre del torneo normalizado para mostrar (clon del original): si el torneo
  // crudo no trae año, se completa con el nombre oficial de la competencia
  // (ej: Torneo Federal → Torneo Federal "A") y el año del propio partido.
  // Escudo del rival por nombre (igual que el Home); null → iniciales
  const escudoDe = (nombre: string): string | null => {
    const rl = nombre.toLowerCase()
    const eqs = data.equipos as { nombre?: string; escudoUrl?: string }[]
    let eq = eqs.find(e => (e.nombre || '').toLowerCase() === rl)
    if (!eq) eq = eqs.find(e => rl.includes((e.nombre || '').toLowerCase()) || (e.nombre || '').toLowerCase().includes(rl))
    return eq?.escudoUrl || null
  }

  const comps = data.competencias ?? []
  const torneoLabel = (p: Partido): string => {
    const raw = p.torneo?.trim() || '—'
    if (/\d{4}/.test(raw)) return raw
    const rl = raw.toLowerCase()
    const comp = comps.find(c => c.nombre?.toLowerCase().trim() === rl)
      ?? comps.find(c => c.nombre?.toLowerCase().trim().startsWith(rl))
      ?? comps.find(c => c.nombre && rl.startsWith(c.nombre.toLowerCase().trim()))
    const nombre = comp?.nombre ?? raw
    const año = p.fecha?.slice(0, 4)
    return año ? `${nombre} - ${año}` : nombre
  }

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
            <button type="submit" className="bg-[#007ad6] hover:bg-[#0067b5] text-white rounded-lg px-5 py-2 text-sm font-semibold transition-colors">Filtrar</button>
            {(fRes || fCond || fAño || fTorneo || fRival) && (
              <Link href="/partidos" className="text-[#64748b] hover:text-[#1e293b] rounded-lg px-4 py-2 text-sm font-semibold border border-[#e2e8f0] transition-colors">Limpiar</Link>
            )}
          </div>
        </form>

        {/* Stats */}
        {pj > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { num: pj, label: 'Jugados', accent: '#007ad6', numColor: '#0f172a' },
              { num: pg, label: `Ganados ${((pg / pj) * 100).toFixed(0)}%`, accent: '#16a34a', numColor: '#16a34a' },
              { num: pe, label: `Empatados ${((pe / pj) * 100).toFixed(0)}%`, accent: '#ca8a04', numColor: '#ca8a04' },
              { num: pp, label: `Perdidos ${((pp / pj) * 100).toFixed(0)}%`, accent: '#dc2626', numColor: '#dc2626' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-[10px] border border-[#e2e8f0] px-2.5 py-1.5 text-center" style={{ borderTop: `3px solid ${s.accent}`, boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}>
                <p className="text-lg font-black leading-tight" style={{ color: s.numColor }}>{s.num}</p>
                <p className="text-[0.68rem] font-semibold text-[#64748b]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Lista (corrida, sin agrupar por año — como el original) */}
        {pj === 0 ? (
          <div className="bg-white rounded-xl border border-[#e2e8f0] py-12 text-center text-[#94a3b8] text-sm">No hay partidos con estos filtros</div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden" style={{ borderLeft: '4px solid #007ad6', boxShadow: '0 2px 8px rgba(15,23,42,.07)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eef2f6]">
              <span className="text-sm font-semibold text-[#0f172a]">Total: <span className="text-[#007ad6]">{pj}</span> partido{pj !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-[#f1f5f9]">
              {filtrados.map(p => <PartidoFila key={p.id} partido={p} torneo={torneoLabel(p)} escudoRival={escudoDe(esGecLocal(p.local) ? p.visitante : p.local)} />)}
            </div>
          </div>
        )}
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

const ini = (s: string) => s.trim().split(/\s+/).filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || s.substring(0, 2).toUpperCase()

function Escudo({ src, nombre }: { src: string | null; nombre: string }) {
  return src
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={src} alt={nombre} className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0" />
    : <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[0.55rem] sm:text-[0.6rem] font-extrabold text-white shrink-0">{ini(nombre)}</div>
}

function PartidoFila({ partido: p, torneo, escudoRival }: { partido: Partido; torneo: string; escudoRival: string | null }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const res = calcRes(p.gecGF, p.gecGC)
  const s = RES_SOLID[res]
  const escudoLocal = gecLocal ? '/api/escudo-gec' : escudoRival
  const escudoVisit = gecLocal ? escudoRival : '/api/escudo-gec'
  const nombreLocal = gecLocal ? 'Gimnasia y Esgrima' : rival
  const nombreVisit = gecLocal ? rival : 'Gimnasia y Esgrima'

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  // Detalle del torneo (como el original): "Fecha N · fase · subfase"
  const detalle = [p.fechaNro ? `Fecha ${p.fechaNro}` : '', p.fase || '', p.subfase || ''].filter(Boolean).join(' · ')

  return (
    <Link href={`/partido/partido-${p.id}`}
      className="block px-3 sm:px-4 py-2.5 hover:bg-[#f8fafc] transition-colors">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Fecha + condición (desde sm) */}
        <div className="hidden sm:block w-[100px] shrink-0">
          <p className="text-[0.7rem] text-[#475569] font-medium whitespace-nowrap">{fecha}</p>
          <p className="text-[0.65rem] text-[#94a3b8] mt-0.5">{gecLocal ? 'Local' : 'Visitante'}</p>
        </div>
        {/* Equipos + marcador */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1 min-w-0">
            <p className="text-[0.8rem] sm:text-[0.87rem] font-medium text-[#151e22] text-right truncate">{nombreLocal}</p>
            <Escudo src={escudoLocal} nombre={nombreLocal} />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 px-1 sm:px-2">
            <span className="text-[1.05rem] sm:text-[1.15rem] font-bold text-[#151e22] tabular-nums">{golesGec}</span>
            <span className="text-[#94a3b8] text-sm">-</span>
            <span className="text-[1.05rem] sm:text-[1.15rem] font-bold text-[#151e22] tabular-nums">{golesRival}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <Escudo src={escudoVisit} nombre={nombreVisit} />
            <p className="text-[0.8rem] sm:text-[0.87rem] font-medium text-[#151e22] truncate">{nombreVisit}</p>
          </div>
        </div>
        {/* Torneo (desde md) + badge resultado */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <div className="hidden md:block min-w-0 text-right max-w-[160px]">
            <p className="text-[0.72rem] text-[#475569] font-medium truncate">{torneo}</p>
            {detalle && <p className="text-[0.64rem] text-[#94a3b8] truncate">{detalle}</p>}
          </div>
          <span className="text-[0.62rem] font-black text-white px-2 py-0.5 rounded shrink-0" style={{ background: s.bg }}>{res}</span>
        </div>
      </div>
      {/* Línea inferior compacta solo en móvil: fecha · condición · torneo */}
      <div className="sm:hidden flex items-center gap-1.5 mt-1 pl-0.5 text-[0.62rem] text-[#94a3b8]">
        <span className="whitespace-nowrap">{fecha} · {gecLocal ? 'Local' : 'Visitante'}</span>
        {torneo && <span className="truncate">· {torneo}</span>}
      </div>
    </Link>
  )
}
