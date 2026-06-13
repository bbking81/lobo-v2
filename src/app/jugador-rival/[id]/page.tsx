import { notFound } from 'next/navigation'
import { getApiData, fotoUrl } from '@/lib/api'
import { PerfilAvatar, FichaPartidoLista, PartidosTitle } from '@/components/ficha'
import Flag from '@/components/Flag'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getApiData()
  const j = data.jugadoresRivales.find(x => x.id === parseInt(id))
  return { title: j ? `${j.nombre}` : 'Jugador rival no encontrado' }
}

export default async function JugadorRivalPage({ params }: Props) {
  const { id } = await params
  const data = await getApiData()
  const jugador = data.jugadoresRivales.find(x => x.id === parseInt(id))
  if (!jugador) notFound()

  const nombre = jugador.nombre.toLowerCase()
  let totalGoles = 0, totalTA = 0, totalTR = 0
  const partidos = data.partidos
    .filter(p => {
      if (!p.publicado) return false
      const fila = (p.planillaRival ?? []).find(r => (r.jugador || '').toLowerCase() === nombre)
      if (!fila) return false
      totalGoles += fila.goles ?? 0
      totalTA += fila.amarillas ?? 0
      totalTR += fila.rojas ?? 0
      return true
    })
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  if (partidos.length === 0) notFound()

  const foto = fotoUrl(jugador.foto)
  const initials = (jugador.apellido || jugador.nombre).slice(0, 2).toUpperCase()

  // Stats desde la óptica de GEC en los partidos que jugó este rival.
  let pg = 0, pe = 0, pp = 0
  for (const p of partidos) {
    if (p.gecGF > p.gecGC) pg++
    else if (p.gecGF === p.gecGC) pe++
    else pp++
  }

  const gecBoxes: { num: number; label: string; bg: string; border: string; color: string; lblColor: string }[] = [
    { num: partidos.length, label: 'Partidos vs GYE', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.15)', color: '#fff', lblColor: 'rgba(255,255,255,0.55)' },
    { num: pg, label: 'Victorias', bg: 'rgba(20,83,45,0.6)', border: 'rgba(74,222,128,0.2)', color: '#4ade80', lblColor: 'rgba(74,222,128,0.65)' },
    { num: pe, label: 'Empates', bg: 'rgba(113,63,18,0.6)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24', lblColor: 'rgba(251,191,36,0.65)' },
    { num: pp, label: 'Derrotas', bg: 'rgba(127,29,29,0.6)', border: 'rgba(248,113,113,0.2)', color: '#f87171', lblColor: 'rgba(248,113,113,0.65)' },
  ]

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 space-y-3">

        {/* Header oscuro */}
        <div className="flex flex-col lg:flex-row items-center gap-6 rounded-[10px]" style={{ background: '#162032', padding: '32px 28px 24px' }}>
          <PerfilAvatar foto={foto} initials={initials} size={140} />
          <div className="flex-1 text-center lg:text-left">
            <div className="uppercase" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', marginBottom: 6 }}>{jugador.posicion || 'Jugador rival'}</div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>{jugador.nombre}</h1>
            <div className="flex flex-wrap gap-3 items-center justify-center lg:justify-start" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {jugador.equipo && <span className="flex items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                {jugador.equipo}</span>}
              {jugador.pais && <span className="flex items-center gap-1.5" style={{ fontSize: '0.85rem' }}><Flag pais={jugador.pais} size={20} /> {jugador.pais}</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {gecBoxes.map(b => (
              <div key={b.label} className="flex flex-col items-center justify-center gap-1.5 text-center" style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 12, width: 96, height: 90 }}>
                <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: b.color, lineHeight: 1 }}>{b.num}</div>
                <div className="uppercase" style={{ fontSize: '0.58rem', color: b.lblColor, letterSpacing: '0.07em', lineHeight: 1.3 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-lg" style={{ padding: '10px 16px' }}>
          <span className="inline-flex items-center justify-center shrink-0" style={{ width: 18, height: 18, borderRadius: '50%', background: '#fee2e2' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', display: 'block' }} />
          </span>
          <span className="italic" style={{ fontSize: '0.79rem', color: '#475569' }}>Victorias, empates y derrotas desde la perspectiva de Gimnasia y Esgrima en los partidos en los que participó este jugador.</span>
        </div>

        {/* Tarjetas Goles / TA / TR */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="flex flex-col items-center justify-center gap-1.5 text-center" style={{ background: '#422006', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 12, padding: '14px 8px' }}>
            <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{totalGoles}</div>
            <div className="uppercase" style={{ fontSize: '0.6rem', color: '#fcd34d', letterSpacing: '0.07em' }}>Goles a GYE</div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 text-center" style={{ background: '#422006', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 12, padding: '14px 8px' }}>
            <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{totalTA}</div>
            <div className="uppercase" style={{ fontSize: '0.6rem', color: '#fcd34d', letterSpacing: '0.07em' }}>Tarjetas amarillas</div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 text-center" style={{ background: '#450a0a', border: '1px solid rgba(248,113,113,0.35)', borderRadius: 12, padding: '14px 8px' }}>
            <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', lineHeight: 1 }}>{totalTR}</div>
            <div className="uppercase" style={{ fontSize: '0.6rem', color: '#fca5a5', letterSpacing: '0.07em' }}>Tarjetas rojas</div>
          </div>
        </div>

        {/* Lista de partidos */}
        <div className="bg-white rounded-[10px] border border-[#e2e8f0] overflow-hidden">
          <PartidosTitle>{partidos.length} partido{partidos.length !== 1 ? 's' : ''} registrado{partidos.length !== 1 ? 's' : ''}</PartidosTitle>
          <FichaPartidoLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
