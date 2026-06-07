import { notFound } from 'next/navigation'
import { getApiData } from '@/lib/api'
import { DarkStatGrid, PctCards, FichaPartidoLista, PartidosTitle } from '@/components/ficha'
import Flag from '@/components/Flag'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getApiData()
  const a = data.arbitros.find(x => x.id === parseInt(id))
  return { title: a ? `${a.nombre} | Lobo Entrerriano` : 'Árbitro no encontrado' }
}

export default async function ArbitroPage({ params }: Props) {
  const { id } = await params
  const data = await getApiData()
  const arbitro = data.arbitros.find(x => x.id === parseInt(id))
  if (!arbitro) notFound()

  const nombre = arbitro.nombre.toLowerCase()
  const eq = (v?: string) => (v || '').toLowerCase() === nombre

  const partidos = data.partidos
    .filter(p => p.publicado && eq(p.arbitro))
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  // Otros roles, computados de los partidos publicados.
  let pjA = 0, pjC = 0, pjV = 0, pjAV = 0
  for (const p of data.partidos) {
    if (!p.publicado) continue
    if (eq(p.asistente1) || eq(p.asistente2)) pjA++
    if (eq(p.cuarto)) pjC++
    if (eq(p.var)) pjV++
    if (eq(p.avar)) pjAV++
  }

  const v = arbitro.v ?? arbitro.pg
  const e = arbitro.e ?? arbitro.pe
  const d = arbitro.d ?? arbitro.pp
  const pj = arbitro.pj || (v + e + d)

  const roles: { num: number; label: string; color: string }[] = [
    { num: pjA, label: 'Asistente', color: '#1e293b' },
    { num: pjC, label: '4° Árbitro', color: '#1e293b' },
    { num: pjV, label: 'VAR', color: '#7c3aed' },
    { num: pjAV, label: 'AVAR', color: '#7c3aed' },
  ].filter(r => r.num > 0)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 space-y-4">

        {/* Ficha header + stats */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          {/* Header oscuro */}
          <div className="flex items-center gap-6" style={{ background: 'linear-gradient(135deg,#1e2d42 0%,#0f1e35 100%)', padding: '28px 32px' }}>
            <div className="shrink-0 flex items-center justify-center" style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '3px solid rgba(255,255,255,0.2)' }}>
              <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a6 6 0 0 1 12 0v2" /><line x1="9" y1="12" x2="15" y2="12" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="uppercase" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 6 }}>Árbitro</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>{arbitro.nombre}</h1>
              {arbitro.pais && <div className="flex items-center gap-1.5" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}><Flag pais={arbitro.pais} size={20} /> {arbitro.pais}</div>}
            </div>
          </div>

          <DarkStatGrid cols={2} items={[
            { num: pj, label: 'Dirigidos', color: '#fff', bg: '#1e2d42' },
            { num: v, label: 'Ganados', color: '#4ade80', bg: '#14532d' },
            { num: e, label: 'Empatados', color: '#fbbf24', bg: '#422006' },
            { num: d, label: 'Perdidos', color: '#f87171', bg: '#450a0a' },
          ]} />
          <PctCards pj={pj} pg={v} pe={e} pp={d} />

          {/* Otros roles */}
          {roles.length > 0 && (
            <div className="flex gap-3 flex-wrap p-4">
              {roles.map(r => (
                <div key={r.label} className="text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 16px' }}>
                  <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 700, color: r.color }}>{r.num}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{r.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de partidos */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <PartidosTitle>Partidos dirigidos · {partidos.length}</PartidosTitle>
          <FichaPartidoLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
