import { notFound } from 'next/navigation'
import { getApiData } from '@/lib/api'
import PartidoMiniLista from '@/components/PartidoMiniLista'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getApiData()
  const j = data.jugadoresRivales.find(x => x.id === parseInt(id))
  return { title: j ? `${j.nombre} | Lobo Entrerriano` : 'Jugador rival no encontrado' }
}

export default async function JugadorRivalPage({ params }: Props) {
  const { id } = await params
  const data = await getApiData()
  const jugador = data.jugadoresRivales.find(x => x.id === parseInt(id))
  if (!jugador) notFound()

  const nombre = jugador.nombre.toLowerCase()
  let golesAGec = 0
  const partidos = data.partidos
    .filter(p => {
      if (!p.publicado) return false
      const fila = (p.planillaRival ?? []).find(r => (r.jugador || '').toLowerCase() === nombre)
      if (!fila) return false
      golesAGec += fila.goles ?? 0
      return true
    })
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  if (partidos.length === 0) notFound()

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="bg-[#1e3a5f] rounded-xl p-5 text-white">
          <p className="text-[#93c5fd] text-xs uppercase tracking-widest mb-1">{jugador.posicion ?? 'Jugador rival'}</p>
          <h1 className="font-black text-xl leading-tight">{jugador.apellido}, {jugador.nombres}</h1>
          {jugador.equipo && <p className="text-[#93c5fd] text-sm mt-1">{jugador.equipo}</p>}
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] grid grid-cols-2 divide-x divide-[#f1f5f9]">
          <div className="flex flex-col items-center py-4 gap-1">
            <span className="text-[1.6rem] font-black text-[#1e293b] tabular-nums">{partidos.length}</span>
            <span className="text-[0.65rem] text-[#94a3b8] uppercase tracking-wide">PJ vs GEC</span>
          </div>
          <div className="flex flex-col items-center py-4 gap-1">
            <span className="text-[1.6rem] font-black text-[#dc2626] tabular-nums">{golesAGec}</span>
            <span className="text-[0.65rem] text-[#94a3b8] uppercase tracking-wide">Goles a GEC</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 bg-[#f1f5f9] border-b border-[#e2e8f0]">
            <span className="text-[0.8rem] font-bold text-[#1e293b]">Partidos contra Gimnasia ({partidos.length})</span>
          </div>
          <PartidoMiniLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
