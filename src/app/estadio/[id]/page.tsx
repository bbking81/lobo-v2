import { notFound } from 'next/navigation'
import { getApiData } from '@/lib/api'
import { DarkStatGrid, PctCards, FichaPartidoLista } from '@/components/ficha'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getApiData()
  const e = data.estadios.find(x => x.id === parseInt(id))
  return { title: e ? `${e.nombre} | Lobo Entrerriano` : 'Estadio no encontrado' }
}

export default async function EstadioPage({ params }: Props) {
  const { id } = await params
  const data = await getApiData()
  const estadio = data.estadios.find(x => x.id === parseInt(id))
  if (!estadio) notFound()

  const partidos = data.partidos
    .filter(p => p.publicado && (p.estadio || '').toLowerCase() === estadio.nombre.toLowerCase())
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  const lugar = [estadio.ciudad, estadio.provincia, estadio.pais].filter(Boolean).join(', ')

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 space-y-4">

        {/* Ficha header + stats */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          {/* Header oscuro centrado con foto */}
          <div className="flex flex-col items-center gap-4 text-center" style={{ background: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', padding: 24 }}>
            {estadio.fotoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={estadio.fotoUrl} alt={estadio.nombre} style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(255,255,255,0.15)' }} />
              : <div className="flex items-center justify-center" style={{ width: 200, height: 140, borderRadius: 12, background: '#1e293b', border: '2px solid rgba(255,255,255,0.08)' }}>
                  <svg width="48" height="48" fill="none" stroke="#334155" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                </div>}
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{estadio.nombre}</div>
              {lugar && <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>📍 {lugar}</div>}
              {estadio.equipo && <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>⚽ {estadio.equipo}</div>}
              {estadio.capacidad ? <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>👥 Capacidad: {estadio.capacidad.toLocaleString('es-AR')}</div> : null}
            </div>
          </div>

          <DarkStatGrid cols={2} items={[
            { num: estadio.pj || 0, label: 'Jugados', color: '#fff', bg: '#1e2d42' },
            { num: estadio.pg || 0, label: 'Ganados', color: '#4ade80', bg: '#14532d' },
            { num: estadio.pe || 0, label: 'Empatados', color: '#fbbf24', bg: '#422006' },
            { num: estadio.pp || 0, label: 'Perdidos', color: '#f87171', bg: '#450a0a' },
          ]} />
          <PctCards pj={estadio.pj} pg={estadio.pg} pe={estadio.pe} pp={estadio.pp} />
        </div>

        {/* Lista de partidos */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="flex items-center gap-2.5" style={{ background: '#f1f5f9', padding: '12px 18px', borderBottom: '1px solid #e2e8f0' }}>
            <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            <span className="text-[0.9rem] font-bold text-[#475569]">{partidos.length} partido{partidos.length !== 1 ? 's' : ''} en este estadio</span>
          </div>
          <FichaPartidoLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
