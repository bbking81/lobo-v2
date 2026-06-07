import { notFound } from 'next/navigation'
import { getApiData } from '@/lib/api'
import PartidoMiniLista from '@/components/PartidoMiniLista'
import FichaStats from '@/components/FichaStats'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getApiData()
  const d = data.dts.find(x => x.id === parseInt(id))
  return { title: d ? `${d.nombre} | Lobo Entrerriano` : 'DT no encontrado' }
}

export default async function DTPage({ params }: Props) {
  const { id } = await params
  const data = await getApiData()
  const dt = data.dts.find(x => x.id === parseInt(id))
  if (!dt) notFound()

  const partidos = data.partidos
    .filter(p => p.publicado && (p.dtGimnasia || '').toLowerCase() === dt.nombre.toLowerCase())
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="bg-[#1e3a5f] rounded-xl p-5 text-white">
          <p className="text-[#93c5fd] text-xs uppercase tracking-widest mb-1">Director Técnico</p>
          <h1 className="font-black text-xl leading-tight">{dt.apellido}, {dt.nombres}</h1>
          {dt.pais && <p className="text-[#93c5fd] text-sm mt-1">{dt.pais}</p>}
        </div>

        <FichaStats pj={dt.pj} pg={dt.pg} pe={dt.pe} pp={dt.pp} />

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
