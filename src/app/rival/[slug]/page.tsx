import { notFound } from 'next/navigation'
import { getApiData } from '@/lib/api'
import { gecEsLocal, FichaPartidoLista, PartidosTitle } from '@/components/ficha'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `${decodeURIComponent(slug)} | Lobo Entrerriano` }
}

export default async function RivalPage({ params }: Props) {
  const { slug } = await params
  const rival = decodeURIComponent(slug)
  const data = await getApiData()

  const partidos = data.partidos
    .filter(p => {
      if (!p.publicado) return false
      const opp = gecEsLocal(p) ? p.visitante : p.local
      return opp === rival
    })
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  if (partidos.length === 0) notFound()

  const pj = partidos.length
  let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0
  for (const p of partidos) {
    gf += p.gecGF; gc += p.gecGC
    if (p.gecGF > p.gecGC) pg++
    else if (p.gecGF === p.gecGC) pe++
    else pp++
  }
  const dif = gf - gc
  const pct = (n: number) => (pj ? ((n / pj) * 100).toFixed(1) + '%' : '0%')
  const vPct = pj ? Math.round((pg / pj) * 100) : 0
  const ePct = pj ? Math.round((pe / pj) * 100) : 0
  const dPct = 100 - vPct - ePct

  // Escudo del rival
  const eqs = data.equipos as { nombre?: string; escudoUrl?: string }[]
  const escudoRival = eqs.find(e => (e.nombre || '').toLowerCase() === rival.toLowerCase())?.escudoUrl || null
  const initials = rival.split(' ').map(w => w[0] || '').join('').slice(0, 3).toUpperCase()

  // Frente a Frente — últimos 5
  const ultimos = partidos.slice(0, 5)
  const gecGPP = pj ? (gf / pj).toFixed(2) : '0.00'
  const rivGPP = pj ? (gc / pj).toFixed(2) : '0.00'
  const goalsPct = gf + gc > 0 ? Math.round((gf / (gf + gc)) * 100) : 50
  const gppSum = parseFloat(gecGPP) + parseFloat(rivGPP)
  const gppPct = gppSum > 0 ? Math.round((parseFloat(gecGPP) / gppSum) * 100) : 50
  const totalFF = pg + pe + pp || pj
  const gecPct = Math.round((pg / totalFF) * 100)
  const empPct = Math.round((pe / totalFF) * 100)
  const rivWPct = 100 - gecPct - empPct

  const escudoBox = (src: string | null, isGec: boolean) => (
    <div className="flex flex-col items-center gap-3 w-[160px] sm:w-[200px]">
      {src
        ? <div className="flex items-center justify-center" style={{ width: 110, height: 110, borderRadius: 20, background: '#f8fafc', border: '2px solid #e2e8f0', padding: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={isGec ? 'GEC' : rival} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        : <div className="flex items-center justify-center" style={{ width: 110, height: 110, borderRadius: 20, background: isGec ? '#dbeafe' : '#f1f5f9', border: `2px solid ${isGec ? '#bfdbfe' : '#e2e8f0'}`, fontSize: '1.4rem', fontWeight: 800, color: isGec ? '#2563eb' : '#64748b' }}>{isGec ? 'GEC' : initials}</div>}
      <div className="text-center font-extrabold text-[#1e293b]" style={{ fontSize: '1rem' }}>{isGec ? 'Gimnasia y Esgrima' : rival}</div>
    </div>
  )

  const statRow = (v1: string | number, lbl: string, v2: string | number, p: number) => (
    <div className="flex items-center gap-3 mb-3">
      <span className="font-bold text-[#1e293b] text-center" style={{ fontSize: '0.88rem', width: 36 }}>{v1}</span>
      <span className="font-semibold text-[#475569] text-center shrink-0" style={{ fontSize: '0.78rem', width: 110 }}>{lbl}</span>
      <div className="flex-1 overflow-hidden" style={{ height: 9, borderRadius: 5, background: '#e2e8f0' }}>
        {p > 0 && <div style={{ width: `${p}%`, height: '100%', background: '#2563eb', borderRadius: 5 }} />}
      </div>
      <span className="font-bold text-[#1e293b] text-center" style={{ fontSize: '0.88rem', width: 36 }}>{v2}</span>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 space-y-4">

        {/* Header escudos + stats */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="flex items-start justify-center border-b border-[#e2e8f0]" style={{ padding: '36px 24px 28px' }}>
            {escudoBox('/api/escudo-gec', true)}
            <div className="flex items-center justify-center shrink-0 text-white font-black" style={{ width: 65, height: 65, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#60a5fa)', fontSize: '1.75rem', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', margin: '22px 16px 0' }}>VS</div>
            {escudoBox(escudoRival, false)}
          </div>

          <div className="text-center" style={{ padding: '20px 0 8px' }}>
            <div className="font-extrabold text-[#1e293b]" style={{ fontSize: '2rem' }}>Historial Completo</div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2.5" style={{ padding: '16px 24px 20px' }}>
            {[
              { num: pj, label: 'Partidos', bg: '#1e2d42', color: '#fff' },
              { num: pg, label: 'Ganados', bg: '#14532d', color: '#4ade80' },
              { num: pe, label: 'Empates', bg: '#713f12', color: '#fbbf24' },
              { num: pp, label: 'Perdidos', bg: '#7f1d1d', color: '#f87171' },
            ].map(s => (
              <div key={s.label} className="text-center" style={{ background: s.bg, borderRadius: 10, padding: '16px 12px' }}>
                <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.num}</div>
                <div className="uppercase" style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Barra + goles */}
          <div className="flex items-center gap-5 flex-wrap" style={{ padding: '0 24px 20px' }}>
            <div className="flex-1" style={{ minWidth: 200 }}>
              <div className="flex overflow-hidden" style={{ height: 10, borderRadius: 6, background: '#e2e8f0' }}>
                <div style={{ width: `${vPct}%`, background: '#16a34a' }} />
                <div style={{ width: `${ePct}%`, background: '#ca8a04' }} />
                <div style={{ width: `${dPct}%`, background: '#dc2626' }} />
              </div>
              <div className="flex gap-3.5 mt-1.5" style={{ fontSize: '0.72rem' }}>
                <span className="font-semibold" style={{ color: '#16a34a' }}>{pct(pg)} victorias</span>
                <span className="font-semibold" style={{ color: '#ca8a04' }}>{pct(pe)} empates</span>
                <span className="font-semibold" style={{ color: '#dc2626' }}>{pct(pp)} derrotas</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center bg-[#f8fafc] border border-[#e2e8f0]" style={{ borderRadius: 10, padding: '10px 16px' }}>
              <div className="text-center" style={{ padding: '0 12px' }}><div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{gf}</div><div className="uppercase font-semibold text-[#64748b]" style={{ fontSize: '0.68rem' }}>GF</div></div>
              <div className="self-stretch bg-[#e2e8f0]" style={{ width: 1, margin: '4px 0' }} />
              <div className="text-center" style={{ padding: '0 12px' }}><div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#64748b' }}>{gc}</div><div className="uppercase font-semibold text-[#64748b]" style={{ fontSize: '0.68rem' }}>GC</div></div>
              <div className="self-stretch bg-[#e2e8f0]" style={{ width: 1, margin: '4px 0' }} />
              <div className="text-center" style={{ padding: '0 12px' }}><div style={{ fontSize: '1.4rem', fontWeight: 800, color: dif >= 0 ? '#16a34a' : '#dc2626' }}>{dif >= 0 ? '+' : ''}{dif}</div><div className="uppercase font-semibold text-[#64748b]" style={{ fontSize: '0.68rem' }}>DIF</div></div>
            </div>
          </div>
        </div>

        {/* Frente a Frente */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5 bg-[#f1f5f9] border-b border-[#e2e8f0]" style={{ padding: '14px 18px' }}>
            <span style={{ fontSize: '1rem' }}>🆚</span>
            <span className="font-bold text-[#1e293b]" style={{ fontSize: '0.95rem' }}>Frente a Frente</span>
            <span className="font-semibold text-[#475569] ml-auto" style={{ fontSize: '0.8rem' }}>{pj} {pj === 1 ? 'antecedente' : 'antecedentes'}</span>
          </div>
          <div style={{ padding: '18px 18px 10px' }}>
            <div className="flex overflow-hidden" style={{ borderRadius: 8, height: 38, marginBottom: 12 }}>
              {gecPct > 0 && <div className="flex items-center justify-center text-white font-extrabold" style={{ width: `${gecPct}%`, background: '#2563eb', fontSize: '0.85rem' }}>{pg}</div>}
              {empPct > 0 && <div className="flex items-center justify-center text-white font-extrabold" style={{ width: `${empPct}%`, background: '#94a3b8', fontSize: '0.85rem' }}>{pe}</div>}
              {rivWPct > 0 && <div className="flex items-center justify-center text-white font-extrabold" style={{ width: `${rivWPct}%`, background: '#374151', fontSize: '0.85rem' }}>{pp}</div>}
            </div>
            <div className="flex justify-between font-semibold text-[#475569]" style={{ fontSize: '0.8rem', marginBottom: 18 }}>
              <span style={{ color: '#2563eb' }}>🐺 Gimnasia y Esgrima — {pg} victoria{pg !== 1 ? 's' : ''}</span>
              <span className="hidden sm:inline">{pe} empate{pe !== 1 ? 's' : ''}</span>
              <span style={{ color: '#374151' }}>{pp} victoria{pp !== 1 ? 's' : ''} — {rival}</span>
            </div>
            {statRow(gf, 'Goles totales', gc, goalsPct)}
            {statRow(gecGPP, 'Goles x partido', rivGPP, gppPct)}
            <div className="uppercase font-bold text-[#475569]" style={{ fontSize: '0.75rem', letterSpacing: '0.06em', margin: '12px 0 4px' }}>Últimos antecedentes</div>
          </div>
          <FichaPartidoLista partidos={ultimos} />
        </div>

        {/* Historial completo */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <PartidosTitle>Historial completo · {pj}</PartidosTitle>
          <FichaPartidoLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
