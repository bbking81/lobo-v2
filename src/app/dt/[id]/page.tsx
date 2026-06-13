import { notFound } from 'next/navigation'
import { getApiData, fotoUrl } from '@/lib/api'
import { PerfilAvatar, FichaPartidoLista, PartidosTitle } from '@/components/ficha'
import Flag from '@/components/Flag'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getApiData()
  const d = data.dts.find(x => x.id === parseInt(id))
  return { title: d ? `${d.nombre}` : 'DT no encontrado' }
}

export default async function DTPage({ params }: Props) {
  const { id } = await params
  const data = await getApiData()
  const dt = data.dts.find(x => x.id === parseInt(id))
  if (!dt) notFound()

  const partidos = data.partidos
    .filter(p => p.publicado && (p.dtGimnasia || '').toLowerCase() === dt.nombre.toLowerCase())
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  const foto = fotoUrl(dt.fotoUrl ?? dt.foto)
  const initials = (dt.apellido || dt.nombre).slice(0, 2).toUpperCase()
  const lugar = [dt.ciudad, dt.provincia].filter(Boolean).join(', ')
  const edad = dt.nacimiento
    ? Math.floor((Date.now() - new Date(dt.nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null
  const nacFmt = dt.nacimiento
    ? new Date(dt.nacimiento + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  const pts = dt.pg * 3 + dt.pe
  const maxPts = dt.pj * 3
  const pct = maxPts > 0 ? ((pts / maxPts) * 100).toFixed(2) : '0.00'

  const statBoxes: { num: number; label: string; bg: string; color: string }[] = [
    { num: dt.pj, label: 'Partidos', bg: 'rgba(255,255,255,0.1)', color: '#fff' },
    { num: dt.pg, label: 'Ganados', bg: 'rgba(20,83,45,0.55)', color: '#4ade80' },
    { num: dt.pe, label: 'Empates', bg: 'rgba(113,63,18,0.55)', color: '#fbbf24' },
    { num: dt.pp, label: 'Perdidos', bg: 'rgba(127,29,29,0.55)', color: '#f87171' },
  ]

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 space-y-4">

        {/* Header oscuro */}
        <div className="flex flex-col md:flex-row items-center gap-6 rounded-[10px]" style={{ background: '#162032', padding: '32px 28px 24px' }}>
          <PerfilAvatar foto={foto} initials={initials} size={140} />
          <div className="flex-1 text-center md:text-left">
            <div className="uppercase" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', marginBottom: 6 }}>Director Técnico</div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>{dt.nombre}</h1>
            <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {dt.pais && <span className="flex items-center gap-1.5" style={{ fontSize: '0.85rem' }}><Flag pais={dt.pais} size={20} /> {dt.pais}</span>}
              {nacFmt && <span className="flex items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {nacFmt}{edad ? ` · ${edad} años` : ''}</span>}
              {lugar && <span className="flex items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {lugar}</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 shrink-0">
            {statBoxes.map(s => (
              <div key={s.label} className="text-center" style={{ background: s.bg, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 18px', minWidth: 94 }}>
                <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.num}</div>
                <div className="uppercase" style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de partidos */}
        <div className="bg-white rounded-[10px] border border-[#e2e8f0] overflow-hidden">
          <PartidosTitle right={pts > 0 ? (
            <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>
              {pts} pts de {maxPts} ({pct}%)
            </span>
          ) : undefined}>
            Total: <span style={{ color: '#ef4444' }}>{partidos.length}</span> partido{partidos.length !== 1 ? 's' : ''} como DT
          </PartidosTitle>
          <FichaPartidoLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
