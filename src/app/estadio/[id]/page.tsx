import { notFound } from 'next/navigation'
import { getApiData } from '@/lib/api'
import PartidoMiniLista from '@/components/PartidoMiniLista'
import FichaStats from '@/components/FichaStats'
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
    .filter(p => p.publicado && p.estadio === estadio.nombre)
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

  const ubicacion = [estadio.ciudad, estadio.provincia, estadio.pais].filter(Boolean).join(', ')

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">
        {/* Ficha header */}
        <div className="bg-[#1e3a5f] rounded-xl overflow-hidden text-white">
          {estadio.fotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={estadio.fotoUrl} alt={estadio.nombre} className="w-full h-40 object-cover" />
          )}
          <div className="p-5">
            <p className="text-[#93c5fd] text-xs uppercase tracking-widest mb-1">Estadio</p>
            <h1 className="font-black text-xl leading-tight">{estadio.nombre}</h1>
            {ubicacion && <p className="text-[#93c5fd] text-sm mt-1">📍 {ubicacion}</p>}
            {estadio.capacidad ? <p className="text-[#93c5fd] text-sm">Capacidad: {estadio.capacidad.toLocaleString('es-AR')}</p> : null}
          </div>
        </div>

        <FichaStats pj={estadio.pj} pg={estadio.pg} pe={estadio.pe} pp={estadio.pp} />

        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-4 py-3 bg-[#f1f5f9] border-b border-[#e2e8f0]">
            <span className="text-[0.8rem] font-bold text-[#1e293b]">Partidos en este estadio ({partidos.length})</span>
          </div>
          <PartidoMiniLista partidos={partidos} />
        </div>
      </div>
    </main>
  )
}
