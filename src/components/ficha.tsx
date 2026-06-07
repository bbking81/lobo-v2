import Link from 'next/link'
import type { Partido } from '@/types'

/** GEC fue local en este partido. Empate → heurística por nombre; si no, por goles. */
export function gecEsLocal(p: Partido): boolean {
  return p.gl === p.gv
    ? p.local.toLowerCase().includes('gimnasia')
    : (p.gecGF === p.gl && p.gecGC === p.gv)
}

/** Avatar redondeado con foto o iniciales (clon de .perfil-avatar del original). */
export function PerfilAvatar({ foto, initials, size = 170 }: { foto?: string | null; initials: string; size?: number }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: 24, border: '3px solid #60a5fa', background: '#fff', fontSize: size > 120 ? '3rem' : '2rem', fontWeight: 800, color: '#344D83' }}
    >
      {foto
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={foto} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} />
        : initials}
    </div>
  )
}

interface StatItem { num: number | string; label: string; color: string; bg: string }

/** Grilla de tarjetas de estadística oscuras (clon de las stat cards del original). */
export function DarkStatGrid({ items, cols = 2 }: { items: StatItem[]; cols?: 2 | 3 | 4 }) {
  const grid = cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2'
  return (
    <div className={`grid ${grid} gap-2.5 p-4 border-b border-[#e2e8f0]`}>
      {items.map(s => (
        <div key={s.label} className="text-center" style={{ background: s.bg, borderRadius: 12, padding: '16px 10px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.num}</div>
          <div className="uppercase" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: '0.05em' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

/** Tarjetas G/E/P con porcentaje sobre el total (clon de .pcard del original). */
export function PctCards({ pj, pg, pe, pp, labels = ['Ganados', 'Empatados', 'Perdidos'] }: {
  pj: number; pg: number; pe: number; pp: number; labels?: [string, string, string]
}) {
  const pct = (n: number) => (pj ? ((n / pj) * 100).toFixed(1) + '%' : '0%')
  const cards: { n: number; label: string; bg: string; color: string; pctColor: string }[] = [
    { n: pg, label: labels[0], bg: '#14532d', color: '#4ade80', pctColor: 'rgba(74,222,128,0.7)' },
    { n: pe, label: labels[1], bg: '#422006', color: '#fbbf24', pctColor: 'rgba(251,191,36,0.7)' },
    { n: pp, label: labels[2], bg: '#450a0a', color: '#f87171', pctColor: 'rgba(248,113,113,0.7)' },
  ]
  return (
    <div className="grid grid-cols-3 gap-2.5 p-4 border-b border-[#e2e8f0]">
      {cards.map(c => (
        <div key={c.label} className="text-center" style={{ background: c.bg, borderRadius: 12, padding: 16 }}>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: c.color, lineHeight: 1, marginBottom: 4 }}>{c.n}</div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
            {c.label} <span style={{ color: c.pctColor, fontSize: '0.75rem' }}>{pct(c.n)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Lista de partidos estilo .perfil-partido-row (fecha · resultado · marcador · vs rival · torneo). */
export function FichaPartidoLista({ partidos }: { partidos: Partido[] }) {
  if (partidos.length === 0) {
    return <div className="py-8 text-center text-[#94a3b8] text-sm">Sin partidos registrados</div>
  }
  return (
    <div>
      {partidos.map(p => {
        const local = gecEsLocal(p)
        const res: 'V' | 'E' | 'D' = p.gecGF > p.gecGC ? 'V' : p.gecGF === p.gecGC ? 'E' : 'D'
        const resBg = res === 'V' ? '#16a34a' : res === 'E' ? '#ca8a04' : '#dc2626'
        const rival = local ? p.visitante : p.local
        const fechaFmt = p.fecha
          ? new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
          : '—'
        return (
          <Link key={p.id} href={`/partido/partido-${p.id}`}
            className="flex items-center gap-3 px-4 sm:px-6 py-2.5 border-b border-[#f1f5f9] text-[0.85rem] hover:bg-[#f8fafc] transition-colors">
            <span className="text-[#475569] min-w-[64px] sm:min-w-[72px] shrink-0">{fechaFmt}</span>
            <span className="w-[22px] h-[22px] rounded-[5px] text-[0.7rem] font-extrabold flex items-center justify-center shrink-0 text-white" style={{ background: resBg }}>{res}</span>
            <span className="font-bold text-[#1e293b] tabular-nums min-w-[40px] text-center shrink-0">{p.gl}-{p.gv}</span>
            <span className="flex-1 min-w-0 truncate text-[#1e293b] font-medium">vs {rival}</span>
            <span className="text-[#94a3b8] text-[0.72rem] text-right hidden sm:block shrink-0 max-w-[170px] truncate">{p.torneo}</span>
          </Link>
        )
      })}
    </div>
  )
}

/** Barra de título oscura para la lista de partidos (clon de .perfil-partidos-title). */
export function PartidosTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2" style={{ background: '#162032', padding: '14px 22px' }}>
      <span className="text-white font-bold text-[1rem]">{children}</span>
      {right}
    </div>
  )
}
