import { notFound } from 'next/navigation'
import { getApiData } from '@/lib/api'
import PartidoMiniLista from '@/components/PartidoMiniLista'
import FichaStats from '@/components/FichaStats'
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

  const partidos = data.partidos
    .filter(p => p.publicado && (p.arbitro || '').toLowerCase() === arbitro.nombre.toLowerCase())
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  const v = arbitro.v ?? arbitro.pg
  const e = arbitro.e ?? arbitro.pe
  const d = arbitro.d ?? arbitro.pp
  const pj = arbitro.pj || (v + e + d)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="bg-[#1e3a5f] rounded-xl p-5 text-white">
          <p className="text-[#93c5fd] text-xs uppercase tracking-widest mb-1">Árbitro</p>
          <h1 className="font-black text-xl leading-tight">{arbitro.apellido}, {arbitro.nombres}</h1>
          {arbitro.pais && <p className="text-[#93c5fd] text-sm mt-1">{arbitro.pais}</p>}
        </div>

        <FichaStats pj={pj} pg={v} pe={e} pp={d} labels={['V', 'E', 'D']} />

        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 bg-[#f1f5f9] border-b border-[#e2e8f0]">
            <span className="text-[0.8rem] font-bold text-[#1e293b]">Partidos dirigidos ({partidos.length})</span>
          </div>
          <PartidoMiniLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
