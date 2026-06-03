import { getApiData } from '@/lib/api'
import Link from 'next/link'
import type { Partido } from '@/types'

function calcularResultado(gecGF: number, gecGC: number): 'V' | 'E' | 'D' {
  if (gecGF > gecGC) return 'V'
  if (gecGF === gecGC) return 'E'
  return 'D'
}

function esGecLocal(local: string): boolean {
  const l = local.toLowerCase()
  return l.includes('gimnasia') &&
    !l.includes('chivilcoy') && !l.includes('gualeguay') &&
    !l.includes('jujuy') && !l.includes('mendoza')
}

/* Header de card — igual al original: gradiente #0f1e35 → #1e4a8a */
function CardHeader({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 rounded-t-xl" style={{ background: 'linear-gradient(to right, #0f1e35, #1e4a8a)' }}>
      <span className="text-[#60a5fa] shrink-0">{icon}</span>
      <span className="text-xs font-bold text-white uppercase tracking-widest">{title}</span>
      {children}
    </div>
  )
}

type ProximoType = {
  rival: string; fecha: string; hora: string
  condicion: string; torneo: string; estadio: string
}

export default async function HomePage() {
  const data = await getApiData()
  const publicados = data.partidos.filter(p => p.publicado)
  const ultimoPartido = publicados[0]
  const ultimos = publicados.slice(1, 9)
  const proximo = data.proximoPartido as ProximoType | undefined

  // Partidos de hoy en la historia
  const hoy = new Date()
  const diaHoy = hoy.getDate()
  const mesHoy = hoy.getMonth() + 1
  const diaComoHoy = publicados.filter(p => {
    const f = new Date(p.fecha + 'T12:00:00')
    return f.getDate() === diaHoy && f.getMonth() + 1 === mesHoy
  }).slice(0, 6)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 py-5 max-w-[1200px]">

        {/* Banner próximo partido — igual al original */}
        {proximo && <BannerProximo proximo={proximo} />}

        {/* FILA 1: Último partido (izq) + Un día como hoy (der 340px) */}
        <div className="grid gap-5 mb-6" style={{ gridTemplateColumns: '1fr 340px' }}>

          {/* Último partido */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
            <CardHeader
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>}
              title="Último Partido"
            />
            {ultimoPartido
              ? <UltimoPartidoCard partido={ultimoPartido} />
              : <p className="text-center text-[#94a3b8] text-sm py-10">Sin partidos cargados</p>
            }
          </div>

          {/* Un día como hoy */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
            <CardHeader
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="12,7.5 16.1,10.6 14.6,15.4 9.4,15.4 7.9,10.6" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1.5"/><line x1="12" y1="7.5" x2="12" y2="2"/><line x1="16.1" y1="10.6" x2="21.3" y2="8.8"/><line x1="14.6" y1="15.4" x2="18.2" y2="19.8"/><line x1="9.4" y1="15.4" x2="5.8" y2="19.8"/><line x1="7.9" y1="10.6" x2="2.7" y2="8.8"/></svg>}
              title="Un día como hoy..."
            />
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {diaComoHoy.length === 0
                ? <p className="text-center text-[#94a3b8] text-sm py-5">Sin partidos en esta fecha</p>
                : diaComoHoy.map(p => <DiaComoHoyFila key={p.id} partido={p} />)
              }
            </div>
          </div>
        </div>

        {/* FILA 2: Resultados recientes */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden mb-6">
          <CardHeader
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
            title="Resultados Recientes"
          >
            <Link href="/partidos" className="ml-auto text-[#60a5fa] hover:text-white text-xs font-semibold transition-colors">
              Ver todos →
            </Link>
          </CardHeader>

          {(() => {
            const grupos = new Map<string, Partido[]>()
            for (const p of ultimos) {
              const t = p.torneo?.trim() ?? 'Sin torneo'
              if (!grupos.has(t)) grupos.set(t, [])
              grupos.get(t)!.push(p)
            }
            return Array.from(grupos.entries()).map(([torneo, partidos]) => (
              <div key={torneo}>
                <div className="px-5 py-1.5 bg-[#f8fafc] border-b border-t border-[#f1f5f9]">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">{torneo}</span>
                </div>
                {partidos.map(p => <ResultadoFila key={p.id} partido={p} />)}
              </div>
            ))
          })()}
        </div>

      </div>
    </main>
  )
}

/* ── Banner próximo partido ── */
function BannerProximo({ proximo }: { proximo: ProximoType }) {
  const fecha = new Date(proximo.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <div className="rounded-xl overflow-hidden mb-5" style={{ background: 'linear-gradient(to right, #1e3a5f, #6b1a1a)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
      <div className="flex items-flex-start px-[18px] py-4 gap-3.5">
        <div className="flex items-center justify-center shrink-0 rounded-[9px]" style={{ background: 'rgba(255,255,255,0.18)', width: 38, height: 38 }}>
          <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.65rem] font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.3px' }}>Próximo Partido</p>
          <p className="text-[1.2rem] font-black text-white leading-tight">{proximo.rival}</p>
          <p className="text-[0.72rem] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {proximo.torneo.trim()} · {proximo.condicion}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[0.95rem] font-black text-white whitespace-nowrap">{fecha}</p>
          <p className="text-[0.88rem] font-medium whitespace-nowrap mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{proximo.hora} hs</p>
          {proximo.estadio && (
            <p className="text-[0.72rem] mt-0.5 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.6)' }}>🏠 {proximo.estadio}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Card grande último partido ── */
function UltimoPartidoCard({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const rival = gecLocal ? p.visitante : p.local
  const res = calcularResultado(p.gecGF, p.gecGC)

  const resLabel = res === 'V' ? 'Victoria' : res === 'E' ? 'Empate' : 'Derrota'
  const resBg = res === 'V' ? { bg: '#dcfce7', color: '#16a34a' } : res === 'E' ? { bg: '#fef9c3', color: '#854d0e' } : { bg: '#fee2e2', color: '#dc2626' }

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Link href={`/partido/partido-${p.id}`} className="block hover:bg-[#f8fafc] transition-colors">
      <div className="px-7 py-6">
        {/* Equipos y marcador */}
        <div className="flex items-center justify-between gap-4">
          {/* GEC */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/escudo-gec" alt="GEC" className="h-16 w-16 object-contain" />
            <p className="text-[0.87rem] font-bold text-[#1e293b] text-center leading-tight">
              {gecLocal ? p.local : p.visitante}
            </p>
            <span className="text-[10px] text-[#94a3b8]">{gecLocal ? 'Local' : 'Visitante'}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[3.2rem] font-black text-[#0f172a] tabular-nums leading-none">{golesGec}</span>
              <span className="text-[1.5rem] text-[#94a3b8] font-light">—</span>
              <span className="text-[3.2rem] font-black text-[#0f172a] tabular-nums leading-none">{golesRival}</span>
            </div>
            <span className="text-xs font-bold px-5 py-1 rounded-full" style={{ background: resBg.bg, color: resBg.color }}>
              {resLabel}
            </span>
          </div>

          {/* Rival */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="h-16 w-16 rounded-xl bg-[#e2e8f0] flex items-center justify-center text-2xl font-black text-[#64748b]">
              {rival.charAt(0)}
            </div>
            <p className="text-[0.87rem] font-bold text-[#1e293b] text-center leading-tight truncate w-full">{rival}</p>
            <span className="text-[10px] text-[#94a3b8]">{gecLocal ? 'Visitante' : 'Local'}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: 'Fecha', val: new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) },
            { label: 'Torneo', val: p.torneo?.replace(/"/g, '').trim() },
            { label: 'Condición', val: gecLocal ? 'Local' : 'Visitante' },
          ].map(d => (
            <div key={d.label} className="bg-[#f8fafc] rounded-lg px-3 py-2 border border-[#e2e8f0]">
              <p className="text-[9px] text-[#94a3b8] uppercase tracking-wide font-semibold">{d.label}</p>
              <p className="text-[11px] font-bold text-[#475569] truncate mt-0.5">{d.val}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

/* ── Fila de "Un día como hoy" ── */
function DiaComoHoyFila({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const res = calcularResultado(p.gecGF, p.gecGC)
  const scoreColor = res === 'V' ? '#16a34a' : res === 'E' ? '#ca8a04' : '#dc2626'
  const scoreBg = res === 'V' ? '#dcfce7' : res === 'E' ? '#fef9c3' : '#fee2e2'
  const año = p.fecha.substring(0, 4)

  return (
    <Link href={`/partido/partido-${p.id}`} className="flex items-center gap-3 py-2.5 border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc] -mx-4 px-4 transition-colors rounded">
      <div className="w-8 h-8 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
        <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.85rem] font-semibold text-[#1e293b] truncate">vs {rival}</p>
        <p className="text-[0.72rem] text-[#94a3b8]">{año} · {p.torneo?.trim()}</p>
      </div>
      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md shrink-0" style={{ background: scoreBg, color: scoreColor }}>
        {p.gecGF}–{p.gecGC}
      </span>
    </Link>
  )
}

/* ── Fila de resultados recientes ── */
const RES_DOT: Record<string, string> = {
  V: 'bg-[#16a34a]', E: 'bg-[#ca8a04]', D: 'bg-[#dc2626]',
}
const RES_BADGE: Record<string, { bg: string; color: string }> = {
  V: { bg: '#16a34a', color: '#fff' },
  E: { bg: '#64748b', color: '#fff' },
  D: { bg: '#dc2626', color: '#fff' },
}
const RES_BORDER: Record<string, string> = {
  V: 'border-l-[#16a34a]', E: 'border-l-[#ca8a04]', D: 'border-l-[#dc2626]',
}

function ResultadoFila({ partido: p }: { partido: Partido }) {
  const gecLocal = esGecLocal(p.local)
  const rival = gecLocal ? p.visitante : p.local
  const golesGec = gecLocal ? p.gl : p.gv
  const golesRival = gecLocal ? p.gv : p.gl
  const res = calcularResultado(p.gecGF, p.gecGC)

  const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  })

  return (
    <Link
      href={`/partido/partido-${p.id}`}
      className={`flex items-center gap-3 px-5 py-2.5 hover:bg-[#f8fafc] transition-colors border-l-[3px] border-b border-b-[#f1f5f9] last:border-b-0 ${RES_BORDER[res]}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${RES_DOT[res]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[0.87rem] font-medium text-[#151e22] truncate leading-tight">vs {rival}</p>
        <p className="text-[11px] text-[#475569] leading-tight mt-0.5">
          {gecLocal ? 'Local' : 'Visitante'} · {fecha}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[1.15rem] font-bold tabular-nums text-[#151e22]">
          {golesGec}<span className="text-[#94a3b8] mx-0.5 text-sm">-</span>{golesRival}
        </span>
        <span className="text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded"
          style={{ background: RES_BADGE[res].bg, color: RES_BADGE[res].color }}>
          {res}
        </span>
      </div>
    </Link>
  )
}
